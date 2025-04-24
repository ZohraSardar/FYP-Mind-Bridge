<<<<<<< HEAD
# FYP-MindBridge
=======
# 🧠 MindBridge

**MindBridge** is an interactive web-based learning platform designed specifically for autistic children aged **4–7**. It provides a fun, structured, and voice-assisted learning environment to support early development through visual, auditory, and interactive activities.

---

## 🌟 Key Features

- 🎯 **Adaptive Learning**  
  Dynamically adjusts difficulty based on user performance, ensuring a personalized learning path for every child.

- 📊 **Progress Report Generation**  
  Automatically tracks user performance and generates detailed reports for parents, educators, and therapists.

- 🎨 **Child-Friendly Design**  
  Full-screen layout, bright visuals, large buttons, and voice narration for a delightful and accessible experience.

---

## 📚 Core Modules

### 1. 👋 Gesture Learning  
Teaches common daily gestures using large emojis, animations, and speech guidance.

- Practice Mode: Step-by-step animated guidance  
- Quiz Mode: Timed scenarios with feedback and scoring

### 2. 🔺 Shapes & Colors  
Introduces children to shapes and colors through matching games, animations, and speech feedback.

### 3. 🔢 Basic Math  
Builds foundational math skills like counting, addition, and subtraction using interactive visuals and spoken instructions.

### 4. 🧠 Object Identification  
Helps children recognize everyday objects using sound, images, and context-based mini-games.

---

## 👨‍👩‍👧‍👦 Who It’s For

- Autistic children aged 4–7  
- Parents and caregivers  
- Special educators and therapists  

---

## 🛠️ Technologies Used

- **Frontend**: React, TypeScript  
- **Backend**: Node.js  
- **Authentication & Database**: Firebase (Authentication, Firestore, Hosting)  

---

## 📦 Dependencies

Ensure the following tools are installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)  
- [npm](https://www.npmjs.com/) (comes with Node.js)  
- [Visual Studio Code](https://code.visualstudio.com/)  
- [Firebase CLI](https://firebase.google.com/docs/cli)  
  ```bash
  npm install -g firebase-tools
🚀 How to Run Locally

**1.Clone the repository**
git clone https://github.com/yourusername/mindbridge.git
cd mindbridge

**2.Install dependencies**
npm install

**3.Set up Firebase**
Create a project on Firebase Console
Go to Project Settings → General → Add Web App
Copy your Firebase config and add it to a .env file at the root:

ini
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

**4.Start the server**
npm run dev
Open in your browser
Visit http://localhost:5173 or the port shown in your terminal.

**📈 Dataset & Analytics**
MindBridge simulates real usage data from 500+ game sessions played by 50–60 autistic children to support adaptive learning and progress tracking.

**Each record includes:**
Name (Muslim boy/girl)
Email
Age (4–7)
Level (easy, medium, hard)
Time taken to complete the level

This dataset helps refine content delivery and improve feedback for caregivers.

**🤝 Contributing**
Want to contribute to MindBridge?
Fork the repository
Create a feature branch (git checkout -b feature-name)
Commit your changes (git commit -m "Add feature")
Push to your branch (git push origin feature-name)
Create a Pull Request

**💡 Inspiration**
MindBridge was developed as a Final Year Project with the aim of building inclusive, supportive tools for children with autism. Every element — from visuals to voice guidance — is crafted with care, love, and user empathy in mind.
>>>>>>> 1e1de60523bfdf01011dc8b2f4050b3ceabe6f53
