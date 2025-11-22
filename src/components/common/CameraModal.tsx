import React, { useRef, useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { CAMERA_CONSTRAINTS, ERROR_MESSAGES } from '../../constants';
import { showError } from '../../utils/toast';
import styles from './CameraModal.module.css';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !stream) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      showError(ERROR_MESSAGES.CAMERA_NOT_AVAILABLE);
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);

      // Convert canvas to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleUse = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Take Photo">
      <div className={styles.container}>
        <div className={styles.cameraView}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={styles.video}
            style={{ display: capturedImage ? 'none' : 'block' }}
          />

          <canvas ref={canvasRef} className={styles.canvas} style={{ display: 'none' }} />

          {capturedImage && (
            <img src={capturedImage} alt="Captured" className={styles.preview} />
          )}
        </div>

        <div className={styles.controls}>
          {!capturedImage ? (
            <Button variant="primary" onClick={handleCapture} fullWidth>
              📸 Capture Photo
            </Button>
          ) : (
            <div className={styles.buttonGroup}>
              <Button variant="secondary" onClick={handleRetake} fullWidth>
                🔄 Retake
              </Button>
              <Button variant="primary" onClick={handleUse} fullWidth>
                ✓ Use Photo
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
