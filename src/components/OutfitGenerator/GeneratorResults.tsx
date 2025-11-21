import React from 'react';
import { Button } from '../common';
import type { GeneratorResponse, Occasion } from '../../types';
import { sanitizeHTML } from '../../utils/sanitize';
import styles from './GeneratorResults.module.css';

interface GeneratorResultsProps {
  results: GeneratorResponse;
  originalImage: string | null;
  occasion: Occasion | null;
  onReset: () => void;
}

export const GeneratorResults: React.FC<GeneratorResultsProps> = ({
  results,
  originalImage: _originalImage,
  occasion,
  onReset,
}) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Your AI-Generated Outfit</h3>

      <div className={styles.imagesGrid}>
        {results.outfit_image_url && (
          <div className={styles.imageCard}>
            <h4>Generated Outfit</h4>
            <img src={results.outfit_image_url} alt="Generated outfit" className={styles.image} />
          </div>
        )}
      </div>

      {results.outfit_description && (
        <div className={styles.descriptionSection}>
          <h4>Outfit Description</h4>
          <p dangerouslySetInnerHTML={{ __html: sanitizeHTML(results.outfit_description) }} />
        </div>
      )}

      {occasion && (
        <div className={styles.occasionBadge}>
          <span className={styles.badgeLabel}>Occasion:</span> {occasion}
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onReset} fullWidth>
          🔄 Generate Another Outfit
        </Button>
      </div>
    </div>
  );
};
