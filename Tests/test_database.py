import unittest
import os
import sys

# Add Core to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'AI-Module', 'Core'))
from database import DatabaseHandler

class TestDatabaseHandler(unittest.TestCase):
    def setUp(self):
        self.test_db = "test_songs.db"
        self.db = DatabaseHandler(self.test_db)

    def tearDown(self):
        if os.path.exists(self.test_db):
            os.remove(self.test_db)

    def test_add_and_get_song(self):
        song_id = self.db.add_song("Test Title", "Test Artist", "hash123", genre="Pop", url="https://yt.com/123")
        self.assertIsNotNone(song_id)
        
        song = self.db.get_song_by_id(song_id)
        self.assertEqual(song[0], "Test Title")
        self.assertEqual(song[1], "Test Artist")
        self.assertEqual(song[2], "Pop")

    def test_strict_genre_filter(self):
        self.db.add_song("Song 1", "Artist 1", "h1", genre="Pop")
        self.db.add_song("Song 2", "Artist 2", "h2", genre="Phonk")
        
        results = self.db.get_all_songs(genre="Phonk")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0][3], "Phonk")

if __name__ == '__main__':
    unittest.main()
