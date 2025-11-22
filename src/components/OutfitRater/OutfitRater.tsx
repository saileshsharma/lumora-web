import React, { useState } from 'react';
import { Button, ImageUpload, OccasionSelect, Loading, CameraModal, ArenaSubmitModal } from '../common';
import { RaterResults } from './RaterResults';
import { useRaterStore } from '../../store/raterStore';
import { useAppStore } from '../../store/appStore';
import { useGeneratorStore } from '../../store/generatorStore';
import { raterApi } from '../../services/api';
import { showError, updateToSuccess } from '../../utils/toast';
import { ERROR_MESSAGES, BUDGET_RANGES, APP_MODES } from '../../constants';
import styles from './OutfitRater.module.css';

export const OutfitRater: React.FC = () => {
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
  } = useRaterStore();

  const { setSharedImage, setMode } = useAppStore();
  const {
    setImageData: setGeneratorImage,
    setOccasion: setGeneratorOccasion,
    reset: resetGenerator,
  } = useGeneratorStore();

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [customOccasion, setCustomOccasion] = useState('');
  const [isArenaModalOpen, setIsArenaModalOpen] = useState(false);

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
      const result = await raterApi.rateOutfit(imageData, occasion, budget || undefined);
      setResults(result);
      updateToSuccess('', 'Analysis complete!');

      // Scroll to results
      setTimeout(() => {
        document.getElementById('rater-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      // Show error with retry button
      showError('Failed to analyze outfit. Please try again.', () => handleSubmit());
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setCustomOccasion('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateImproved = () => {
    // Reset generator first to clear any old results
    resetGenerator();

    // Then transfer image and occasion to Generator
    if (imageData) {
      setGeneratorImage(imageData);
      setSharedImage(imageData);
    }
    if (occasion) {
      setGeneratorOccasion(occasion);
    }

    // Navigate to Generator mode
    setMode(APP_MODES.GENERATOR);

    // Scroll to top smoothly
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);

    // Show success message
    updateToSuccess('', '✨ Ready to generate improved outfit!');
  };

  const handleSubmitToArena = () => {
    setIsArenaModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Rate Your Outfit</h2>
        <p className={styles.description}>
          Upload a photo of your outfit and get AI-powered fashion advice with detailed ratings and
          recommendations
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
            label="Upload your outfit photo"
          />

          <OccasionSelect
            value={occasion || (customOccasion ? 'custom' : null)}
            onChange={setOccasion}
            customValue={customOccasion}
            onCustomChange={setCustomOccasion}
          />

          <div className={styles.budgetSection}>
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

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            ⭐ Rate My Outfit
          </Button>
        </form>
      )}

      {isLoading && <Loading message="AI is analyzing your outfit..." fullScreen={false} />}

      {results && (
        <div id="rater-results">
          <RaterResults
            results={results}
            originalImage={imageData}
            occasion={occasion}
            onReset={handleReset}
            onGenerateImproved={handleGenerateImproved}
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

      {imageData && occasion && (
        <ArenaSubmitModal
          isOpen={isArenaModalOpen}
          onClose={() => setIsArenaModalOpen(false)}
          imageData={imageData}
          occasion={occasion}
          sourceMode="rater"
          defaultTitle={`My ${occasion} Outfit`}
          defaultDescription={results ? `Rated ${results.overall_rating}/10 by AI` : ''}
        />
      )}
    </div>
  );
};
