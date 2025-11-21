import React, { useMemo, useState } from 'react';
import { Button } from '../common';
import type { GeneratorResponse, Occasion, OutfitDetails } from '../../types';
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
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  // Parse the JSON outfit description
  const outfitDetails = useMemo<OutfitDetails | null>(() => {
    if (!results.outfit_description) return null;

    try {
      return JSON.parse(results.outfit_description) as OutfitDetails;
    } catch (error) {
      console.error('Failed to parse outfit description:', error);
      return null;
    }
  }, [results.outfit_description]);

  // Helper to get contrasting text color for color badges
  const getContrastColor = (color: string) => {
    const lightColors = ['white', 'cream', 'beige', 'light', 'yellow', 'lime', 'cyan', 'pink'];
    return lightColors.some(c => color.toLowerCase().includes(c)) ? '#000' : '#fff';
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>AI Generated</span>
          <h2 className={styles.mainTitle}>Your Perfect Outfit</h2>
          <p className={styles.subtitle}>Curated just for you{occasion && ` for ${occasion}`}</p>
        </div>
      </div>

      {/* Generated Image */}
      {results.outfit_image_url && (
        <div className={styles.imageShowcase}>
          <div className={styles.imageFrame}>
            <img src={results.outfit_image_url} alt="Generated outfit" className={styles.showcaseImage} />
            <div className={styles.imageOverlay}>
              <span className={styles.overlayText}>Your New Look</span>
            </div>
          </div>
        </div>
      )}

      {outfitDetails && (
        <div className={styles.detailsContainer}>
          {/* Outfit Concept Card */}
          <div className={styles.conceptCard}>
            <div className={styles.cardIcon}>✨</div>
            <h3 className={styles.cardTitle}>The Vision</h3>
            <div className={styles.conceptContent}>
              <p className={styles.conceptText}>{outfitDetails.outfit_concept}</p>
              <div className={styles.decorativeLine}></div>
            </div>
          </div>

          {/* Outfit Pieces Section */}
          <div className={styles.piecesSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.headerIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V7Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 7L6 8L5 21H19L18 8L16 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className={styles.sectionTitle}>Your Outfit Pieces</h3>
              <span className={styles.itemCount}>{outfitDetails.items?.length || 0} items</span>
            </div>

            <div className={styles.piecesGrid}>
              {outfitDetails.items?.map((item, index) => (
                <div
                  key={index}
                  className={`${styles.pieceCard} ${selectedItem === index ? styles.pieceCardActive : ''}`}
                  onClick={() => setSelectedItem(selectedItem === index ? null : index)}
                >
                  <div className={styles.pieceNumber}>{index + 1}</div>
                  <div className={styles.pieceContent}>
                    <div className={styles.pieceHeader}>
                      <h4 className={styles.pieceType}>{item.type}</h4>
                      <span
                        className={styles.colorBadge}
                        style={{
                          backgroundColor: item.color.toLowerCase(),
                          color: getContrastColor(item.color)
                        }}
                      >
                        {item.color}
                      </span>
                    </div>
                    <p className={styles.pieceDescription}>{item.description}</p>
                    <div className={styles.styleNotes}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
                      </svg>
                      <span>{item.style_notes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Color Palette Section */}
          <div className={styles.paletteSection}>
            <div className={styles.paletteHeader}>
              <div className={styles.paletteIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className={styles.sectionTitle}>Color Harmony</h3>
            </div>
            <div className={styles.paletteContent}>
              <p className={styles.paletteDescription}>{outfitDetails.color_palette}</p>
            </div>
          </div>

          {/* Occasion Perfect Section */}
          {occasion && (
            <div className={styles.occasionSection}>
              <div className={styles.occasionBanner}>
                <div className={styles.occasionIcon}>📍</div>
                <div className={styles.occasionContent}>
                  <h3 className={styles.occasionTitle}>Perfect for {occasion}</h3>
                  <p className={styles.occasionDescription}>{outfitDetails.occasion_notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Shopping Recommendations */}
          {outfitDetails.product_recommendations && outfitDetails.product_recommendations.length > 0 && (
            <div className={styles.shoppingSection}>
              <div className={styles.shoppingHeader}>
                <div className={styles.shoppingIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>Shop The Look</h3>
                  <p className={styles.shoppingSubtitle}>Handpicked recommendations for you</p>
                </div>
              </div>

              <div className={styles.productsCarousel}>
                {outfitDetails.product_recommendations.map((product, index) => (
                  <div key={index} className={styles.productItem}>
                    <div className={styles.productBadge}>{index + 1}</div>
                    <div className={styles.productDetails}>
                      <h4 className={styles.productTitle}>{product.item}</h4>
                      <div className={styles.productMeta}>
                        <span className={styles.productBrand}>{product.brand}</span>
                        <span className={styles.productSeparator}>•</span>
                        <span className={styles.productCategory}>{product.type}</span>
                      </div>
                      <p className={styles.productDesc}>{product.description}</p>
                      <div className={styles.productFooter}>
                        <div className={styles.productPriceTag}>
                          <span className={styles.priceLabel}>Price</span>
                          <span className={styles.priceValue}>{product.price}</span>
                        </div>
                        <div className={styles.productWhy}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          <span>{product.reason}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fallback */}
      {!outfitDetails && results.outfit_description && (
        <div className={styles.fallbackSection}>
          <h4>Outfit Description</h4>
          <pre className={styles.rawJson}>{results.outfit_description}</pre>
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actionBar}>
        <Button variant="secondary" onClick={onReset} fullWidth>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Generate Another Outfit
        </Button>
      </div>
    </div>
  );
};
