import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RotateCcw, Check, Zap, ZapOff } from 'lucide-react';
import Button from '@/components/finom/Button';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    if (isStreaming) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [isStreaming, stopCamera, startCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);
    
    // Get image data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    
    // Stop camera after capture
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmPhoto = useCallback(() => {
    if (!capturedImage) return;

    // Convert data URL to File
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      });
  }, [capturedImage, onCapture]);

  // Start camera on mount
  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={() => { stopCamera(); onClose(); }}
          className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFlashEnabled(!flashEnabled)}
            className={`p-2 rounded-full backdrop-blur-sm ${
              flashEnabled ? 'bg-yellow-500 text-black' : 'bg-white/20 text-white'
            }`}
          >
            {flashEnabled ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
          </button>
          <button
            onClick={switchCamera}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Camera view or captured image */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center text-white">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-4">{error}</p>
              <Button variant="secondary" onClick={startCamera}>
                Réessayer
              </Button>
            </div>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Document frame guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[90%] max-w-md aspect-[3/4] border-2 border-white/50 rounded-2xl">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/50 rounded-full">
                  <span className="text-white text-sm">Cadrez le document</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Canvas for capture (hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        {capturedImage ? (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={retakePhoto}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <span className="text-xs">Reprendre</span>
            </button>
            
            <button
              onClick={confirmPhoto}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <span className="text-xs">Valider</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button
              onClick={capturePhoto}
              disabled={!isStreaming}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center disabled:opacity-50"
            >
              <div className="w-16 h-16 rounded-full border-4 border-black/20" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CameraCapture;
