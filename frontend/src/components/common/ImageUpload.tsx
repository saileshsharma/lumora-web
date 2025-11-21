import React, { useRef } from 'react';
import { Button } from './Button';
import { MAX_FILE_SIZE, ERROR_MESSAGES } from '../../constants';
import { showError } from '../../utils/toast';
import { fileToBase64 } from '../../services/api';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void;
  currentImage: string | null;
  onCameraClick?: () => void;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  currentImage,
  onCameraClick,
  label = 'Upload outfit photo',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileSelect = async (file: File) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      showError(ERROR_MESSAGES.FILE_TOO_LARGE);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError(ERROR_MESSAGES.INVALID_FILE_TYPE);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress (since FileReader doesn't provide progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const base64 = await fileToBase64(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Show preview with smooth transition
      setTimeout(() => {
        onImageSelect(base64);
        setIsUploading(false);
        setUploadProgress(0);
      }, 300);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      showError('Failed to process image');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>

      <div
        className={`${styles.uploadArea} ${currentImage ? styles.hasImage : ''} ${
          isDragging ? styles.dragging : ''
        }`}
        onClick={!isUploading ? handleClick : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className={styles.uploadingState}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className={styles.progressText}>Uploading... {uploadProgress}%</p>
          </div>
        ) : currentImage ? (
          <img src={currentImage} alt="Preview" className={styles.preview} />
        ) : (
          <div className={styles.prompt}>
            <span className={styles.icon}>📷</span>
            <p>Click to upload or drag and drop</p>
            <p className={styles.hint}>JPEG, PNG, or WebP (max 10MB)</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className={styles.fileInput}
          disabled={isUploading}
        />
      </div>

      {onCameraClick && (
        <Button variant="secondary" onClick={onCameraClick} className={styles.cameraButton}>
          📷 Use Camera
        </Button>
      )}
    </div>
  );
};
