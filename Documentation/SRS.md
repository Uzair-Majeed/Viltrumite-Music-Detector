# Software Requirements Specification (SRS) - Viltrumite

## 1. Introduction
Viltrumite is a high-fidelity music recognition engine inspired by the acoustic fingerprinting logic of Shazam. It focuses on regional music discovery and technical excellence in audio processing.

## 2. User Roles
- **Guest**: Can search the library and read about the project.
- **User**: Can record audio for recognition, submit new tracks via YouTube URLs, and manage their profile.
- **Administrator**: (Future) System monitoring and database management.

## 3. Functional Requirements
### 3.1 Music Recognition
- The system shall record 5-10 seconds of audio via the browser.
- The system shall generate acoustic fingerprints from the recorded audio.
- The system shall match fingerprints against a centralized SQLite database.
- The system shall return the most likely song match or an error toast if no match is found.

### 3.2 Library Management
- The system shall allow users to browse songs by genre.
- The system shall provide a search bar for title, artist, or genre.
- The system shall implement strict genre filtering.

### 3.3 Track Submission
- Users shall submit YouTube URLs for indexing.
- The system shall validate URLs and metadata.
- The system shall download audio, fingerprint it, and store it in the database.

## 4. Technical Requirements
### 4.1 Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS, TailwindCSS
- **Animations**: Framer Motion, GSAP
- **Icons**: Lucide React

### 4.2 Backend
- **Environment**: Node.js (Express)
- **Database**: SQLite3
- **Authentication**: JWT, BcryptJS

### 4.3 AI & Audio Processing
- **Language**: Python 3
- **Libraries**: Librosa (Audio loading/resampling), NumPy (STFT, peak detection), SciPy
- **Logic**: Constellation mapping and combinatorial hashing.

## 5. Non-Functional Requirements
- **Performance**: Song recognition should complete in less than 2 seconds.
- **Reliability**: Use error toasts for graceful failure handling.
- **Scalability**: Support batch indexing for large music collections.
- **UX/UI**: High-fidelity, premium design with smooth micro-animations.
