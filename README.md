# 🎨 DrawMotion

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

> **Draw with your hand—no mouse needed!**  
> A real-time, gesture-driven drawing app powered by cutting-edge computer vision.

---

🌐 **Live Demo:** [https://drawmotion.netlify.app](https://drawmotion.netlify.app)

---

## ✨ Features

- 🚀 **Instant Hand Tracking**  
  Leverages MediaPipe & OpenCV for sub-millisecond hand detection.
- 🖌️ **Gesture-Based Tools**  
  ✏️ Draw, 🖋️ Select colors, 🧹 Erase—all with simple finger poses.
- 🖼️ **Canvas History**  
  Save and revisit your masterpieces anytime in your Profile.
- 🔒 **User Auth**  
  Secure login/registration backed by MongoDB.
- 🎨 **Responsive UI**  
  Sleek Javascript + Tailwind interface with Framer Motion animations.
- 🔄 **Live Sync**  
  Real-time comms between Python tracking engine and web UI via Socket.IO.

---

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/AkshayGojiya/Draw-Motion.git
   cd Draw-Motion
   npm run dev
   node server.js   # installs both client & server deps