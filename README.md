# YUPP! 🚀 — Full-Stack AI-Powered Social Application

YUPP! is a modern, full-stack social media web application built with React, Node.js, Express, MongoDB, Socket.io, and Google Gemini AI (`@google/genai`). It features real-time messaging, WebRTC video calling, Google OAuth authentication, and AI integrations.

---

## ✨ Features

### 🤖 Google Gemini AI Features
- **🪄 AI Chat Summarizer**: Summarize direct message conversations with any user using Google Gemini (`gemini-3.6-flash`).
- **✨ AI Caption & Hashtag Suggestions**: Automatically analyze uploaded photos/videos on the Upload page to generate captions, 5 relevant hashtags, and descriptive alt text.
- **🛡️ Multimodal Content Moderation**: Automatically filter text posts, comments, and direct messages for policy violations before saving.
- **🔍 AI Semantic Vector Search**: Uses multimodal embeddings (`gemini-embedding-2`) to enable natural-language conceptual search across all platform posts.

### 💬 Real-Time Chat & Video Calling
- **Direct Messaging**: Instant 1-on-1 text and image messaging powered by Socket.io and MongoDB.
- **WebRTC Video Calls**: Peer-to-peer video calling with SDP signaling, candidate queueing, and 30-second calling timeouts.
- **Live Online Status**: Real-time online/offline user status tracking.

### 🔐 Authentication & Security
- **Google OAuth 2.0**: One-click Google Sign-In via Google Identity Services.
- **Local Auth**: Password authentication with bcrypt password hashing and JWT cookies.
- **Rate Limiting**: Protected auth routes via `express-rate-limit`.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 (Vite), Redux Toolkit, TailwindCSS v4, Socket.io-client, React Router DOM v7, React Icons.
- **Backend**: Node.js, Express.js v5, Socket.io v4, Mongoose (MongoDB Atlas), `@google/genai` (Official Google GenAI SDK), Cloudinary.
- **Deployment**: Render (Web Service).

---

## 🔑 Environment Variables

### Backend (`backend/.env`):
```env
PORT=8000
MONGODB_URL=mongodb+srv://...
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## 🧭 Key API Endpoints

### 🤖 AI Routes (`/api/ai`)
- `POST /api/ai/summarize-chat`: Generates a concise AI summary of conversation history.
- `POST /api/ai/caption`: Generates AI caption, 5 hashtags, and alt text for media.
- `GET /api/ai/search?q=...`: Performs semantic vector search on posts using Gemini embeddings.

### 💬 Message Routes (`/api/message`)
- `POST /api/message/send/:receiverId`: Send direct text/image message.
- `GET /api/message/getAll/:receiverId`: Retrieve chat history with a user.
- `GET /api/message/prevChats`: Retrieve recent conversation list.

---

## 🚀 Live Deployment

- **Frontend & Backend**: Deployed on Render (`https://yupp-6o8i.onrender.com`).
