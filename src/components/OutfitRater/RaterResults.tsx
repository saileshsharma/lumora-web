import React, { useState } from 'react';
import { Button } from '../common';
import { getAllShoppingLinks } from '../../services/api';
import type { RatingResponse, Occasion } from '../../types';
import { sanitizeHTML } from '../../utils/sanitize';
import styles from './RaterResults.module.css';

interface RaterResultsProps {
  results: RatingResponse;
  originalImage: string | null;
  occasion: Occasion | null;
  onReset: () => void;
  onGenerateImproved?: () => void;
  onSubmitToArena?: () => void;
}

export const RaterResults: React.FC<RaterResultsProps> = ({
  results,
  originalImage,
  occasion: _occasion,
  onReset,
  onGenerateImproved,
  onSubmitToArena,
}) => {
  const [showRoast, setShowRoast] = useState(false);

  const handleShopClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainLayout}>
        {/* Left Column - Image and Scores */}
        <div className={styles.leftColumn}>
          <div className={styles.imageSection}>
            {originalImage && (
              <img src={originalImage} alt="Your outfit" className={styles.outfitImage} />
            )}
          </div>

          <div className={styles.scoresSection}>
            <h3 className={styles.sectionTitle}>Your Ratings</h3>

            <div className={styles.scoresGrid}>
          <div className={styles.scoreCard}>
            <div className={styles.scoreLabel}>Wow Factor</div>
            <div className={styles.scoreValue}>{results.wow_factor}/10</div>
            {results.wow_factor_explanation && (
              <div className={styles.scoreExplanation}>{results.wow_factor_explanation}</div>
            )}
          </div>

          <div className={styles.scoreCard}>
            <div className={styles.scoreLabel}>Occasion Fitness</div>
            <div className={styles.scoreValue}>{results.occasion_fitness}/10</div>
            {results.occasion_fitness_explanation && (
              <div className={styles.scoreExplanation}>{results.occasion_fitness_explanation}</div>
            )}
          </div>

          <div className={styles.scoreCard}>
            <div className={styles.scoreLabel}>Overall Rating</div>
            <div className={styles.scoreValue}>{results.overall_rating}/10</div>
            {results.overall_explanation && (
              <div className={styles.scoreExplanation}>{results.overall_explanation}</div>
            )}
          </div>
        </div>
      </div>
    </div>

        {/* Right Column - Feedback Sections */}
        <div className={styles.rightColumn}>
      <div className={styles.feedbackSection}>
        {results.strengths && results.strengths.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>✅ Strengths</h3>
            <ul className={styles.list}>
              {results.strengths.map((strength, index) => (
                <li key={index} className={styles.listItem}>
                  <span className={styles.icon}>✅</span>
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(strength) }} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {results.improvements && results.improvements.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>💡 Areas for Improvement</h3>
            <ul className={styles.list}>
              {results.improvements.map((improvement, index) => (
                <li key={index} className={styles.listItem}>
                  <span className={styles.icon}>💡</span>
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(improvement) }} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {results.suggestions && results.suggestions.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🎯 Suggestions</h3>
            <ul className={styles.list}>
              {results.suggestions.map((suggestion, index) => (
                <li key={index} className={styles.listItem}>
                  <span className={styles.icon}>🎯</span>
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(suggestion) }} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {results.roast && (
        <div className={styles.roastSection}>
          <h3 className={styles.sectionTitle}>Roast Mode 🔥</h3>
          {!showRoast ? (
            <Button
              variant="danger"
              onClick={() => setShowRoast(true)}
              className={styles.roastButton}
            >
              🔥 Ready for the Roast? 🔥
            </Button>
          ) : (
            <div className={styles.roastContent}>
              <p dangerouslySetInnerHTML={{ __html: sanitizeHTML(results.roast) }} />
            </div>
          )}
        </div>
      )}

      {results.shopping_recommendations && results.shopping_recommendations.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🛍️ Shopping Recommendations</h3>
          <div className={styles.shoppingGrid}>
            {results.shopping_recommendations.map((item, index) => {
              const shoppingLinks = getAllShoppingLinks(item.item);
              return (
                <div key={index} className={styles.shoppingCard}>
                  <h4 className={styles.shoppingItemName}>{item.item}</h4>
                  <p className={styles.shoppingItemPrice}>{item.price}</p>
                  <p className={styles.shoppingItemDescription}>{item.description}</p>
                  <p className={styles.shoppingItemReason}>
                    <strong>Why:</strong> {item.reason}
                  </p>
                  <div className={styles.shopButtonsGrid}>
                    {shoppingLinks.map((link) => (
                      <button
                        key={link.site}
                        onClick={() => handleShopClick(link.url)}
                        className={`${styles.shopButton} ${styles[`shop-${link.site}`]}`}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.actionButtons}>
        {onGenerateImproved && (
          <Button variant="primary" onClick={onGenerateImproved} fullWidth>
            ✨ Generate Improved Outfit
          </Button>
        )}

        {onSubmitToArena && (
          <Button variant="secondary" onClick={onSubmitToArena} fullWidth>
            🏆 Submit to Fashion Arena
          </Button>
        )}

        <Button variant="secondary" onClick={onReset} fullWidth>
          🔄 Rate Another Outfit
        </Button>
      </div>
        </div>
      </div>
    </div>
  );
};
