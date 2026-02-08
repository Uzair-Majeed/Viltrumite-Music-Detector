
import subprocess
import argparse
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Add necessary paths for internal imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Core'))

from youtube_indexer import YouTubeIndexer
from database import DatabaseHandler

def get_playlist_urls(playlist_url, start=1, end=50):
    print(f"Fetching songs from playlist (Range: {start} to {end}): {playlist_url}")
    cmd = [
        'yt-dlp',
        '--flat-playlist',  # Don't download, just list
        '--print', 'url',
        '--playlist-start', str(start),
        '--playlist-end', str(end),
        playlist_url
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error fetching playlist: {result.stderr}")
            return []
        
        urls = result.stdout.strip().split('\n')
        urls = [u for u in urls if u.strip()] # Filter empty
        return urls
    except Exception as e:
        print(f"Error: {e}")
        return []

def main():
    parser = argparse.ArgumentParser(description="Temp Playlist Indexer")
    parser.add_argument('--playlist', required=True, help="YouTube Playlist URL")
    parser.add_argument('--start', type=int, default=1, help="Start index (default: 1)")
    parser.add_argument('--end', type=int, default=50, help="End index (default: 50)")
    parser.add_argument('--genre', default="Anime", help="Genre for these songs")
    
    args = parser.parse_args()
    
    # Get URLs
    urls = get_playlist_urls(args.playlist, args.start, args.end)
    print(f"Found {len(urls)} videos in playlist matching range.")
    
    # Initialize Core Indexer
    indexer = YouTubeIndexer(genre=args.genre)
    
    # Process
    success_count = 0
    for i, url in enumerate(urls, 1):
        print(f"\n[{i}/{len(urls)}] Processing: {url}")
        if indexer.index_from_url(url, genre=args.genre):
            success_count += 1
            
    print(f"\n{'='*60}")
    print(f"Done! indexed {success_count}/{len(urls)}")

if __name__ == "__main__":
    main()
