#!/usr/bin/env python3
"""
YouTube Playlist/Channel Song Indexer with Duplicate Detection

Discovers songs from YouTube playlists or channels and indexes them,
automatically skipping duplicates using title matching and audio fingerprinting.
"""

import os
import sys
import argparse
import subprocess
import json
from pathlib import Path

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Add necessary paths for internal imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Core'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Preprocessing'))

from youtube_indexer import YouTubeIndexer
from database import DatabaseHandler
from processor import AudioProcessor
from fingerprinter import Fingerprinter


class PlaylistIndexer:
    def __init__(self, db_path="songs.db", genre="Unknown", skip_duplicates=True):
        """
        Initialize the playlist indexer.
        
        Args:
            db_path: Path to database
            genre: Genre tag for indexed songs
            skip_duplicates: If True, skip duplicate songs
        """
        self.youtube_indexer = YouTubeIndexer(db_path=db_path, genre=genre)
        self.db = DatabaseHandler(db_path)
        self.processor = AudioProcessor()
        self.fingerprinter = Fingerprinter()
        self.genre = genre
        self.skip_duplicates = skip_duplicates
        
        self.stats = {
            'total_found': 0,
            'successfully_indexed': 0,
            'skipped_duplicates_title': 0,
            'skipped_duplicates_audio': 0,
            'failed': 0
        }
    
    def get_playlist_urls(self, playlist_url):
        """
        Extract all video URLs from a YouTube playlist or channel.
        
        Args:
            playlist_url: URL to YouTube playlist or channel
            
        Returns:
            List of (video_url, title) tuples
        """
        try:
            print(f"Fetching videos from playlist/channel...")
            
            # Use yt-dlp to get all video URLs and titles
            cmd = [
                'yt-dlp',
                '--flat-playlist',  # Don't download, just get metadata
                '--print', '%(url)s|%(title)s',  # Output format
                '--no-warnings',
                playlist_url
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"Error fetching playlist: {result.stderr}")
                return []
            
            videos = []
            for line in result.stdout.strip().split('\n'):
                if '|' in line:
                    url, title = line.split('|', 1)
                    # Construct full URL
                    if not url.startswith('http'):
                        url = f"https://www.youtube.com/watch?v={url}"
                    videos.append((url, title))
            
            print(f"✓ Found {len(videos)} videos")
            return videos
            
        except Exception as e:
            print(f"Exception while fetching playlist: {e}")
            return []
    
    def search_youtube(self, query, max_results=50):
        """
        Search YouTube for videos matching a query.
        
        Args:
            query: Search query (e.g., "Pakistani songs 2024")
            max_results: Maximum number of results
            
        Returns:
            List of (video_url, title) tuples
        """
        try:
            print(f"Searching YouTube for: '{query}'")
            
            cmd = [
                'yt-dlp',
                '--flat-playlist',
                '--print', '%(url)s|%(title)s',
                '--no-warnings',
                f'ytsearch{max_results}:{query}'
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"Error searching: {result.stderr}")
                return []
            
            videos = []
            for line in result.stdout.strip().split('\n'):
                if '|' in line:
                    url, title = line.split('|', 1)
                    if not url.startswith('http'):
                        url = f"https://www.youtube.com/watch?v={url}"
                    videos.append((url, title))
            
            print(f"✓ Found {len(videos)} videos")
            return videos
            
        except Exception as e:
            print(f"Exception while searching: {e}")
            return []
    
    def is_duplicate(self, title, url, fingerprints=None):
        """
        Check if a song is a duplicate using multiple methods.
        
        Returns: (is_duplicate, reason, existing_song_info)
        """
        # 1. Check by URL (exact match)
        # Already handled by database UNIQUE constraint
        
        # 2. Extract potential artist and title from video title
        # Common formats: "Artist - Song", "Song | Artist", "Song - Artist"
        parts = title.replace('|', '-').split('-')
        if len(parts) >= 2:
            artist = parts[0].strip()
            song_title = parts[1].strip()
        else:
            artist = "Unknown"
            song_title = title
        
        # 3. Check title similarity
        if self.skip_duplicates:
            similar_songs = self.db.find_similar_title(song_title, artist, threshold=0.85)
            
            if similar_songs:
                match_id, match_title, match_artist, score = similar_songs[0]
                return True, f"Similar title (score: {score:.2f})", (match_id, match_title, match_artist)
        
        # 4. Check fingerprint similarity (if provided)
        if self.skip_duplicates and fingerprints:
            is_dup, dup_id, match_ratio = self.db.check_fingerprint_similarity(
                fingerprints, threshold=0.7, min_matches=50
            )
            
            if is_dup:
                song_info = self.db.get_song_by_id(dup_id)
                return True, f"Similar audio (match: {match_ratio:.2%})", (dup_id, song_info[0], song_info[1])
        
        return False, None, None
    
    def index_video(self, url, title):
        """
        Download, fingerprint, and index a single video.
        Checks for duplicates before processing.
        """
        print(f"\n{'='*70}")
        print(f"Processing: {title}")
        print(f"URL: {url}")
        print(f"{'='*70}")
        
        # Quick title-based duplicate check
        if self.skip_duplicates:
            is_dup, reason, info = self.is_duplicate(title, url)
            if is_dup:
                print(f"⊘ SKIPPED - Duplicate detected: {reason}")
                print(f"  Existing: {info[2]} - {info[1]} (ID: {info[0]})")
                self.stats['skipped_duplicates_title'] += 1
                return False
        
        # Download the audio
        file_path, thumbnail_url, title, artist = self.youtube_indexer.download_audio(url)
        if not file_path:
            print("✗ Download failed")
            self.stats['failed'] += 1
            return False
        
        try:
            # Load and fingerprint
            y, sr = self.processor.load_audio(file_path)
            if y is None:
                print("✗ Failed to load audio")
                self.stats['failed'] += 1
                return False
            
            spec = self.processor.get_spectrogram(y)
            peaks = self.fingerprinter.get_2d_peaks(spec)
            fingerprints = self.fingerprinter.generate_hashes(peaks)
            
            if not fingerprints:
                print("✗ No fingerprints generated")
                self.stats['failed'] += 1
                return False
            
            # Check fingerprint-based duplicates
            if self.skip_duplicates:
                is_dup, reason, info = self.is_duplicate(title, url, fingerprints)
                if is_dup and "audio" in reason.lower():
                    print(f"⊘ SKIPPED - {reason}")
                    print(f"  Existing: {info[2]} - {info[1]} (ID: {info[0]})")
                    self.stats['skipped_duplicates_audio'] += 1
                    return False
            
            # Add to database
            success = self.youtube_indexer.process_and_index(file_path, url=url, genre=self.genre, thumbnail=thumbnail_url, title=title, artist=artist)
            
            if success:
                self.stats['successfully_indexed'] += 1
                print("✓ Successfully indexed!")
            else:
                self.stats['failed'] += 1
            
            return success
            
        finally:
            # Always cleanup
            self.youtube_indexer.cleanup_file(file_path)
    
    def index_from_playlist(self, playlist_url):
        """Index all videos from a playlist or channel."""
        print(f"\n{'#'*70}")
        print(f"# YOUTUBE PLAYLIST INDEXER")
        print(f"# Genre: {self.genre}")
        print(f"# Duplicate Detection: {'ON' if self.skip_duplicates else 'OFF'}")
        print(f"{'#'*70}\n")
        
        # Get all video URLs
        videos = self.get_playlist_urls(playlist_url)
        
        if not videos:
            print("No videos found in playlist!")
            return
        
        self.stats['total_found'] = len(videos)
        
        # Process each video
        for i, (url, title) in enumerate(videos, 1):
            print(f"\n[{i}/{len(videos)}]")
            self.index_video(url, title)
        
        # Print summary
        self.print_summary()
    
    def index_from_search(self, query, max_results=50):
        """Index videos from a YouTube search query."""
        print(f"\n{'#'*70}")
        print(f"# YOUTUBE SEARCH INDEXER")
        print(f"# Query: {query}")
        print(f"# Genre: {self.genre}")
        print(f"# Duplicate Detection: {'ON' if self.skip_duplicates else 'OFF'}")
        print(f"{'#'*70}\n")
        
        videos = self.search_youtube(query, max_results)
        
        if not videos:
            print("No videos found!")
            return
        
        self.stats['total_found'] = len(videos)
        
        for i, (url, title) in enumerate(videos, 1):
            print(f"\n[{i}/{len(videos)}]")
            self.index_video(url, title)
        
        self.print_summary()
    
    def print_summary(self):
        """Print indexing statistics."""
        print(f"\n{'='*70}")
        print(f"INDEXING SUMMARY")
        print(f"{'='*70}")
        print(f"Videos found:              {self.stats['total_found']}")
        print(f"Successfully indexed:      {self.stats['successfully_indexed']}")
        print(f"Skipped (title duplicate): {self.stats['skipped_duplicates_title']}")
        print(f"Skipped (audio duplicate): {self.stats['skipped_duplicates_audio']}")
        print(f"Failed:                    {self.stats['failed']}")
        print(f"{'='*70}")
        print(f"Total unique songs added:  {self.stats['successfully_indexed']}")
        print(f"{'='*70}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="YouTube Playlist/Search Indexer with Duplicate Detection",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Index a YouTube playlist
  python playlist_indexer.py --playlist "https://youtube.com/playlist?list=..." --genre Pakistani
  
  # Index from a channel
  python playlist_indexer.py --playlist "https://youtube.com/@CokeStudio/videos" --genre Pakistani
  
  # Search and index
  python playlist_indexer.py --search "Pakistani pop songs 2024" --limit 50 --genre Pakistani
  
  # Disable duplicate detection
  python playlist_indexer.py --playlist "URL" --no-skip-duplicates
        """
    )
    
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--playlist', help='YouTube playlist or channel URL')
    group.add_argument('--search', help='YouTube search query')
    
    parser.add_argument('--genre', '-g', default='Unknown', help='Genre tag for songs (default: Unknown)')
    parser.add_argument('--limit', '-l', type=int, default=50, help='Max results for search (default: 50)')
    parser.add_argument('--no-skip-duplicates', action='store_true', help='Disable duplicate detection')
    
    args = parser.parse_args()
    
    indexer = PlaylistIndexer(
        genre=args.genre,
        skip_duplicates=not args.no_skip_duplicates
    )
    
    if args.playlist:
        indexer.index_from_playlist(args.playlist)
    else:
        indexer.index_from_search(args.search, max_results=args.limit)
