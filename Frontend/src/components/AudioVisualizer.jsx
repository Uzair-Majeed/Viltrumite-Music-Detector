import { useRef, useEffect } from 'react';

const AudioVisualizer = ({ isRecording, stream }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const sourceRef = useRef(null);
    const audioContextRef = useRef(null);

    useEffect(() => {
        if (isRecording && stream) {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            const audioCtx = audioContextRef.current;
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;

            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            analyserRef.current = analyser;
            sourceRef.current = source;

            const bufferLength = analyser.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            animate();
        } else {
            stopAnimation();
        }

        return () => {
            stopAnimation();
        };
    }, [isRecording, stream]);

    const stopAnimation = () => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        // Don't close audio context here to reuse it, or manage it carefully
    };

    const animate = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;

        analyser.getByteFrequencyData(dataArray);

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw bars
        const barWidth = (width / dataArray.length) * 2.5;
        let barHeight;
        let x = 0;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#8b5cf6'); // Primary
        gradient.addColorStop(1, '#ec4899'); // Secondary

        ctx.fillStyle = gradient;

        for (let i = 0; i < dataArray.length; i++) {
            barHeight = dataArray[i] / 2; // Scale down

            // Draw rounded rect manually or just rect
            ctx.fillRect(x, height - barHeight - 10, barWidth, barHeight); // Raised up a bit

            // Mirror effect (optional, reflection)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(x, height, barWidth, barHeight * 0.2);
            ctx.fillStyle = gradient;

            x += barWidth + 1;
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full h-40 md:h-60 rounded-xl"
        />
    );
};

export default AudioVisualizer;
