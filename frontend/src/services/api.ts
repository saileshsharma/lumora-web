/**
 * API Service Layer
 * Centralized HTTP client with error handling and type safety
 */

import { API_BASE_URL, ERROR_MESSAGES } from '../constants';
import type {
  RatingResponse,
  GeneratorResponse,
  ArenaSubmission,
  LeaderboardEntry,
  VoteRequest,
} from '../types';

/**
 * Custom error class for API errors
 */
export class ApiException extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.details = details;
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithErrorHandling<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage: string = ERROR_MESSAGES.SERVER_ERROR;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiException(errorMessage, response.status);
    }

    // Parse successful response
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Network errors
    if (error instanceof TypeError) {
      throw new ApiException(ERROR_MESSAGES.BACKEND_DOWN);
    }

    // Re-throw API exceptions
    if (error instanceof ApiException) {
      throw error;
    }

    // Unknown errors
    throw new ApiException(ERROR_MESSAGES.SERVER_ERROR);
  }
}

/**
 * Outfit Rater API
 */
export const raterApi = {
  /**
   * Rate an outfit image
   */
  async rateOutfit(
    imageData: string,
    occasion: string,
    budget?: string
  ): Promise<RatingResponse> {
    const response = await fetchWithErrorHandling<{ data: string }>('/rate-outfit', {
      method: 'POST',
      body: JSON.stringify({
        image: imageData,
        occasion,
        budget,
      }),
    });

    // Parse the stringified JSON response
    return JSON.parse(response.data);
  },
};

/**
 * Outfit Generator API
 */
export const generatorApi = {
  /**
   * Generate a new outfit
   */
  async generateOutfit(
    imageData: string,
    occasion: string,
    budget?: string
  ): Promise<GeneratorResponse> {
    const response = await fetchWithErrorHandling<{ data: string }>('/generate-outfit', {
      method: 'POST',
      body: JSON.stringify({
        image: imageData,
        occasion,
        budget,
      }),
    });

    // Parse the stringified JSON response
    return JSON.parse(response.data);
  },

  /**
   * Generate improved outfit based on recommendations
   */
  async generateImprovedOutfit(
    originalImage: string,
    occasion: string,
    suggestions: string[]
  ): Promise<GeneratorResponse> {
    const response = await fetchWithErrorHandling<{ data: string }>('/generate-outfit', {
      method: 'POST',
      body: JSON.stringify({
        image: originalImage,
        occasion,
        budget: 'Based on AI recommendations',
        improvement_mode: true,
        suggestions,
      }),
    });

    return JSON.parse(response.data);
  },
};

/**
 * Fashion Arena API
 */
export const arenaApi = {
  /**
   * Get all arena submissions
   */
  async getSubmissions(): Promise<ArenaSubmission[]> {
    const response = await fetchWithErrorHandling<{ submissions: ArenaSubmission[] }>(
      '/arena/submissions'
    );
    return response.submissions;
  },

  /**
   * Get leaderboard
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await fetchWithErrorHandling<{ leaderboard: LeaderboardEntry[] }>(
      '/arena/leaderboard'
    );
    return response.leaderboard;
  },

  /**
   * Submit outfit to arena
   */
  async submitOutfit(
    photo: string,
    title: string,
    occasion: string,
    description?: string,
    sourceMode?: string
  ): Promise<ArenaSubmission> {
    const response = await fetchWithErrorHandling<{
      success: boolean;
      submission: ArenaSubmission;
    }>('/arena/submit', {
      method: 'POST',
      body: JSON.stringify({
        photo,
        title,
        occasion,
        description: description || '',
        source_mode: sourceMode || 'rater',
      }),
    });

    return response.submission;
  },

  /**
   * Like a submission
   */
  async likeSubmission(submissionId: string): Promise<{ likes: number }> {
    return await fetchWithErrorHandling<{ likes: number }>('/arena/like', {
      method: 'POST',
      body: JSON.stringify({
        submission_id: submissionId,
      }),
    });
  },

  /**
   * Vote between two submissions
   */
  async vote(voteData: VoteRequest): Promise<void> {
    await fetchWithErrorHandling<{ success: boolean }>('/arena/vote', {
      method: 'POST',
      body: JSON.stringify(voteData),
    });
  },

  /**
   * Delete a submission (admin only - requires password)
   * NOTE: In production, this should use proper authentication
   */
  async deleteSubmission(submissionId: string, password: string): Promise<void> {
    await fetchWithErrorHandling<{ success: boolean }>(
      `/arena/submission/${submissionId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      }
    );
  },
};

/**
 * Utility function to convert File to base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Utility function to get shopping search URL for multiple stores
 */
export function getShoppingUrl(query: string, site: string = 'amazon'): string {
  const encodedQuery = encodeURIComponent(query);

  const urls: Record<string, string> = {
    amazon: `https://www.amazon.com/s?k=${encodedQuery}`,
    shein: `https://www.shein.com/search.html?q=${encodedQuery}`,
    shopee: `https://shopee.sg/search?keyword=${encodedQuery}`,
    lazada: `https://www.lazada.sg/catalog/?q=${encodedQuery}`,
    google: `https://www.google.com/search?q=${encodedQuery}&tbm=shop`,
  };

  return urls[site] || urls.amazon;
}

/**
 * Get all shopping links for an item
 */
export function getAllShoppingLinks(query: string): { site: string; url: string; label: string }[] {
  return [
    { site: 'amazon', url: getShoppingUrl(query, 'amazon'), label: 'Amazon' },
    { site: 'shein', url: getShoppingUrl(query, 'shein'), label: 'Shein' },
    { site: 'shopee', url: getShoppingUrl(query, 'shopee'), label: 'Shopee' },
    { site: 'lazada', url: getShoppingUrl(query, 'lazada'), label: 'Lazada' },
  ];
}

export default {
  raterApi,
  generatorApi,
  arenaApi,
  fileToBase64,
  getShoppingUrl,
};
