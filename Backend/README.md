# Viltrumite Backend API

Express.js backend server for the Viltrumite music recognition application.

## Features

- 🎵 **Song Recognition**: Upload audio files and get song matches
- 📊 **Database Stats**: View indexed songs count and genres
- 🔒 **File Validation**: Only accepts audio files
- 🚀 **CORS Enabled**: Ready for frontend integration

## Setup

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Make Sure Python Environment is Ready

The API uses the Python AI module, so ensure:
- Python virtual environment is activated
- Database has songs indexed

```bash
cd ../AI-Module
source venv/bin/activate
python list_songs.py  # Verify songs are indexed
```

### 3. Start the Server

```bash
cd ../Backend
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Server will start on `http://localhost:3000`

## API Endpoints

### GET `/health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "message": "Viltrumite API is running",
  "timestamp": "2024-02-06T10:30:00.000Z"
}
```

### GET `/api/stats`
Get database statistics

**Response:**
```json
{
  "total_songs": 150,
  "genres": {
    "Pakistani": 80,
    "anime": 50,
    "Bollywood": 20
  }
}
```

### POST `/api/recognize`
Recognize a song from audio file

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `audio` file field

**Example with curl:**
```bash
curl -X POST http://localhost:3000/api/recognize \
  -F "audio=@song.mp3"
```

**Response (Match Found):**
```json
{
  "success": true,
  "match_found": true,
  "matches": [
    {
      "song_id": 42,
      "title": "Tajdar-e-Haram",
      "artist": "Coke Studio",
      "genre": "Pakistani",
      "confidence": 95.5,
      "matched_fingerprints": 1847,
      "total_fingerprints": 1934,
      "time_offset": 120
    }
  ],
  "fingerprints_generated": 1934,
  "total_matches_checked": 5421
}
```

**Response (No Match):**
```json
{
  "success": true,
  "match_found": false,
  "message": "No matching songs found in database",
  "fingerprints_generated": 1523
}
```

## Testing

### Test with curl

1. **Health check:**
```bash
curl http://localhost:3000/health
```

2. **Get stats:**
```bash
curl http://localhost:3000/api/stats
```

3. **Recognize a song:**
```bash
curl -X POST http://localhost:3000/api/recognize \
  -F "audio=@/path/to/song.mp3"
```

### Test with JavaScript (fetch)

```javascript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('http://localhost:3000/api/recognize', {
    method: 'POST',
    body: formData
});

const result = await response.json();
console.log(result);
```

## File Limits

- **Max file size**: 50MB
- **Accepted formats**: mp3, wav, ogg, m4a, webm, mp4

## Troubleshooting

### "Failed to start Python process"
Make sure the Python virtual environment exists:
```bash
cd ../AI-Module
ls venv/bin/python3
```

### "No matching songs found"
Index some songs first:
```bash
cd ../AI-Module
python playlist_indexer.py --search "Coke Studio Pakistan" --limit 10 --genre Pakistani
```

### Port already in use
Change the port in `server.js` or set environment variable:
```bash
PORT=4000 npm start
```
