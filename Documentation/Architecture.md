# System Architecture & Database Schema

## 1. System Overview
Viltrumite follows a modular architecture separating the user interface, backend orchestration, and AI-powered audio processing.

```mermaid
graph TD
    User((User))
    FE[React Frontend]
    BE[Express Backend]
    AI[Python AI Module]
    DB_S[(Songs DB)]
    DB_U[(Users DB)]

    User <--> FE
    FE <--> BE
    BE <--> AI
    AI <--> DB_S
    BE <--> DB_U
```

## 2. Database Schema (ERD)

### 2.1 Songs Database (`songs.db`)
Responsible for storing track metadata and acoustic fingerprints.

```mermaid
erDiagram
    SONGS ||--o{ FINGERPRINTS : contains
    SONGS {
        INTEGER id PK
        TEXT title
        TEXT artist
        TEXT genre
        TEXT url "Unique"
        TEXT thumbnail
        TEXT file_hash "Unique"
    }
    FINGERPRINTS {
        BLOB hash "Indexed"
        INTEGER song_id FK
        INTEGER offset
    }
```

### 2.2 Users Database (`users.db`)
Responsible for authentication and user profiles.

```mermaid
erDiagram
    USERS {
        INTEGER id PK
        TEXT username "Unique"
        TEXT email "Unique"
        TEXT password "Hashed"
        TEXT role "Default: user"
        DATETIME created_at
    }
```

## 3. Core Workflows

### 3.1 Recognition Flow
1. **Frontend**: Captures audio -> `POST /api/recognize` (as blob/file).
2. **Backend**: Saves file -> Calls `recognizer.py <file_path>`.
3. **AI Module**: 
    - Loads audio (Librosa).
    - Generates 2D peaks from Spectrogram.
    - Creates hashes (Delta-Time Hashing).
    - Queries `songs.db` for hash matches.
    - Aligns matches and calculates confidence.
4. **Backend**: Returns match result to Frontend.

### 3.2 Indexing Flow
1. **Frontend**: Submit URL -> `POST /api/songs/manual`.
2. **Backend**: Calls `user_adder.py <url>`.
3. **AI Module**: 
    - Downloads audio (yt-dlp).
    - Checks for duplicates (Title/Audio).
    - Fingerprints and stores in `songs.db`.
