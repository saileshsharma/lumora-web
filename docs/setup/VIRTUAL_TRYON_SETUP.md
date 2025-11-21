# Virtual Try-On Setup Guide

This guide explains how to set up and use the Replicate virtual try-on feature to preserve the exact person's identity when generating outfit recommendations.

## Overview

The outfit generator now supports two modes:

1. **Virtual Try-On Mode** (Recommended): Uses Replicate's IDM-VTON model to preserve the exact person's face and body from the uploaded photo
2. **DALL-E Mode** (Fallback): Creates a similar-looking person based on detailed descriptions

## Setup Instructions

### Step 1: Get a Replicate API Token

1. Visit [replicate.com](https://replicate.com/) and create an account
2. Navigate to your account settings
3. Generate an API token
4. Copy the token (it starts with `r8_...`)

### Step 2: Configure Your Environment

1. Open the `.env` file in the `backend` directory
2. Add your Replicate API token:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Replicate API Configuration (for virtual try-on)
REPLICATE_API_TOKEN=r8_your_replicate_token_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

### Step 3: Install Dependencies

Run the following command to install the required packages:

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `replicate>=0.25.0` - Replicate API client
- `requests>=2.31.0` - For image downloading
- All other existing dependencies

### Step 4: Restart the Backend Server

If the server is already running, restart it:

```bash
# Stop the current server (Ctrl+C)
# Then start it again
python app.py
```

## How It Works

### Virtual Try-On Process

1. **Person Image Upload**: User uploads their photo
2. **Outfit Generation**: System generates outfit recommendations using GPT-4 Vision
3. **Outfit Image Creation**: DALL-E 3 creates a clean image of the recommended outfit
4. **Virtual Try-On**: Replicate's IDM-VTON model:
   - Takes the person's original photo
   - Takes the generated outfit image
   - Intelligently swaps the clothing while preserving:
     - The person's exact face
     - Body proportions
     - Skin tone
     - Hair style
     - Overall identity
5. **Result**: A realistic image showing the same person wearing the new outfit

### Fallback Behavior

If the virtual try-on fails or Replicate is not configured:
- System automatically falls back to DALL-E 3
- Uses detailed person descriptions for best similarity
- Still provides high-quality outfit visualizations

## Cost Considerations

### Replicate Pricing

- Replicate charges per second of computation time
- IDM-VTON model typically takes 15-30 seconds per image
- Approximate cost: $0.02-$0.05 per outfit generation
- First $10 in credits are free for new accounts

### Total Cost Per Generation

With Replicate enabled:
- OpenAI GPT-4 Vision (person analysis): ~$0.01
- OpenAI GPT-4 (outfit recommendations): ~$0.02
- OpenAI DALL-E 3 (outfit image): ~$0.04
- Replicate IDM-VTON (virtual try-on): ~$0.03
- **Total: ~$0.10 per generation**

Without Replicate (DALL-E only):
- **Total: ~$0.07 per generation**

## Testing the Feature

### Test with Sample Image

1. Start the backend server
2. Open the frontend in your browser
3. Navigate to the "Outfit Generator" tab
4. Upload a clear, full-body photo of a person
5. Set your preferences (occasion, style, etc.)
6. Click "Generate Outfit"
7. Watch the console for virtual try-on progress:
   ```
   Attempting virtual try-on with Replicate...
   Generating outfit image with DALL-E...
   Outfit image generated: https://...
   Running virtual try-on with Replicate...
   Virtual try-on completed: https://...
   Virtual try-on successful!
   ```

### Expected Results

**With Virtual Try-On:**
- Same person's face and body
- New outfit matching recommendations
- Natural, realistic appearance
- Background may be plain (original from person's photo)

**With DALL-E Fallback:**
- Similar-looking person based on description
- May not be exact match
- Complete scene with occasion-appropriate background

## Troubleshooting

### Issue: "Replicate API token not configured"

**Solution**: Add `REPLICATE_API_TOKEN` to your `.env` file

### Issue: Virtual try-on fails consistently

**Possible causes:**
1. Invalid API token
2. Replicate service issues
3. Image format not supported

**Solution**:
- Verify your API token is correct
- Check Replicate status page
- The system will automatically fall back to DALL-E

### Issue: Generated image doesn't match person well

**Possible causes:**
1. Source photo quality issues (blurry, poor lighting, partial body)
2. Outfit description too complex
3. Model limitations

**Solution**:
- Use clear, well-lit, full-body photos
- Try regenerating with simpler outfit preferences
- Adjust wow factor for different styles

### Issue: Slow generation time

**Expected behavior**: Virtual try-on adds 15-30 seconds to generation time

**Tips to improve**:
- Use smaller images (will be resized anyway)
- Be patient - the extra time provides much better results
- Monitor console logs to see progress

## Best Practices

### For Best Results:

1. **Photo Quality**:
   - Use clear, well-lit photos
   - Full-body or at least upper-body shots
   - Face visible and unobstructed
   - Neutral background preferred
   - Good resolution (min 512x512)

2. **Outfit Selection**:
   - Start with classic styles for testing
   - Complex outfits may need multiple attempts
   - Consider the occasion carefully

3. **System Configuration**:
   - Keep API tokens secure
   - Monitor API usage and costs
   - Test with lower wow factors first

## Advanced Configuration

### Adjusting Virtual Try-On Parameters

Edit `app.py` to modify the IDM-VTON settings:

```python
output = replicate.run(
    "cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
    input={
        "crop": False,          # Set to True to auto-crop image
        "seed": 42,             # Change for different variations
        "steps": 30,            # Increase for better quality (slower)
        "category": "auto",     # or "upper_body", "lower_body", "dresses"
        "force_dc": False,      
        "garm_img": outfit_image_url,
        "human_img": open(person_image_path, "rb"),
        "mask_only": False,
        "garment_des": outfit_description
    }
)
```

## Support

For issues related to:
- **Replicate API**: Visit [replicate.com/docs](https://replicate.com/docs)
- **IDM-VTON Model**: Check [model documentation](https://replicate.com/cuuupid/idm-vton)
- **OpenAI APIs**: See OpenAI documentation
- **This Application**: Check logs and error messages in the backend console

## Future Enhancements

Potential improvements for the virtual try-on feature:
1. Background replacement/compositing for occasion-appropriate settings
2. Multiple outfit variations in one generation
3. Support for accessories try-on
4. Better handling of complex outfits
5. Pose adjustment capabilities
