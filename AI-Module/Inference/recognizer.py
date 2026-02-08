#!/usr/bin/env python3
"""
Song Recognition Service
Takes an audio file and identifies the song using fingerprint matching.
"""

import os
import sys
import json
import argparse
from collections import Counter

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Add necessary paths for internal imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Preprocessing'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Core'))

from processor import AudioProcessor
from fingerprinter import Fingerprinter
from database import DatabaseHandler


class SongRecognizer:
    def __init__(self, db_path="songs.db"):
        """Initialize the song recognizer."""
        self.processor = AudioProcessor()
        self.fingerprinter = Fingerprinter()
        self.db = DatabaseHandler(db_path)
    
    def recognize(self, audio_file_path, return_top_n=3, min_confidence=0.1):
        """
        Recognize a song from an audio file.
        
        Args:
            audio_file_path: Path to the audio file to recognize
            return_top_n: Number of top matches to return
            min_confidence: Minimum confidence percentage to consider a match valid
            
        Returns:
            dict with recognition results
        """
        try:
            # 1. Load audio
            y, sr = self.processor.load_audio(audio_file_path)
            if y is None:
                return {
                    "success": False,
                    "error": "Failed to load audio file"
                }
            
            # 2. Generate fingerprints
            spec = self.processor.get_spectrogram(y)
            peaks = self.fingerprinter.get_2d_peaks(spec)
            hashes = self.fingerprinter.generate_hashes(peaks)
            
            if not hashes:
                return {
                    "success": False,
                    "error": "No fingerprints could be generated from audio"
                }
            
            # 3. Query database for matches
            matches = list(self.db.get_matches(hashes))
            
            if not matches:
                return {
                    "success": True,
                    "match_found": False,
                    "message": "No matching songs found in database",
                    "fingerprints_generated": len(hashes)
                }
            
            # 4. Count matches per song and calculate alignment
            song_matches = {}
            
            for song_id, db_offset, recorded_offset in matches:
                if song_id not in song_matches:
                    song_matches[song_id] = []
                
                # Time difference (alignment)
                time_diff = db_offset - recorded_offset
                song_matches[song_id].append(time_diff)
            
            # 5. Find best match using time alignment
            best_matches = []
            
            for song_id, time_diffs in song_matches.items():
                # Find the most common time alignment (consensus)
                alignment_counter = Counter(time_diffs)
                best_alignment, aligned_count = alignment_counter.most_common(1)[0]
                
                # Calculate confidence score
                total_fingerprints = len(hashes)
                match_ratio = aligned_count / total_fingerprints
                confidence = min(100, match_ratio * 100)
                
                # Filter by confidence threshold
                if confidence < min_confidence:
                    continue
                
                # Get song info
                song_info = self.db.get_song_by_id(song_id)
                if song_info:
                    title, artist, genre, thumbnail, url = song_info
                    
                    best_matches.append({
                        "song_id": song_id,
                        "title": title,
                        "artist": artist,
                        "genre": genre,
                        "thumbnail": thumbnail,
                        "url": url,
                        "confidence": round(confidence, 2),
                        "matched_fingerprints": aligned_count,
                        "total_fingerprints": total_fingerprints,
                        "time_offset": best_alignment
                    })
            
            # Sort by confidence
            best_matches.sort(key=lambda x: x['confidence'], reverse=True)
            
            # Return top N matches
            top_matches = best_matches[:return_top_n]
            
            if not top_matches:
                return {
                    "success": True,
                    "match_found": False,
                    "message": "Matches found but could not retrieve song info"
                }
            
            return {
                "success": True,
                "match_found": True,
                "matches": top_matches,
                "fingerprints_generated": len(hashes),
                "total_matches_checked": len(matches)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Recognition failed: {str(e)}"
            }


def main():
    parser = argparse.ArgumentParser(
        description="Recognize songs from audio files",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Recognize a song
  python recognizer.py audio.mp3
  
  # Get top 5 matches
  python recognizer.py audio.wav --top 5
  
  # Output as JSON
  python recognizer.py audio.mp3 --json
        """
    )
    
    parser.add_argument('audio_file', help='Path to audio file to recognize')
    parser.add_argument('--top', '-t', type=int, default=3, help='Number of top matches to return (default: 3)')
    parser.add_argument('--json', action='store_true', help='Output result as JSON')
    parser.add_argument('--db', default='songs.db', help='Path to database file (default: songs.db)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.audio_file):
        print(f"Error: Audio file not found: {args.audio_file}")
        sys.exit(1)
    
    # Recognize
    recognizer = SongRecognizer(db_path=args.db)
    result = recognizer.recognize(args.audio_file, return_top_n=args.top)
    
    # Output
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        # Human-readable output
        if not result['success']:
            print(f"❌ Error: {result['error']}")
            sys.exit(1)
        
        if not result['match_found']:
            print(f"🔍 {result['message']}")
            print(f"   Generated {result.get('fingerprints_generated', 0)} fingerprints")
            sys.exit(0)
        
        print("🎵 Song Recognition Results")
        print("=" * 60)
        
        for i, match in enumerate(result['matches'], 1):
            print(f"\n#{i} Match - Confidence: {match['confidence']}%")
            print(f"   Title:  {match['title']}")
            print(f"   Artist: {match['artist']}")
            print(f"   Genre:  {match['genre']}")
            print(f"   Matched: {match['matched_fingerprints']}/{match['total_fingerprints']} fingerprints")
        
        print("\n" + "=" * 60)
        print(f"Fingerprints generated: {result['fingerprints_generated']}")
        print(f"Total matches checked: {result['total_matches_checked']}")


if __name__ == "__main__":
    main()
