import express from "express";
import { upload } from "../middlewares/multer.js";
import UploadonCloudinary from "../config/cloudinary.js";
import { suggestCaptionAndHashtags } from "../config/aiService.js";
import isAuth from "../middlewares/isAuth.js";

const aiRouter = express.Router();

// Get visual suggestions for a Cloudinary media URL
aiRouter.post("/caption", isAuth, async (req, res) => {
    const { mediaUrl } = req.body;
    if (!mediaUrl) {
        return res.status(400).json({ message: "mediaUrl is required" });
    }

    try {
        const suggestions = await suggestCaptionAndHashtags(mediaUrl);
        return res.status(200).json(suggestions);
    } catch (error) {
        return res.status(500).json({ message: `Failed to generate suggestions: ${error.message}` });
    }
});

// Helper endpoint to upload a temporary media to Cloudinary
aiRouter.post("/upload-temp", isAuth, upload.single("media"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No media file provided" });
        }
        const mediaUrl = await UploadonCloudinary(req.file.path);
        return res.status(200).json({ mediaUrl });
    } catch (error) {
        return res.status(500).json({ message: `Cloudinary upload failed: ${error.message}` });
    }
});

export default aiRouter;
