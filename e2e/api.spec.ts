import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * E2E API Tests for Backend Endpoints
 * Tests API responses and behavior directly
 */

const API_BASE = 'http://localhost:5001/api';

// Helper to read test image as base64
function getTestImageBase64(filename: string): string {
  const imagePath = path.join(__dirname, 'fixtures', filename);
  const imageBuffer = fs.readFileSync(imagePath);
  const base64 = imageBuffer.toString('base64');
  return `data:image/png;base64,${base64}`;
}

test.describe('Backend API Tests', () => {

  test.describe('Health Endpoint', () => {

    test('GET /api/health should return healthy status', async ({ request }) => {
      const response = await request.get(`${API_BASE}/health`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status', 'healthy');
      expect(data).toHaveProperty('service', 'AI Outfit Assistant API');
      expect(data).toHaveProperty('timestamp');
    });
  });

  test.describe('Rate Outfit Endpoint', () => {

    test('POST /api/rate-outfit should rate an outfit successfully', async ({ request }) => {
      const imageBase64 = getTestImageBase64('test-outfit.png');

      const response = await request.post(`${API_BASE}/rate-outfit`, {
        data: {
          image: imageBase64,
          occasion: 'Casual Outing',
          budget: '$50-$100'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');

      // Parse the nested JSON string
      const ratingData = JSON.parse(data.data);
      expect(ratingData).toHaveProperty('wow_factor');
      expect(ratingData).toHaveProperty('occasion_fitness');
      expect(ratingData).toHaveProperty('overall_rating');
      expect(ratingData).toHaveProperty('strengths');
      expect(ratingData).toHaveProperty('improvements');
      expect(ratingData).toHaveProperty('suggestions');

      // Verify types
      expect(typeof ratingData.wow_factor).toBe('number');
      expect(typeof ratingData.occasion_fitness).toBe('number');
      expect(typeof ratingData.overall_rating).toBe('number');
      expect(Array.isArray(ratingData.strengths)).toBeTruthy();
      expect(Array.isArray(ratingData.improvements)).toBeTruthy();
      expect(Array.isArray(ratingData.suggestions)).toBeTruthy();
    });

    test('POST /api/rate-outfit should fail without image', async ({ request }) => {
      const response = await request.post(`${API_BASE}/rate-outfit`, {
        data: {
          occasion: 'Casual Outing',
          budget: '$50-$100'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
    });

    test('POST /api/rate-outfit should fail with invalid image format', async ({ request }) => {
      const response = await request.post(`${API_BASE}/rate-outfit`, {
        data: {
          image: 'invalid-image-data',
          occasion: 'Casual Outing'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data.error).toContain('Invalid image format');
    });

    test('POST /api/rate-outfit should handle different occasions', async ({ request }) => {
      const imageBase64 = getTestImageBase64('test-outfit.png');
      const occasions = ['Casual Outing', 'Business Formal', 'Date Night', 'Gym/Sports'];

      for (const occasion of occasions) {
        const response = await request.post(`${API_BASE}/rate-outfit`, {
          data: {
            image: imageBase64,
            occasion: occasion
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data).toHaveProperty('success', true);
      }
    });
  });

  test.describe('Generate Outfit Endpoint', () => {

    test('POST /api/generate-outfit should generate outfit successfully', async ({ request }) => {
      const imageBase64 = getTestImageBase64('test-person.png');

      const response = await request.post(`${API_BASE}/generate-outfit`, {
        data: {
          user_image: imageBase64,
          occasion: 'Business Formal',
          wow_factor: 7,
          brands: ['Nike', 'Adidas'],
          budget: '$100-$200',
          conditions: 'Professional look'
        },
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minutes for AI generation
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');

      // Parse the nested JSON string
      const outfitData = JSON.parse(data.data);
      expect(outfitData).toHaveProperty('outfit_description');
      expect(outfitData).toHaveProperty('outfit_image_url');

      // Verify outfit description structure
      const description = JSON.parse(outfitData.outfit_description);
      expect(description).toHaveProperty('outfit_concept');
      expect(description).toHaveProperty('items');
      expect(description).toHaveProperty('color_palette');
      expect(description).toHaveProperty('product_recommendations');
      expect(Array.isArray(description.items)).toBeTruthy();
    });

    test('POST /api/generate-outfit should fail without user image', async ({ request }) => {
      const response = await request.post(`${API_BASE}/generate-outfit`, {
        data: {
          occasion: 'Business Formal',
          wow_factor: 5,
          budget: '$100-$200'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data.error).toContain('user image');
    });

    test('POST /api/generate-outfit should handle different wow factors', async ({ request }) => {
      const imageBase64 = getTestImageBase64('test-person.png');

      // Test with minimum wow factor
      const response1 = await request.post(`${API_BASE}/generate-outfit`, {
        data: {
          user_image: imageBase64,
          occasion: 'Casual Outing',
          wow_factor: 1,
          budget: '$50-$100'
        },
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 120000
      });

      expect(response1.ok()).toBeTruthy();

      // Test with maximum wow factor
      const response2 = await request.post(`${API_BASE}/generate-outfit`, {
        data: {
          user_image: imageBase64,
          occasion: 'Party/Club',
          wow_factor: 10,
          budget: '$200-$500'
        },
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 120000
      });

      expect(response2.ok()).toBeTruthy();
    });
  });

  test.describe('CORS Configuration', () => {

    test('should allow requests from localhost origins', async ({ request }) => {
      const response = await request.get(`${API_BASE}/health`, {
        headers: {
          'Origin': 'http://localhost:5174'
        }
      });

      expect(response.ok()).toBeTruthy();
      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBeTruthy();
    });

    test('should handle OPTIONS preflight requests', async ({ request }) => {
      const response = await request.fetch(`${API_BASE}/rate-outfit`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5174',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type'
        }
      });

      expect(response.ok()).toBeTruthy();
      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBeTruthy();
      expect(headers['access-control-allow-methods']).toBeTruthy();
      expect(headers['access-control-allow-headers']).toBeTruthy();
    });
  });

  test.describe('Error Handling', () => {

    test('should return 404 for non-existent endpoints', async ({ request }) => {
      const response = await request.get(`${API_BASE}/non-existent-endpoint`);
      expect(response.status()).toBe(404);
    });

    test('should handle malformed JSON gracefully', async ({ request }) => {
      const response = await request.post(`${API_BASE}/rate-outfit`, {
        data: 'this is not valid JSON{',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Should return an error status (400 or 500)
      expect(response.ok()).toBeFalsy();
    });

    test('should return proper error structure', async ({ request }) => {
      const response = await request.post(`${API_BASE}/rate-outfit`, {
        data: {
          occasion: 'Casual'
          // Missing required image field
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
    });
  });

  test.describe('Performance', () => {

    test('health endpoint should respond quickly', async ({ request }) => {
      const startTime = Date.now();

      const response = await request.get(`${API_BASE}/health`);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.ok()).toBeTruthy();
      expect(duration).toBeLessThan(1000); // Should respond in under 1 second
    });

    test('rate-outfit should complete within reasonable time', async ({ request }) => {
      const imageBase64 = getTestImageBase64('test-outfit.png');
      const startTime = Date.now();

      const response = await request.post(`${API_BASE}/rate-outfit`, {
        data: {
          image: imageBase64,
          occasion: 'Casual Outing'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.ok()).toBeTruthy();
      expect(duration).toBeLessThan(30000); // Should complete in under 30 seconds
    });
  });
});
