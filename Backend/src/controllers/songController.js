const { runPythonScript } = require('../services/pythonService');
const { PATHS } = require('../config');

const getStats = async (req, res) => {
    try {
        const result = await runPythonScript('-c', [
            `
import sys
sys.path.append('${PATHS.AI_MODULE_CORE}')
from database import DatabaseHandler
import json
db = DatabaseHandler('${PATHS.DB_SONGS}')
songs = db.get_all_songs()
genres = {}
for song in songs:
    genre = song[3] or 'Unknown'
    genres[genre] = genres.get(genre, 0) + 1
print(json.dumps({
    'total_songs': len(songs),
    'genres': genres
}))
            `
        ]);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get stats', details: error.message });
    }
};

const getAllSongs = async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const genre = req.query.genre || 'All';
    const search = req.query.search || '';

    try {
        const result = await runPythonScript('-c', [
            `
import sys
import json
sys.path.append('${PATHS.AI_MODULE_CORE}')
from database import DatabaseHandler
db = DatabaseHandler(sys.argv[1])
songs = db.get_all_songs(genre=sys.argv[2], search=sys.argv[3])
songs.sort(key=lambda x: x[0], reverse=True)
total = len(songs)
limit = int(sys.argv[4])
offset = int(sys.argv[5])
paginated = songs[offset : offset + limit]
result = []
for s in paginated:
    result.append({
        'id': s[0], 'title': s[1], 'artist': s[2], 'genre': s[3], 'url': s[4], 'thumbnail': s[5]
    })
print(json.dumps({'total': total, 'limit': limit, 'offset': offset, 'songs': result}))
            `,
            PATHS.DB_SONGS, genre, search, limit.toString(), offset.toString()
        ]);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch songs', details: error.message });
    }
};

const manualIndex = async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'YouTube URL is required' });

    try {
        const result = await runPythonScript(PATHS.PYTHON_SCRIPTS.USER_ADDER, [url, '--db', PATHS.DB_SONGS]);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Manual indexing failed', details: error.message });
    }
};

module.exports = { getStats, getAllSongs, manualIndex };
