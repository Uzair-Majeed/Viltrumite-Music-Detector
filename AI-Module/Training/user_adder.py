#!/usr/bin/env python3
import os
import sys
import argparse
import subprocess
import json
from pathlib import Path

# Add necessary paths for internal imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Core'))

from youtube_indexer import YouTubeIndexer
from database import DatabaseHandler

def get_video_info(url):
    """Get video duration and validation check using yt-dlp"""
    try:
        cmd = [
            'yt-dlp',
            '--get-duration',
            '--get-title',
            '--simulate',
            '--no-playlist',
            url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            return None, None
        
        lines = result.stdout.strip().split('\n')
        if not lines:
            return None, None
            
        title = lines[0]
        duration_str = lines[-1] # Usually the last line
        
        # Convert duration to seconds
        parts = duration_str.split(':')
        seconds = 0
        if len(parts) == 3: # H:M:S
            seconds = int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
        elif len(parts) == 2: # M:S
            seconds = int(parts[0]) * 60 + int(parts[1])
        elif len(parts) == 1: # S
            seconds = int(parts[0])
            
        return title, seconds
    except Exception as e:
        print(f"Error validating URL: {e}", file=sys.stderr)
        return None, None

def main():
    parser = argparse.ArgumentParser(description="Manually add a song from YouTube URL")
    parser.add_argument('url', help="YouTube URL to index")
    parser.add_argument('--genre', default="User Contributed", help="Genre label")
    default_db = os.path.join(os.path.dirname(__file__), '..', '..', 'Databases', 'songs.db')
    parser.add_argument('--db', default=default_db, help="Path to database")
    
    args = parser.parse_args()
    
    print(f"[*] Validating URL: {args.url}")
    title, duration = get_video_info(args.url)
    
    if duration is None:
        print(json.dumps({"success": False, "error": "Invalid YouTube URL or couldn't fetch info"}))
        return

    # User's limit: shouldn't be too long (let's stick to 10 mins / 600s)
    MAX_DURATION = 600
    if duration > MAX_DURATION:
        print(json.dumps({
            "success": False, 
            "error": f"Video is too long ({duration}s). Max allowed is {MAX_DURATION}s (10 mins)."
        }))
        return

    print(f"[+] Validation passed: '{title}' ({duration}s)")
    
    # Initialize indexer
    indexer = YouTubeIndexer(db_path=args.db)
    
    try:
        # Download, Fingerprint, Index
        file_path, thumb, d_title, artist = indexer.download_audio(args.url)
        if not file_path:
            print(json.dumps({"success": False, "error": "Download failed"}))
            return
            
        success = indexer.process_and_index(
            file_path, 
            url=args.url, 
            genre=args.genre, 
            thumbnail=thumb, 
            title=d_title or title, 
            artist=artist
        )
        
        indexer.cleanup_file(file_path)
        
        if success:
            print(json.dumps({
                "success": True, 
                "message": f"Successfully added '{d_title or title}' to Viltrumite library!",
                "title": d_title or title
            }))
        else:
            print(json.dumps({"success": False, "error": "Song already exists in database or failed to index."}))
            
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    main()
