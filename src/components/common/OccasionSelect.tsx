import React from 'react';
import { OCCASIONS } from '../../constants';
import type { Occasion } from '../../types';
import styles from './OccasionSelect.module.css';

interface OccasionSelectProps {
  value: Occasion | 'custom' | null;
  onChange: (occasion: Occasion | null) => void;
  customValue?: string;
  onCustomChange?: (value: string) => void;
}

export const OccasionSelect: React.FC<OccasionSelectProps> = ({
  value,
  onChange,
  customValue = '',
  onCustomChange,
}) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue === '') {
      onChange(null);
    } else if (selectedValue === 'custom') {
      // Keep as custom, but set null occasion until custom value is entered
      onChange(null);
    } else {
      onChange(selectedValue as Occasion);
    }
  };

  const showCustomInput = value === 'custom' || (value && !OCCASIONS.includes(value as any));

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        Occasion <span className={styles.required}>*</span>
      </label>

      <select
        className={styles.select}
        value={value || ''}
        onChange={handleSelectChange}
        required
      >
        <option value="">Select an occasion</option>
        {OCCASIONS.map((occasion) => (
          <option key={occasion} value={occasion}>
            {occasion}
          </option>
        ))}
        <option value="custom">Custom...</option>
      </select>

      {showCustomInput && (
        <input
          type="text"
          className={styles.customInput}
          placeholder="Enter custom occasion"
          value={customValue}
          onChange={(e) => {
            onCustomChange?.(e.target.value);
            // Also update the occasion when typing custom value
            if (e.target.value.trim()) {
              onChange(e.target.value.trim() as Occasion);
            }
          }}
          required
        />
      )}
    </div>
  );
};
