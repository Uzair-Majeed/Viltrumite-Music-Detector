#!/usr/bin/env python3
"""
YouTube Song Auto-Indexer
Downloads songs from YouTube, fingerprints them, stores in database, and cleans up files.
"""

import os
import sys
import argparse
import subprocess
from pathlib import Path

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Add necessary paths for internal imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Preprocessing'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Core'))

from processor import AudioProcessor
from fingerprinter import Fingerprinter
from database import DatabaseHandler

class YouTubeIndexer:
    def __init__(self, db_path="songs.db", temp_dir="temp_downloads", genre="Unknown"):
        self.processor = AudioProcessor()
        self.fingerprinter = Fingerprinter()
        self.db = DatabaseHandler(db_path)
        self.temp_dir = temp_dir
        self.genre = genre
        
        # Create temp directory
        Path(self.temp_dir).mkdir(exist_ok=True)
    
    def download_audio(self, url):
        """
        Downloads audio from YouTube URL using yt-dlp.
        Returns tuple (file_path, thumbnail_url, title, artist), or (None, None, None, None) on failure.
        """
        try:
            print(f"Downloading from: {url}")
            
            # Step 1: Get Metadata (Thumbnail, Title, Artist)
            print(f"Fetching metadata for: {url}")
            # we want thumbnail, title, uploader
            cmd_meta = [
                'yt-dlp',
                '--print', '%(thumbnail)s\n%(title)s\n%(uploader)s', # Output each on a new line
                '--simulate',
                '--no-playlist',
                url
            ]
            
            meta_result = subprocess.run(cmd_meta, capture_output=True, text=True)
            thumbnail_url = None
            title = None
            artist = "Unknown"
            
            if meta_result.returncode == 0:
                lines = meta_result.stdout.strip().split('\n')
                if len(lines) >= 1: thumbnail_url = lines[0]
                if len(lines) >= 2: title = lines[1]
                if len(lines) >= 3: artist = lines[2]
            
            # Step 2: Download Audio
            # Use absolute path to ensure yt-dlp writes where we expect
            abs_temp_dir = os.path.abspath(self.temp_dir)
            # Use video ID in filename to handle special chars
            output_template = os.path.join(abs_temp_dir, '%(id)s.%(ext)s')
            
            cmd_download = [
                'yt-dlp',
                '-f', 'bestaudio',      # Best quality audio
                '-o', output_template,
                '--no-playlist',
                '--no-cache-dir',       # Prevent caching issues
                url
            ]
            
            print(f"Downloading audio...")
            result = subprocess.run(cmd_download, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"Error downloading: {result.stderr}")
                return None, None, None, None
                
            # Find the downloaded file
            extensions = ['*.mp3', '*.webm', '*.m4a', '*.wav', '*.flac']
            audio_files = []
            for ext in extensions:
                found = list(Path(self.temp_dir).glob(ext))
                audio_files.extend(found)
            
            if audio_files:
                # Return the most recently created file
                latest_file = max(audio_files, key=lambda p: p.stat().st_mtime)
                return str(latest_file), thumbnail_url, title, artist
            
            return None, None, None, None
            
        except Exception as e:
            print(f"Exception during download: {e}")
            return None, None, None, None
    
    def process_and_index(self, file_path, url=None, genre="Unknown", thumbnail=None, title=None, artist="Unknown"):
        """
        Fingerprints a song and adds it to the database.
        Returns True on success, False on failure.
        """
        try:
            # If title/artist not provided (e.g. from file download), fallback to filename
            if not title:
                filename = os.path.basename(file_path)
                title = os.path.splitext(filename)[0]
            
            # Filename is still needed for DB/storage ref (even if we use ID-based filename)
            filename = os.path.basename(file_path)
            
            print(f"Processing: {title} by {artist}")
            
            # 1. Load Audio
            y, sr = self.processor.load_audio(file_path)
            if y is None:
                print("  Failed to load audio")
                return False
            
            # 2. Generate Fingerprints
            spec = self.processor.get_spectrogram(y)
            peaks = self.fingerprinter.get_2d_peaks(spec)
            hashes = self.fingerprinter.generate_hashes(peaks)
            
            if not hashes:
                print("  Warning: No fingerprints generated")
                return False
            
            # 3. Store in Database
            song_id = self.db.add_song(title, artist, filename, genre=genre, url=url, thumbnail=thumbnail)
            
            if song_id:
                self.db.store_fingerprints(song_id, hashes)
                print(f"  ✓ Indexed! Song ID: {song_id}, Fingerprints: {len(hashes)}, Genre: {genre}")
                return True
            else:
                print("  Skipped (already exists?)")
                return False
                
        except Exception as e:
            print(f"  Error processing: {e}")
            return False
    
    def cleanup_file(self, file_path):
        """Removes the audio file to save space."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"  ✓ Cleaned up: {os.path.basename(file_path)}")
        except Exception as e:
            print(f"  Warning: Could not delete {file_path}: {e}")
    
    def index_from_url(self, url, genre=None):
        """
        Complete workflow: Download -> Fingerprint -> Store -> Delete
        """
        if genre is None:
            genre = self.genre
        
        print(f"\n{'='*60}")
        print(f"Processing URL: {url}")
        print(f"{'='*60}")
        
        # 1. Download
        file_path, thumbnail_url, title, artist = self.download_audio(url)
        if not file_path:
            print("✗ Download failed\n")
            return False
        
        # 2. Process and Index
        success = self.process_and_index(file_path, url=url, genre=genre, thumbnail=thumbnail_url, title=title, artist=artist)
        
        # 3. Cleanup (regardless of success/failure)
        self.cleanup_file(file_path)
        
        if success:
            print("✓ Successfully indexed and cleaned up\n")
        else:
            print("✗ Indexing failed\n")
        
        return success
    
    def index_from_file(self, file_path):
        """
        Read URLs from a text file (one per line) and index them all.
        """
        if not os.path.exists(file_path):
            print(f"Error: File {file_path} not found")
            return
        
        try:
            with open(file_path, 'r') as f:
                urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
            
            print(f"Found {len(urls)} URLs to process\n")
            
            success_count = 0
            for i, url in enumerate(urls, 1):
                print(f"\n[{i}/{len(urls)}]")
                if self.index_from_url(url):
                    success_count += 1
            
            print(f"\n{'='*60}")
            print(f"Summary: {success_count}/{len(urls)} songs successfully indexed")
            print(f"{'='*60}")
            
        except Exception as e:
            print(f"Error processing file: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="YouTube Song Auto-Indexer for Viltrumite",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Index a single song from YouTube
  python youtube_indexer.py --url "https://www.youtube.com/watch?v=VIDEO_ID"
  
  # Index multiple songs from a text file (one URL per line)
  python youtube_indexer.py --file urls.txt
        """
    )
    
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--url', help='Single YouTube URL to download and index')
    group.add_argument('--file', help='Text file containing YouTube URLs (one per line)')
    
    args = parser.parse_args()
    
    indexer = YouTubeIndexer()
    
    if args.url:
        indexer.index_from_url(args.url)
    elif args.file:
        indexer.index_from_file(args.file)
