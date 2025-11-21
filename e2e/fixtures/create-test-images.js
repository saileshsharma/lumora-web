/**
 * Script to create test fixture images for E2E tests
 * Run with: node e2e/fixtures/create-test-images.js
 */

const fs = require('fs');
const path = require('path');

// Simple PNG creation using Canvas (if available) or fallback to base64
function createSimplePNG(width, height, color) {
  // This is a minimal valid PNG file (1x1 red pixel) in base64
  // For actual testing, you can replace with real images
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D,
    0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
    0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  return minimalPNG;
}

// Create test images
const fixturesDir = __dirname;

// Test outfit image (red square)
const testOutfitImage = createSimplePNG(100, 100, 'red');
fs.writeFileSync(path.join(fixturesDir, 'test-outfit.png'), testOutfitImage);
console.log('✓ Created test-outfit.png');

// Test person image (blue square)
const testPersonImage = createSimplePNG(100, 100, 'blue');
fs.writeFileSync(path.join(fixturesDir, 'test-person.png'), testPersonImage);
console.log('✓ Created test-person.png');

console.log('\nTest fixture images created successfully!');
console.log('Note: These are minimal PNG files for testing. Replace with actual images for better tests.');
