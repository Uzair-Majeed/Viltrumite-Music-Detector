import numpy as np
from scipy.ndimage import maximum_filter
import hashlib

class Fingerprinter:
    def __init__(self):
        # Configuration for peak finding
        self.fan_value = 5           # Reduced from 8 to further reduce density
        self.amp_min = 30            # Increased from 15 to focus on much louder peaks
        self.neighborhood_size = 20  # Size of the neighborhood for local maxima

    def get_2d_peaks(self, spectrogram):
        """
        Finds local maxima (peaks) in the 2D spectrogram.
        Returns a list of (frequency_index, time_index) tuples.
        """
        # 1. Use maximum filter to find local peaks
        # This checks if a pixel is the highest value in its neighborhood
        local_max = maximum_filter(spectrogram, size=self.neighborhood_size) == spectrogram
        
        # 2. Boolean mask of peaks that additionally meet the minimum amplitude requirement
        background = (spectrogram == 0)
        eroded_background = background # simplified
        detected_peaks = local_max ^ eroded_background
        
        # 3. Filter out low amplitude peaks
        peaks = []
        rows, cols = spectrogram.shape
        for r in range(rows):
            for c in range(cols):
                if detected_peaks[r, c] and spectrogram[r, c] > self.amp_min:
                    peaks.append((r, c))
                    
        return peaks

    def generate_hashes(self, peaks):
        """
        Generates hashes from the list of peaks using the "combinatorial hashing" strategy.
        Each hash allows us to match a specific constellation of frequencies.
        
        Returns: List of (hash_string, time_offset_from_beginning)
        """
        peaks.sort(key=lambda x: x[1]) # Sort by time
        
        hashes = []
        for i in range(len(peaks)):
            for j in range(1, self.fan_value):
                if (i + j) < len(peaks):
                    
                    # Anchor point
                    freq1 = peaks[i][0]
                    t1 = peaks[i][1]
                    
                    # Target point
                    freq2 = peaks[i + j][0]
                    t2 = peaks[i + j][1]
                    
                    t_delta = t2 - t1
                    
                    # Constraint: target must be within reasonable time distance
                    # (e.g., between 0 and 200 time steps)
                    if 0 < t_delta < 200:
                        # Create a hash from the frequencies and time delta
                        # Format: "f1|f2|time_delta"
                        h = hashlib.sha1(f"{freq1}|{freq2}|{t_delta}".encode('utf-8'))
                        # Use binary digest (20 bytes) instead of hex string (40 chars) to save 50% space
                        hash_digest = h.digest()
                        
                        # We return the hash and the ABSOLUTE time of the anchor (t1)
                        # This allows us to align the song later.
                        hashes.append((hash_digest, t1))
                        
        return hashes

if __name__ == "__main__":
    # Integration Test
    # Make sure to run this from the parent directory or adjust path
    try:
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Preprocessing'))
        from processor import AudioProcessor
        import sys
        
        if len(sys.argv) > 1:
            # 1. Load Audio
            proc = AudioProcessor()
            y, sr = proc.load_audio(sys.argv[1])
            if y is not None:
                print("Audio loaded.")
                
                # 2. Get Spectrogram
                spec = proc.get_spectrogram(y)
                print(f"Spectrogram generated. Shape: {spec.shape}")
                
                # 3. Find Peaks
                fp = Fingerprinter()
                peaks = fp.get_2d_peaks(spec)
                print(f"Found {len(peaks)} peaks.")
                
                # 4. Generate Hashes
                hashes = fp.generate_hashes(peaks)
                print(f"Generated {len(hashes)} fingerprints.")
                
                if len(hashes) > 0:
                    print(f"Sample Hash: {hashes[0]}")
        else:
            print("Usage: python fingerprinter.py <path_to_audio>")
            
    except ImportError:
        print("Please ensure audio_processor.py is in the same directory.")
