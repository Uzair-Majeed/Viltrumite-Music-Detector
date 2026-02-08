#!/usr/bin/env python3
"""
Master Recognizer with Shazam Fallback & Auto-Indexing
"""

import os
import sys
import json
import asyncio
import argparse
import subprocess
from shazamio import Shazam

# Add necessary paths for internal imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Core'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Training'))

from recognizer import SongRecognizer
from youtube_indexer import YouTubeIndexer
from database import DatabaseHandler

async def trigger_auto_index(title, artist, genre="Unknown"):
    """
    Spawns a detached process to search and index the song from YouTube.
    """
    try:
        query = f"{title} {artist} official audio"
        # We call playlist_indexer.py to do the work. 
        # Note: Duplicate checking is ON by default in playlist_indexer.py
        indexer_path = os.path.join(os.path.dirname(__file__), "..", "Training", "playlist_indexer.py")
        cmd = [
            sys.executable, 
            indexer_path,
            "--search", query,
            "--limit", "1",
            "--genre", genre
        ]
        
        # Start detached
        subprocess.Popen(
            cmd, 
            stdout=subprocess.DEVNULL, 
            stderr=subprocess.DEVNULL,
            start_new_session=True
        )
        print(f"DEBUG: Triggered auto-indexing for {title} by {artist}", file=sys.stderr)
    except Exception as e:
        print(f"DEBUG: Failed to trigger auto-indexing: {e}", file=sys.stderr)

import difflib

def is_similar(str1, str2, threshold=0.7):
    """Simple fuzzy string comparison score (0 to 1)"""
    if not str1 or not str2: return False
    return difflib.SequenceMatcher(None, str1.lower(), str2.lower()).ratio() >= threshold

async def recognize_workflow(audio_path, db_path="songs.db", return_top_n=3):
    """
    1. Run local recognition (Top candidates)
    2. Run Shazam recognition
    3. Compare and decide on indexing
    """
    # Initialize components
    recognizer = SongRecognizer(db_path=db_path)
    shazam = Shazam()
    
    print(f"[*] Starting parallel recognition (Audio-based Local + Shazam)...", file=sys.stderr)
    
    # 1. Local Search (Checks your songs.db fingerprints)
    # We request top 10 internally to ensure we have enough variety to find unique library matches 
    # even if Shazam finds the primary song.
    local_result = recognizer.recognize(audio_path, return_top_n=10, min_confidence=0)
    local_matches = local_result.get('matches', [])
    
    # 2. Shazam Search (Checks Shazam's global database)
    shazam_match = None
    try:
        shazam_out = await shazam.recognize(audio_path)
        if shazam_out and shazam_out.get('track'):
            track = shazam_out['track']
            images = track.get('images', {})
            shazam_match = {
                "title": track.get('title', 'Unknown'),
                "artist": track.get('subtitle', 'Unknown'),
                "genre": track.get('genres', {}).get('primary', 'Unknown'),
                "thumbnail": images.get('coverarthq') or images.get('coverart'),
                "url": track.get('url'),
                "confidence": 100,
                "is_shazam_match": True
            }
    except Exception as e:
        print(f"[!] Shazam Error: {e}", file=sys.stderr)

    # decision making
    should_index = False
    match_found = len(local_matches) > 0 or shazam_match is not None
    
    if shazam_match:
        # Check if local top hit matches Shazam (via title/artist)
        already_indexed = False
        for local in local_matches:
            if is_similar(shazam_match['title'], local['title']) and \
               is_similar(shazam_match['artist'], local['artist']):
                already_indexed = True
                print(f"[#] Match confirmed: Shazam identified '{shazam_match['title']}', which you already have locally.", file=sys.stderr)
                message = f"Song recognized as '{shazam_match['title']}'! (Already in your library)"
                break
        
        if not already_indexed:
            should_index = True
            print(f"[+] Shazam found a NEW song: {shazam_match['title']}. Adding it to your DB via YouTube...", file=sys.stderr)
            message = f"New song discovered via Shazam: '{shazam_match['title']}'! Adding to your library..."
            asyncio.create_task(trigger_auto_index(shazam_match['title'], shazam_match['artist'], genre=shazam_match['genre']))
    elif local_matches:
        # Shazam failed or was empty, but we have local candidates
        print(f"[-] Shazam failed to identify, but found {len(local_matches)} local candidates.", file=sys.stderr)
        message = f"Shazam couldn't find it, but here are the best matches from your local database."
    else:
        # Both failed
        print(f"[!] No match found in local database or Shazam.", file=sys.stderr)
        message = "Song not found in your local database or Shazam."

    # Combine lists (Prefer Shazam first, then unique local hits)
    all_results = []
    seen_titles = set()

    if shazam_match:
        all_results.append(shazam_match)
        seen_titles.add(shazam_match['title'].lower())
    
    for local in local_matches:
        # Check if we already have a similar song in the list (usually Shazam)
        is_duplicate = False
        for seen in seen_titles:
            if is_similar(seen, local['title'], threshold=0.85):
                is_duplicate = True
                break
        
        if not is_duplicate:
            # Mark as library match for the frontend
            local['is_shazam_match'] = False
            all_results.append(local)
            seen_titles.add(local['title'].lower())

    # Sort results: Shazam matches (100% confidence typically) vs Local
    # all_results.sort(key=lambda x: x.get('confidence', 0), reverse=True)

    return {
        "success": True,
        "match_found": match_found,
        "matches": all_results[:3], # Strictly follow user's "3 matches required"
        "shazam_discovery": should_index,
        "message": message
    }

async def main():
    parser = argparse.ArgumentParser(description="Master Recognizer with Parallel Verification")
    parser.add_argument('audio_file', help='Path to audio file')
    default_db = os.path.join(os.path.dirname(__file__), '..', '..', 'Databases', 'songs.db')
    parser.add_argument('--db', default=default_db, help='Path to database')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    parser.add_argument('--top', '-t', type=int, default=3, help='Number of top local matches to check')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.audio_file):
        print(json.dumps({"success": False, "error": "File not found"}))
        return

    result = await recognize_workflow(args.audio_file, db_path=args.db, return_top_n=args.top)
    
    if args.json:
        print(json.dumps(result))
    else:
        print(result)

if __name__ == "__main__":
    asyncio.run(main())