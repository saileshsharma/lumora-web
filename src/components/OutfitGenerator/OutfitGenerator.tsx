import React, { useState, useEffect } from 'react';
import { Button, ImageUpload, OccasionSelect, Loading, CameraModal, ArenaSubmitModal } from '../common';
import { GeneratorResults } from './GeneratorResults';
import { useGeneratorStore } from '../../store/generatorStore';
import { useAppStore } from '../../store/appStore';
import { generatorApi } from '../../services/api';
import { showError, updateToSuccess } from '../../utils/toast';
import { ERROR_MESSAGES, BUDGET_RANGES } from '../../constants';
import styles from './OutfitGenerator.module.css';

export const OutfitGenerator: React.FC = () => {
  const {
    imageData,
    occasion,
    budget,
    results,
    isLoading,
    setImageData,
    setOccasion,
    setBudget,
    setResults,
    setLoading,
    reset,
  } = useGeneratorStore();

  const { sharedImage, setSharedImage } = useAppStore();

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [customOccasion, setCustomOccasion] = useState('');
  const [wowFactor, setWowFactor] = useState(5);
  const [brands, setBrands] = useState('');
  const [conditions, setConditions] = useState('');
  const [isArenaModalOpen, setIsArenaModalOpen] = useState(false);

  // Load shared image from Outfit Rater if available
  useEffect(() => {
    if (sharedImage && !imageData) {
      setImageData(sharedImage);
    }
  }, [sharedImage, imageData, setImageData]);

  const getWowLabel = (value: number) => {
    if (value <= 3) return 'Classic & Safe';
    if (value <= 6) return 'Balanced & Stylish';
    return 'Bold & Creative';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!imageData) {
      showError(ERROR_MESSAGES.NO_IMAGE_SELECTED);
      return;
    }

    if (!occasion) {
      showError('Please select an occasion');
      return;
    }

    setLoading(true);

    try {
      const result = await generatorApi.generateOutfit(
        imageData,
        occasion,
        budget || undefined
      );
      setResults(result);
      updateToSuccess('', 'Outfit generated!');

      // Scroll to results
      setTimeout(() => {
        document.getElementById('generator-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      // Show error with retry button
      showError('Failed to generate outfit. Please try again.', () => handleSubmit());
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setCustomOccasion('');
    setWowFactor(5);
    setBrands('');
    setConditions('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitToArena = () => {
    setIsArenaModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {sharedImage && imageData ? '✨ Generate Improved Outfit' : 'Generate New Outfit'}
        </h2>
        <p className={styles.description}>
          {sharedImage && imageData
            ? 'Your image and occasion have been loaded. Adjust settings and generate an improved outfit!'
            : 'Upload your photo and let AI create the perfect outfit suggestion for any occasion'}
        </p>
      </div>

      {!results && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <ImageUpload
            onImageSelect={(image) => {
              setImageData(image);
              setSharedImage(image);
            }}
            currentImage={imageData}
            onCameraClick={() => setIsCameraOpen(true)}
            label="Upload your photo"
          />

          <div className={styles.wowSection}>
            <label className={styles.label}>
              Wow Factor: <span className={styles.wowValue}>{wowFactor}</span>
            </label>
            <div className={styles.wowLabel}>{getWowLabel(wowFactor)}</div>
            <input
              type="range"
              min="1"
              max="10"
              value={wowFactor}
              onChange={(e) => setWowFactor(parseInt(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>Safe</span>
              <span>Balanced</span>
              <span>Bold</span>
            </div>
          </div>

          <OccasionSelect
            value={occasion || (customOccasion ? 'custom' : null)}
            onChange={setOccasion}
            customValue={customOccasion}
            onCustomChange={setCustomOccasion}
          />

          <div className={styles.inputGroup}>
            <label className={styles.label}>Preferred Brands (Optional)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g., Zara, H&M, Uniqlo (max 5, comma-separated)"
              value={brands}
              onChange={(e) => setBrands(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Budget (Optional)</label>
            <select
              className={styles.select}
              value={budget || ''}
              onChange={(e) => setBudget(e.target.value || null)}
            >
              <option value="">Select budget range</option>
              {BUDGET_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Special Conditions (Optional)</label>
            <textarea
              className={styles.textarea}
              placeholder="e.g., Weather, dress code, personal preferences..."
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            🎨 Generate Outfit
          </Button>
        </form>
      )}

      {isLoading && <Loading message="AI is creating your perfect outfit..." fullScreen={false} />}

      {results && (
        <div id="generator-results">
          <GeneratorResults
            results={results}
            originalImage={imageData}
            occasion={occasion}
            onReset={handleReset}
            onSubmitToArena={handleSubmitToArena}
          />
        </div>
      )}

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(image) => {
          setImageData(image);
          setSharedImage(image);
          setIsCameraOpen(false);
        }}
      />

      {results && imageData && occasion && (
        <ArenaSubmitModal
          isOpen={isArenaModalOpen}
          onClose={() => setIsArenaModalOpen(false)}
          imageData={results.outfit_image_url}
          occasion={occasion}
          sourceMode="generator"
          defaultTitle={`AI-Generated ${occasion} Outfit`}
          defaultDescription="Created by AI Outfit Assistant"
        />
      )}
    </div>
  );
};
