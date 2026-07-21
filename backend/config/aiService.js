import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

// Fallback to dummy key if not present to avoid server crash on startup
const apiKey = process.env.ANTHROPIC_API_KEY || "dummy_key";
const anthropic = new Anthropic({
    apiKey: apiKey,
});

export const suggestCaptionAndHashtags = async (imageUrl) => {
    try {
        if (apiKey === "dummy_key") {
            return {
                caption: "This is a beautiful placeholder caption (Configure ANTHROPIC_API_KEY).",
                hashtags: ["placeholder", "yupp", "social", "ai", "awesome"]
            };
        }

        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }
        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

        let mediaType = "image/jpeg";
        if (contentType.includes("png")) mediaType = "image/png";
        else if (contentType.includes("gif")) mediaType = "image/gif";
        else if (contentType.includes("webp")) mediaType = "image/webp";

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 300,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mediaType,
                                data: base64Data,
                            },
                        },
                        {
                            type: "text",
                            text: "Suggest a caption (under 20 words) and exactly 5 relevant hashtags for this image. Respond with a JSON object containing keys 'caption' (string) and 'hashtags' (array of 5 strings). Do not output any markdown formatting, code block markers, or other text outside the JSON object.",
                        }
                    ],
                }
            ],
        });

        let text = response.content[0].text.trim();
        if (text.startsWith("```")) {
            text = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }
        
        return JSON.parse(text);
    } catch (error) {
        console.error("AI Caption Suggestion Error:", error);
        throw error;
    }
};

export const moderateText = async (text) => {
    try {
        if (!text || text.trim() === "") {
            return { allowed: true, reason: "" };
        }

        if (apiKey === "dummy_key") {
            return { allowed: true, reason: "" };
        }

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 200,
            messages: [
                {
                    role: "user",
                    content: `Analyze the following text for harassment, hate speech, explicit content (NSFW/pornographic), and spam links. 
Determine if it is allowed on a general social media platform.
Respond with a JSON object containing keys 'allowed' (boolean) and 'reason' (string, explain why it's not allowed, or empty string if it is allowed). 
Do not output any markdown formatting, code block markers, or other text outside the JSON object.

Text to analyze:
"${text}"`,
                }
            ],
        });

        let responseText = response.content[0].text.trim();
        if (responseText.startsWith("```")) {
            responseText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }

        return JSON.parse(responseText);
    } catch (error) {
        console.error("AI Moderation Error:", error);
        // Fail open as requested
        return { allowed: true, reason: "" };
    }
};
