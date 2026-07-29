# YUPP! 🚀

YUPP! is a full-stack social media application built as a learning project to explore modern web development. It focuses on implementing real-world features while gaining hands-on experience with frontend development, backend APIs, authentication, databases, and deployment.

## ✨ Features

* User authentication
* Create, edit, and delete posts
* Like and comment system
* User profiles
* Responsive UI

## 🛠️ Tech Stack

* React
* Node.js
* Express.js
* MongoDB
* JWT
# YUPP! 🚀

YUPP! is a full-stack social media application built as a learning project to explore modern web development. It focuses on implementing real-world features while gaining hands-on experience with frontend development, backend APIs, authentication, databases, and deployment.

## ✨ Features

* User authentication
* Create, edit, and delete posts
* Like and comment system
* User profiles
* Responsive UI

## 🛠️ Tech Stack

* React
* Node.js
* Express.js
* MongoDB
* JWT
* Git & GitHub

## 🎯 Purpose

The primary goal of YUPP! is to learn full-stack development by building a complete, production-inspired application and understanding how different technologies work together.

## 🚀 Recent Enhancements (Google Auth, WebRTC Video Calling)

This project has been extended with the following major features:
1. **Google OAuth 2.0 Authentication**: Log in/sign up seamlessly using Google.
2. **WebRTC Video Calling**: Real-time video/audio calling with active-call cleanups and device toggling.

---

### 📦 New NPM Packages

#### Backend:
- `google-auth-library`: For validating Google Identity Services credentials server-side.
- `express-rate-limit`: Prevents route abuse and controls backend API usage.

---

### 🔑 New Environment Variables

#### Backend (`backend/.env`):
- `GOOGLE_CLIENT_ID`: Your Google OAuth 2.0 Web Client ID.
- `FRONTEND_URL` *(Optional)*: Dev or production frontend host (defaults to `http://localhost:5173`).
- `COOKIE_SECURE` *(Optional)*: Set `true` to require HTTPS cookies (defaults to `true` in production).
- `COOKIE_SAME_SITE` *(Optional)*: Set cookie same-site policy (e.g. `None`, `Lax`, `Strict`).

#### Frontend (`frontend/.env`):
- `VITE_GOOGLE_CLIENT_ID`: Web Client ID matching the backend.

---

### 🧭 New API Routes

#### Authentication:
- `POST /api/auth/google`: Handles Google credential validation, linking, and cookie-based JWT issuance.

---

### 🌐 Google Cloud Console OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Search for **APIs & Services** > **OAuth consent screen** and configure it.
4. Navigate to **Credentials** > **Create Credentials** > **OAuth client ID**.
5. Select **Application type**: `Web application`.
6. Add **Authorized JavaScript origins**:
   - For Dev: `http://localhost:5173` and `http://127.0.0.1:5173`
   - For Prod: Your deployment URL (e.g. `https://yupp-wn71.onrender.com`).
7. Click **Create** and copy your **Client ID**.
8. Paste the Client ID into the backend and frontend environment configurations.

## 🚧 Status

This project is actively under development, with new features and improvements being added regularly.
