# Viltrumite: High-Fidelity Music Recognition 🎵

Viltrumite is a next-generation music discovery engine designed to identify tracks with extreme precision. Inspired by the logic of Shazam, it leverages advanced acoustic fingerprinting to translate audio waveforms into unique mathematical "fingerprints," specifically tailored for high-fidelity detection and regional music preservation.

---

## 🌐 Live Deployments

- **Frontend (UI)**: [https://viltrumite-music-detector.vercel.app/](https://viltrumite-music-detector.vercel.app/)
- **Backend (API)**: [https://viltrumite-music-detector.onrender.com](https://viltrumite-music-detector.onrender.com)

---

## 🚀 Key Features

- **Instant Recognition**: Identify any playing track in under 2 seconds.
- **Discovery Vault**: A high-fidelity library filtered strictly by genre (Pop, Phonk, Anime, etc.).
- **Manual Ingestion**: Submit YouTube URLs to expand the acoustic universe.
- **Visual Excellence**: A premium, interactive UI with micro-animations and dynamic backgrounds.
- **Containerized**: Fully Dockerized for seamless deployment and development.

---

## 🛠️ Technology Stack

### **Frontend**
- **Core**: React 19, Vite, React Router 7
- **Styling**: Vanilla CSS, TailwindCSS, Framer Motion
- **Animations**: GSAP, Lenis (Smooth Scroll)

### **Backend**
- **Runtime**: Node.js (Express)
- **Database**: SQLite3 (Persistent storage for songs and users)
- **Auth**: JWT, BcryptJS

### **AI & Audio Module**
- **Language**: Python 3
- **Processing**: Librosa, NumPy, SciPy
- **Fingerprinting**: Delta-Time Combinatorial Hashing

---

## 🏗️ Deployment Strategy

Viltrumite uses a **Split Deployment** architecture to leverage the strengths of different platforms:

- **Frontend (Vercel)**: Served as a high-performance static site with global edge distribution.
- **Backend (Render)**: Hosted as a Dockerized web service to support the Python AI core and FFmpeg dependencies.
- **Communication**: Seamlessly connected via absolute API URLs and environment variable configuration (`VITE_API_URL`).

---

## 📦 Getting Started

### **Option 1: Quick Start (Docker)**
The easiest way to run Viltrumite is using Docker Compose.

1.  **Generate a Secret**:
    ```bash
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    ```
2.  **Setup Environment**:
    ```bash
    cp .env.example .env
    # Edit .env and paste your generated JWT_SECRET
    ```
3.  **Launch**:
    ```bash
    docker-compose up --build
    ```

### **Option 2: Local Development**
Refer to the individual `package.json` files for local scripts:
- **Backend**: `cd Backend && npm install && npm run dev`
- **Frontend**: `cd Frontend && npm install && npm run dev`

---

## 📂 Project Documentation

Detailed project architecture and requirements are available in the [Documentation](file:///home/uzairmajeed/BS_SE/SideProjects/Viltrumite/Documentation) folder:
- [SRS.md](file:///home/uzairmajeed/BS_SE/SideProjects/Viltrumite/Documentation/SRS.md) - Software Requirements Specification.
- [Architecture.md](file:///home/uzairmajeed/BS_SE/SideProjects/Viltrumite/Documentation/Architecture.md) - System design and Database ERD.

---

## 📖 The Story

Created by **Uzair Majeed**, a BS Software Engineering student, Viltrumite was born out of a fascination with how machines perceive sound. More than just a tool, it's a testament to what's possible when curiosity meets code. Join us in expanding this musical universe.

---

## 🛡️ License
Fun Project.