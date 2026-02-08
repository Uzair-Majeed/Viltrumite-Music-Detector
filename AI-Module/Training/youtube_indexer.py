#!/usr/bin/env python3
import os
import sys
import argparse
import subprocess
import json
import hashlib
from pathlib import Path

# Fix path injections to find Core and Preprocessing modules
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
sys.path.append(os.path.join(current_dir, '..', 'Core'))
sys.path.append(os.path.join(current_dir, '..', 'Preprocessing'))

from processor import AudioProcessor
from fingerprinter import Fingerprinter
from database import DatabaseHandler

class YouTubeIndexer:
    def __init__(self, db_path=None, temp_dir=None, genre="Unknown", skip_duplicates=True, cookies=None):
        # Default paths relative to this script
        if db_path is None:
            db_path = os.path.join(current_dir, '..', '..', 'Databases', 'songs.db')
        if temp_dir is None:
            temp_dir = os.path.join(current_dir, '..', 'temp_downloads')
            
        self.processor = AudioProcessor()
        self.fingerprinter = Fingerprinter()
        self.db = DatabaseHandler(db_path)
        self.temp_dir = temp_dir
        self.genre = genre
        self.skip_duplicates = skip_duplicates
        self.cookies_path = cookies
        
        # Ensure temp directory exists
        Path(self.temp_dir).mkdir(exist_ok=True, parents=True)
        
        # Standard robust headers for bot bypass
        self.headers = [
            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            '--force-overwrites',
            '--no-check-certificates',
            '--impersonate', 'chrome-110',
            '--extractor-args', 'youtube:player-client=web,default;player-skip=web_embedded_client,mweb_benchmark'
        ]
        if self.cookies_path:
            self.headers.extend(['--cookies', self.cookies_path])

    def _run_ytdlp(self, args, quiet=False):
        """Helper to run yt-dlp using the current python interpreter to ensure venv usage"""
        cmd = [sys.executable, '-m', 'yt_dlp'] + self.headers + args
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0 and not quiet:
            print(f"[!] yt-dlp Error:")
            print(f"    {result.stderr.strip()}")
        return result

    def download_audio(self, url):
        """Downloads audio and returns (file_path, thumbnail, title, artist)"""
        try:
            print(f"[*] Metadata: {url}")
            # Try to get metadata. If it fails due to bot detection, advise cookies.
            meta_cmd = ['--print', '%(thumbnail)s\n%(title)s\n%(uploader)s', '--simulate', '--no-playlist', url]
            result = self._run_ytdlp(meta_cmd)
            
            if result.returncode != 0:
                if "bot" in result.stderr or "confirm you're not a bot" in result.stderr:
                    print("\n[!] YouTube detected a bot request.")
                    print("[!] TIP: Export cookies from your browser to a 'cookies.txt' file and use --cookies cookies.txt")
                return None, None, None, None
            
            lines = result.stdout.strip().split('\n')
            thumbnail, title, artist = None, "Unknown", "Unknown"
            if len(lines) >= 1: thumbnail = lines[0]
            if len(lines) >= 2: title = lines[1]
            if len(lines) >= 3: artist = lines[2]

            # Use video ID in filename
            video_id_cmd = ['--get-id', url]
            id_result = self._run_ytdlp(video_id_cmd, quiet=True)
            video_id = id_result.stdout.strip() if id_result.returncode == 0 else hashlib.md5(url.encode()).hexdigest()

            output_template = os.path.join(os.path.abspath(self.temp_dir), f'{video_id}.%(ext)s')
            dl_cmd = ['-f', 'bestaudio', '-o', output_template, '--no-playlist', '--no-cache-dir', url]
            
            print(f"[*] Downloading audio...")
            self._run_ytdlp(dl_cmd)
            
            # Find the file
            for ext in ['mp3', 'webm', 'm4a', 'wav', 'opus']:
                files = list(Path(self.temp_dir).glob(f"{video_id}.{ext}"))
                if files:
                    return str(files[0]), thumbnail, title, artist
            
            return None, None, None, None
        except Exception as e:
            print(f"[!] Download Error: {e}")
            return None, None, None, None

    def is_duplicate(self, title, artist, fingerprints=None):
        """Check for existing song via title or audio fingerprints"""
        if not self.skip_duplicates:
            return False, None
            
        # 1. Title Similarity
        similar = self.db.find_similar_title(title, artist, threshold=0.85)
        if similar:
            return True, f"Title Match ({similar[0][3]:.2f})"
            
        # 2. Audio Fingerprint Similarity
        if fingerprints:
            is_dup, dup_id, ratio = self.db.check_fingerprint_similarity(fingerprints, threshold=0.6)
            if is_dup:
                return True, f"Audio Match ({ratio:.2%})"
                
        return False, None

    def process_and_index(self, url, genre=None):
        """Standard workflow: Download -> Duplicate Check -> Index -> Cleanup"""
        genre = genre or self.genre
        file_path, thumb, title, artist = self.download_audio(url)
        
        if not file_path:
            return False
            
        try:
            print(f"[*] Processing: {title}")
            y, sr = self.processor.load_audio(file_path)
            if y is None: return False
            
            spec = self.processor.get_spectrogram(y)
            peaks = self.fingerprinter.get_2d_peaks(spec)
            hashes = self.fingerprinter.generate_hashes(peaks)
            
            # Verify duplicates with fingerprints
            dup, reason = self.is_duplicate(title, artist, hashes)
            if dup:
                print(f"[-] Skipped: {reason}")
                return False

            song_id = self.db.add_song(title, artist, os.path.basename(file_path), genre=genre, url=url, thumbnail=thumb)
            if song_id:
                self.db.store_fingerprints(song_id, hashes)
                print(f"  ✓ Indexed! (ID: {song_id}, Hashes: {len(hashes)})")
                return True
            return False
        finally:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)

    def index_playlist(self, url, genre=None, start=None, end=None):
        range_str = f" (Range: {start}-{end})" if start or end else ""
        print(f"[*] Extracting playlist: {url}{range_str}")
        
        cmd = ['--flat-playlist', '--print', 'url']
        if start: cmd.extend(['--playlist-start', str(start)])
        if end: cmd.extend(['--playlist-end', str(end)])
        cmd.append(url)
        
        result = self._run_ytdlp(cmd)
        
        urls = [u.strip() for u in result.stdout.strip().split('\n') if u.strip()]
        print(f"[*] Found {len(urls)} songs. Starting ingestion...")
        
        success = 0
        for i, video_url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] Ingesting...")
            if self.process_and_index(video_url, genre):
                success += 1
        print(f"\n[!] Done! Successfully indexed {success}/{len(urls)} songs.")

    def index_search(self, query, limit=10, genre=None):
        print(f"[*] Searching YouTube: {query}")
        cmd = ['--flat-playlist', '--print', 'url', f'ytsearch{limit}:{query}']
        result = self._run_ytdlp(cmd)
        
        urls = [u.strip() for u in result.stdout.strip().split('\n') if u.strip()]
        for i, video_url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] Ingesting search result...")
            self.process_and_index(video_url, genre)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Unified Viltrumite YouTube Indexer")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--url', help='Single video URL')
    group.add_argument('--playlist', help='Playlist or Channel URL')
    group.add_argument('--search', help='Search query')
    
    parser.add_argument('--genre', default='Unknown', help='Genre tag')
    parser.add_argument('--start', type=int, help='Playlist start index (optional)')
    parser.add_argument('--end', type=int, help='Playlist end index (optional)')
    parser.add_argument('--limit', type=int, default=10, help='Search limit (default: 10)')
    parser.add_argument('--db', help='Custom database path')
    parser.add_argument('--cookies', help='Path to cookies.txt file')
    parser.add_argument('--no-skip', action='store_false', dest='skip', help='Disable duplicate detection')
    
    args = parser.parse_args()
    indexer = YouTubeIndexer(db_path=args.db, genre=args.genre, skip_duplicates=args.skip, cookies=args.cookies)
    
    if args.url:
        indexer.process_and_index(args.url)
    elif args.playlist:
        indexer.index_playlist(args.playlist, start=args.start, end=args.end)
    elif args.search:
        indexer.index_search(args.search, limit=args.limit)
