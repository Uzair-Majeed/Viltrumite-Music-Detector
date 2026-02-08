import librosa
import numpy as np
import warnings

# Suppress PySoundFile warning as we expect it for some formats and have a fallback
warnings.filterwarnings("ignore", message="PySoundFile failed. Trying audioread instead.")
# Suppress FutureWarning from librosa internal call
warnings.filterwarnings("ignore", category=FutureWarning, module="librosa.core.audio")

class AudioProcessor:
    def __init__(self, sample_rate=44100):
        """
        Initialize the AudioProcessor.
        :param sample_rate: The target sample rate to convert all audio to (default 44.1kHz)
        """
        self.sample_rate = sample_rate

    def load_audio(self, file_path):
        """
        Loads an audio file, converts it to mono, and resamples it.
        
        :param file_path: Path to the input audio file.
        :return: Tuple (audio_time_series, sample_rate)
        """
        try:
            # librosa.load automatically resamples and converts to mono by default (mono=True)
            # sr=self.sample_rate ensures consistent sampling rate across all files
            y, sr = librosa.load(file_path, sr=self.sample_rate, mono=True)
            return y, sr
        except Exception as e:
            print(f"Error loading audio file {file_path}: {e}")
            return None, None

    def get_spectrogram(self, y):
        """
        Generates a spectrogram from the audio time series.
        Using Short-Time Fourier Transform (STFT).
        
        :param y: Audio time series.
        :return: Magnitude spectrogram.
        """
        # n_fft is the window size
        # hop_length is the step size
        window_size = 4096
        step_size = 2048
        
        # Perform STFT
        STFT = librosa.stft(y, n_fft=window_size, hop_length=step_size)
        
        # Convert to magnitude (ignoring phase for now, as we just want peaks)
        spectrogram = np.abs(STFT)
        
        return spectrogram

if __name__ == "__main__":
    # Test execution
    import sys
    
    if len(sys.argv) > 1:
        processor = AudioProcessor()
        audio_data, sr = processor.load_audio(sys.argv[1])
        if audio_data is not None:
            print(f"Successfully loaded {sys.argv[1]}")
            print(f"Sample Rate: {sr}")
            print(f"Data Shape: {audio_data.shape}")
            
            spec = processor.get_spectrogram(audio_data)
            print(f"Spectrogram Shape: {spec.shape}")
    else:
        print("Usage: python audio_processor.py <path_to_audio_file>")
