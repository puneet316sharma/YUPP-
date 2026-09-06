import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import UploadonCloudinary from "../config/cloudinary.js";
import { generateCaptionAndHashtags, generateMultimodalEmbedding } from "../config/geminiService.js";
import Post from "../models/post.model.js";

const aiRouter = express.Router();

// Helper function to calculate cosine similarity
const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// POST /api/ai/upload-temp
aiRouter.post("/upload-temp", isAuth, upload.single("media"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "media file is required" });
        }
        const mediaUrl = await UploadonCloudinary(req.file.path);
        return res.status(200).json({ mediaUrl });
    } catch (error) {
        console.error("Temp upload error:", error);
        return res.status(500).json({ message: `Temp upload failed: ${error.message}` });
    }
});

// POST /api/ai/caption
aiRouter.post("/caption", isAuth, async (req, res) => {
    const { mediaUrl, mediaType } = req.body;
    if (!mediaUrl || !mediaType) {
        return res.status(400).json({ message: "mediaUrl and mediaType are required" });
    }

    try {
        const suggestions = await generateCaptionAndHashtags(mediaUrl, mediaType);
        return res.status(200).json(suggestions);
    } catch (error) {
        console.error("Caption generation router error:", error);
        return res.status(500).json({ message: `Caption generation failed: ${error.message}` });
    }
});

// GET /api/ai/search
aiRouter.get("/search", isAuth, async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim() === "") {
        return res.status(400).json({ message: "Search query q is required" });
    }

    try {
        // 1. Generate text embedding for the search query
        const queryVector = await generateMultimodalEmbedding({ text: q });
        if (!queryVector) {
            return res.status(500).json({ message: "Failed to generate query embedding" });
        }

        // 2. Fetch all posts that have an embedding
        const posts = await Post.find({ embedding: { $exists: true, $not: { $size: 0 } } })
            .populate("author", "name username profileImage");

        // 3. Compute similarity scores
        // Fallback: Local/in-app cosine similarity calculation.
        // Comment: In a production environment, MongoDB Atlas Vector Search index should replace this.
        const scoredPosts = posts.map(post => {
            const score = cosineSimilarity(queryVector, post.embedding);
            return { post, score };
        });

        // 4. Sort descending and filter top results
        scoredPosts.sort((a, b) => b.score - a.score);
        const results = scoredPosts
            .filter(item => item.score > 0.1) // Minimum similarity threshold
            .map(item => item.post);

        return res.status(200).json(results);
    } catch (error) {
        console.error("Semantic search router error:", error);
        return res.status(500).json({ message: `Search error: ${error.message}` });
    }
});

export default aiRouter;
