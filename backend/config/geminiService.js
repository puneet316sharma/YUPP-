import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import os from "os";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key" });

// Downloads media from Cloudinary (or any URL) to memory buffer and returns base64 + mimeType
const downloadMedia = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch media from URL: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";
    return { base64Data, mimeType: contentType, buffer };
};

// Saves memory buffer to a temporary file for the Gemini File API (required for videos)
const saveTempFile = async (buffer, mimeType) => {
    const ext = mimeType.split("/")[1] || "mp4";
    const tempDir = os.tmpdir();
    const tempPath = path.join(tempDir, `gemini_temp_${Date.now()}.${ext}`);
    await fs.promises.writeFile(tempPath, buffer);
    return tempPath;
};

// Deletes the temporary file uploaded to Gemini
const cleanupGeminiFile = async (fileName) => {
    if (fileName) {
        try {
            await ai.files.delete({ name: fileName });
            console.log("Deleted temporary Gemini file:", fileName);
        } catch (e) {
            console.error("Failed to delete temporary Gemini file:", e);
        }
    }
};

// Internal helper to prepare the media part (either inline base64 for images or File API URI for videos)
const getMediaPart = async (mediaUrl, mediaType) => {
    const mediaResponse = await downloadMedia(mediaUrl);
    if (mediaType === "video") {
        const tempPath = await saveTempFile(mediaResponse.buffer, mediaResponse.mimeType);
        console.log("Uploading video to Gemini File API...");
        let videoFile = await ai.files.upload({
            file: tempPath,
            mimeType: mediaResponse.mimeType
        });
        
        // Wait for ACTIVE state (Gemini needs to process video files before use)
        while (videoFile.state === "PROCESSING") {
            await new Promise(resolve => setTimeout(resolve, 2000));
            videoFile = await ai.files.get({ name: videoFile.name });
        }
        
        if (videoFile.state !== "ACTIVE") {
            throw new Error(`Gemini File API processing failed: ${videoFile.state}`);
        }
        
        // Clean up local temp file
        try {
            await fs.promises.unlink(tempPath);
        } catch (e) {
            console.error("Failed to clean up local temp file:", e);
        }
        
        return {
            part: {
                fileData: {
                    fileUri: videoFile.uri,
                    mimeType: videoFile.mimeType
                }
            },
            fileName: videoFile.name
        };
    } else {
        // Image
        return {
            part: {
                inlineData: {
                    mimeType: mediaResponse.mimeType,
                    data: mediaResponse.base64Data
                }
            },
            fileName: null
        };
    }
};

/**
 * A. Suggests caption, hashtags, and alt text for images or videos.
 */
export const generateCaptionAndHashtags = async (mediaUrl, mediaType) => {
    let fileName = null;
    try {
        const mediaData = await getMediaPart(mediaUrl, mediaType);
        fileName = mediaData.fileName;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                mediaData.part,
                { text: "Suggest a caption (under 20 words), exactly 5 relevant hashtags, and a brief descriptive altText (for screen readers) for this media. Respond with a JSON object containing keys 'caption' (string), 'hashtags' (array of 5 strings), and 'altText' (string). Do not add any markdown formatting outside of the JSON." }
            ],
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text.trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Caption Generation Error:", error);
        throw error;
    } finally {
        if (fileName) {
            await cleanupGeminiFile(fileName);
        }
    }
};

/**
 * B. Moderates text and media content before saving.
 * Fail open (returns allowed: true) if there is an API error.
 */
export const moderateContent = async ({ text, mediaUrl }) => {
    if (!process.env.GEMINI_API_KEY) {
        return { allowed: true, reason: "" };
    }
    let fileName = null;
    try {
        const contents = [];
        if (mediaUrl) {
            const isVideo = mediaUrl.includes(".mp4") || mediaUrl.includes("/video/");
            const mediaData = await getMediaPart(mediaUrl, isVideo ? "video" : "image");
            contents.push(mediaData.part);
            fileName = mediaData.fileName;
        }

        const promptText = `Analyze the following text${mediaUrl ? " and media content" : ""} for harassment, hate speech, explicit content (NSFW, pornography), spam, or scam links. Determine if it is allowed on a general social media platform.
Text to analyze: "${text || ""}"

Respond with a JSON object containing keys:
'allowed' (boolean, false if it violates policies, true if allowed)
'reason' (string, explanation of the violation, or empty string if allowed)

Do not add any markdown formatting outside of the JSON.`;

        contents.push({ text: promptText });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json"
            }
        });

        const responseText = response.text.trim();
        return JSON.parse(responseText);
    } catch (error) {
        console.error("Gemini Moderation Error (Failing Open):", error);
        // Fail open so a transient API error never blocks real users
        return { allowed: true, reason: "" };
    } finally {
        if (fileName) {
            await cleanupGeminiFile(fileName);
        }
    }
};

/**
 * C. Generates a multimodal embedding for posts (caption + media)
 */
export const generateMultimodalEmbedding = async ({ text, mediaUrl, mediaType }) => {
    try {
        const contents = [];
        if (text && text.trim() !== "") {
            contents.push({ text: text });
        }
        if (mediaUrl) {
            const mediaResponse = await downloadMedia(mediaUrl);
            contents.push({
                inlineData: {
                    mimeType: mediaResponse.mimeType,
                    data: mediaResponse.base64Data
                }
            });
        }

        if (contents.length === 0) {
            contents.push({ text: "empty post" });
        }

        const response = await ai.models.embedContent({
            model: "gemini-embedding-2",
            contents: contents
        });

        if (response && response.embedding && response.embedding.values) {
            return response.embedding.values;
        }
        return null;
    } catch (error) {
        console.error("Gemini Multimodal Embedding Error:", error);
        return null;
    }
};

/**
 * D. Summarizes chat conversation messages using Gemini.
 */
export const summarizeConversation = async ({ messagesText, otherUserName, currentUserName }) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return "Gemini API key is not configured. Unable to summarize chat.";
        }
        if (!messagesText || messagesText.trim() === "") {
            return `No message history available to summarize with ${otherUserName}.`;
        }

        const promptText = `You are an AI assistant in a social chat application called YUPP.
Summarize the following chat conversation between ${currentUserName || "User"} and ${otherUserName || "Other User"}.
Focus on:
1. Main topics discussed.
2. Key messages, questions, or requests sent by ${otherUserName}.
3. Any important decisions or action items.

Keep the summary clear, friendly, and concise (under 120 words), formatted cleanly with bullet points if helpful.

Chat Log:
${messagesText}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ text: promptText }]
        });

        return response.text.trim();
    } catch (error) {
        console.error("Gemini Summarization Error:", error);
        return `Failed to generate summary: ${error.message}`;
    }
};
