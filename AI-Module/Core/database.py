import sqlite3
import os
from difflib import SequenceMatcher

class DatabaseHandler:
    def __init__(self, db_path=None):
        if db_path is None:
            # Point to the central Databases folder
            db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "Databases", "songs.db")
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initialize the database schema."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Enable Foreign Keys (Required for CASCADE)
        cursor.execute("PRAGMA foreign_keys = ON")
        
        # Table for Songs
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS songs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                artist TEXT,
                genre TEXT,
                URL TEXT UNIQUE,
                thumbnail TEXT,
                file_hash TEXT UNIQUE
            )
        ''')
        
        # Table for Fingerprints
        # hash: The partial SHA1 hash from Fingerprinter (stored as BLOB)
        # song_id: FK to songs
        # offset: The time offset where this hash appeared
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS fingerprints (
                hash BLOB,
                song_id INTEGER,
                offset INTEGER,
                FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE
            )
        ''')
        
        # Index for faster lookups (Crucial!)
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_hash ON fingerprints (hash)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_song_id ON fingerprints (song_id)')
        
        conn.commit()
        conn.close()

    def add_song(self, title, artist, file_path_hash, genre="Unknown", url=None, thumbnail=None):
        """
        Adds a song to the database. Returns the new song_id.
        Checks if song already exists by file_hash.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('INSERT INTO songs (title, artist, genre, url, thumbnail, file_hash) VALUES (?, ?, ?, ?, ?, ?)', 
                           (title, artist, genre, url, thumbnail, file_path_hash))
            song_id = cursor.lastrowid
            conn.commit()
            return song_id
        except sqlite3.IntegrityError:
            # Song might already exist (by file_hash or URL)
            cursor.execute('SELECT id FROM songs WHERE file_hash = ? OR url = ?', (file_path_hash, url))
            result = cursor.fetchone()
            if result:
                return result[0]
            return None
        finally:
            conn.close()

    def store_fingerprints(self, song_id, fingerprints):
        """
        Bulk inserts fingerprints for a song.
        fingerprints: List of (hash, offset) tuples
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Prepare data: (hash, song_id, offset)
        data = [(f[0], song_id, f[1]) for f in fingerprints]
        
        # Fast bulk insert
        cursor.executemany('INSERT INTO fingerprints (hash, song_id, offset) VALUES (?, ?, ?)', data)
        conn.commit()
        conn.close()

    def get_matches(self, hashes):
        """
        Finds all matching fingerprints in the database.
        hashes: List of (hash, offset) tuples from the recorded audio.
        
        Returns: Iterator of (song_id, db_offset, recorded_offset)
        We allow the caller to handle the alignment logic.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # We only really care about the hash string for the lookup
        # We map hash -> recorded_offset for calculations later
        hash_dict = {}
        for h, offset in hashes:
            if h not in hash_dict:
                hash_dict[h] = []
            hash_dict[h].append(offset)
            
        keys = list(hash_dict.keys())
        
        # SQLite limit for variables is usually 999. 
        # For large compilations, we might have thousands of hashes, so we MUST batch.
        chunk_size = 900
        
        for i in range(0, len(keys), chunk_size):
            chunk_keys = keys[i:i + chunk_size]
            
            # Construct the query dynamically for this chunk
            placeholders = ',' .join(['?'] * len(chunk_keys))
            query = f"SELECT hash, song_id, offset FROM fingerprints WHERE hash IN ({placeholders})"
            
            # Since hashes are binary, SQLite handles binary blobs correctly with '?' placeholders
            cursor.execute(query, chunk_keys)
            
            for hash_val, song_id, db_offset in cursor:
                # For each match, we yield the song_id and the time difference
                if hash_val in hash_dict:
                    for recorded_offset in hash_dict[hash_val]:
                        yield (song_id, db_offset, recorded_offset)

        conn.close()

    def delete_song(self, song_id):
        """
        Deletes a song by ID. Fingerprints will be auto-deleted due to CASCADE.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = ON")
        cursor.execute("DELETE FROM songs WHERE id = ?", (song_id,))
        conn.commit()
        conn.close()
        return True

    def get_song_by_id(self, song_id):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT title, artist, genre, thumbnail, url FROM songs WHERE id = ?", (song_id,))
        result = cursor.fetchone()
        conn.close()
        return result
    
    def get_all_songs(self, genre=None, search=None):
        """
        Get all songs from the database.
        If genre is specified, filter by genre.
        If search is specified, filter by title, artist, or genre.
        Returns list of (id, title, artist, genre, url, thumbnail) tuples.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = "SELECT id, title, artist, genre, url, thumbnail FROM songs WHERE 1=1"
        params = []
        
        if genre and genre.lower() != 'all':
            query += " AND LOWER(genre) = LOWER(?)"
            params.append(genre)
            
        if search:
            query += " AND (title LIKE ? OR artist LIKE ? OR genre LIKE ?)"
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param])
            
        cursor.execute(query, params)
        results = cursor.fetchall()
        conn.close()
        return results
    
    def find_similar_title(self, title, artist, threshold=0.85):
        """
        Find songs with similar titles to avoid duplicates.
        Uses fuzzy string matching to detect duplicates like:
        - "Song Name" vs "Song Name (Official Video)"
        - "Song Name" vs "Song Name - Lyrics"
        
        Returns: List of (song_id, title, artist, similarity_score)
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT id, title, artist FROM songs")
        all_songs = cursor.fetchall()
        conn.close()
        
        similar = []
        title_clean = self._clean_title(title)
        
        for song_id, db_title, db_artist in all_songs:
            db_title_clean = self._clean_title(db_title)
            
            # Calculate similarity
            title_sim = SequenceMatcher(None, title_clean.lower(), db_title_clean.lower()).ratio()
            artist_sim = SequenceMatcher(None, artist.lower(), db_artist.lower()).ratio()
            
            # Weighted score: title is more important
            combined_score = (title_sim * 0.8) + (artist_sim * 0.2)
            
            if combined_score >= threshold:
                similar.append((song_id, db_title, db_artist, combined_score))
        
        # Sort by similarity score descending
        similar.sort(key=lambda x: x[3], reverse=True)
        return similar
    
    def _clean_title(self, title):
        """
        Clean title by removing common variations:
        - (Official Video), [Official Audio], etc.
        - Lyrics, Lyric Video
        - HD, 4K, 1080p
        """
        import re
        # Remove content in parentheses and brackets
        title = re.sub(r'[\(\[].*?[\)\]]', '', title)
        # Remove common keywords
        keywords = ['official', 'video', 'audio', 'lyrics', 'lyric', 'hd', '4k', 
                   '1080p', 'music', 'full song', 'ft', 'feat', 'featuring']
        for keyword in keywords:
            title = re.sub(r'\b' + keyword + r'\b', '', title, flags=re.IGNORECASE)
        # Remove extra whitespace
        title = ' '.join(title.split())
        return title.strip()
    
    def check_fingerprint_similarity(self, new_fingerprints, threshold=0.7, min_matches=50):
        """
        Check if new fingerprints are too similar to existing songs.
        This detects audio duplicates even if titles differ.
        
        Returns: (is_duplicate, song_id, match_score) or (False, None, 0)
        """
        if not new_fingerprints:
            return False, None, 0
        
        # Get matches from database
        matches_dict = {}
        for song_id, db_offset, _ in self.get_matches(new_fingerprints):
            if song_id not in matches_dict:
                matches_dict[song_id] = 0
            matches_dict[song_id] += 1
        
        if not matches_dict:
            return False, None, 0
        
        # Find song with most matches
        best_song_id = max(matches_dict, key=matches_dict.get)
        match_count = matches_dict[best_song_id]
        
        # Calculate match ratio
        match_ratio = match_count / len(new_fingerprints)
        
        # Consider duplicate if:
        # - Match ratio exceeds threshold AND
        # - Minimum number of matches found
        is_duplicate = match_ratio >= threshold and match_count >= min_matches
        
        return is_duplicate, best_song_id, match_ratio

if __name__ == "__main__":
    # Test
    db = DatabaseHandler("test_songs.db")
    sid = db.add_song("Dil Dil Pakistan", "Vital Signs", "test_hash_123", genre="Pakistani", url="https://youtube.com/test")
    print(f"Added Song ID: {sid}")
    
    # Fake fingerprints (hash, offset)
    fps = [("abc12345678901234567", 100), ("def12345678901234567", 105)]
    db.store_fingerprints(sid, fps)
    print("Stored fingerprints.")
    
    # Test Match
    matches = list(db.get_matches([("abc12345678901234567", 5)])) # Recorded at offset 5
    print(f"Matches found: {len(matches)}")
    print(matches[0] if matches else "No matches")
    
    # Cleanup
    if os.path.exists("test_songs.db"):
        os.remove("test_songs.db")
