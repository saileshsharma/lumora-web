# Google Imagen API Setup Guide

This guide explains how to implement Google's Imagen API for outfit visualization.

## ⚠️ Important Notes

**What Imagen Provides:**
- ✅ Professional fashion photography
- ✅ Dynamic backgrounds matching occasion
- ✅ Natural poses for each setting  
- ✅ Occasion-appropriate expressions
- ❌ **Different person** (similar but not your exact face)

**Imagen creates a new person based on text descriptions, NOT photo-realistic virtual try-on of your exact face.**

## Setup Steps

### 1. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Vertex AI API:
   - Go to "APIs & Services" → "Library"
   - Search for "Vertex AI API"
   - Click "Enable"

4. Set up authentication:
   ```bash
   # Install Google Cloud SDK
   # Visit: https://cloud.google.com/sdk/docs/install
   
   # Login and set project
   gcloud auth application-default login
   gcloud config set project YOUR_PROJECT_ID
   ```

### 2. Install Dependencies

```bash
pip install google-cloud-aiplatform
```

### 3. Update .env File

```env
# OpenAI for outfit recommendations
OPENAI_API_KEY=your_openai_key

# Google Cloud Project ID for Imagen
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
```

### 4. Implementation Code

Replace the `generate_outfit_image_with_replicate` function in `app.py`:

```python
from google.cloud import aiplatform
from vertexai.preview.vision_models import ImageGenerationModel
import vertexai

def generate_outfit_image_with_imagen(person_image_base64, outfit_description, occasion, background_description):
    """
    Use Google Imagen to generate outfit visualization
    Note: Creates a NEW person wearing the outfit (not exact face match)
    """
    try:
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
        location = os.getenv('GOOGLE_CLOUD_LOCATION', 'us-central1')
        
        if not project_id:
            raise Exception("GOOGLE_CLOUD_PROJECT not configured")
        
        print("=" * 60)
        print("GENERATING IMAGE WITH GOOGLE IMAGEN")
        print("=" * 60)
        
        # Initialize Vertex AI
        vertexai.init(project=project_id, location=location)
        
        # Load Imagen model
        model = ImageGenerationModel.from_pretrained("imagegeneration@006")
        
        # Create comprehensive prompt
        prompt = f"""Professional fashion photography of a stylish person wearing: {outfit_description}

Occasion: {occasion}
Setting: {background_description}

Requirements:
- Photo-realistic quality
- Natural pose appropriate for {occasion}
- Facial expression matching the formality of {occasion}
- Professional lighting (soft, even, flattering)
- 3/4 body shot showing complete outfit clearly
- High-resolution, magazine-quality result
- Focus on the person and outfit

Style: Professional fashion editorial photography"""
        
        print(f"✓ Prompt created")
        print(f"✓ Calling Imagen API...")
        
        # Generate image
        response = model.generate_images(
            prompt=prompt,
            number_of_images=1,
            aspect_ratio="3:4",
            safety_filter_level="block_some",
            person_generation="allow_adult",
            add_watermark=False
        )
        
        if not response.images:
            raise Exception("Imagen returned no images")
        
        print(f"✓ Image generated successfully")
        
        # Get the generated image
        generated_image = response.images[0]
        
        # Convert to bytes
        image_bytes = generated_image._image_bytes
        
        # Optimize for web
        img = Image.open(BytesIO(image_bytes))
        
        # Resize if needed
        max_size = 1024
        if img.width > max_size or img.height > max_size:
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            print(f"✓ Image resized to: {img.size}")
        
        # Convert to RGB for JPEG
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        
        # Save as JPEG
        optimized_buffer = BytesIO()
        img.save(optimized_buffer, format='JPEG', quality=85, optimize=True)
        optimized_data = optimized_buffer.getvalue()
        
        print(f"✓ Image optimized: {len(image_bytes)} -> {len(optimized_data)} bytes")
        
        # Convert to base64
        image_base64 = base64.b64encode(optimized_data).decode()
        result_url = f"data:image/jpeg;base64,{image_base64}"
        
        print(f"✓ Base64 length: {len(image_base64)} chars")
        print("=" * 60)
        print("IMAGE GENERATION SUCCESSFUL!")
        print("=" * 60)
        
        return result_url
        
    except Exception as e:
        print(f"Error in Imagen generation: {e}")
        import traceback
        traceback.print_exc()
        return None
```

### 5. Update generate_outfit() Function

Change the function call:

```python
# OLD:
image_url = generate_outfit_image_with_gemini(...)

# NEW:
image_url = generate_outfit_image_with_imagen(
    user_image,
    outfit_details,
    occasion,
    background
)
```

### 6. Update Imports

At the top of `app.py`:

```python
from google.cloud import aiplatform
from vertexai.preview.vision_models import ImageGenerationModel  
import vertexai
```

## Testing

1. **Install dependencies:**
   ```bash
   pip install google-cloud-aiplatform
   ```

2. **Set up Google Cloud authentication:**
   ```bash
   gcloud auth application-default login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Restart backend:**
   ```bash
   python outfit-assistant/backend/app.py
   ```

4. **Generate an outfit** and check console for:
   ```
   ============================================================
   GENERATING IMAGE WITH GOOGLE IMAGEN
   ============================================================
   ✓ Prompt created
   ✓ Calling Imagen API...
   ✓ Image generated successfully
   ✓ Image optimized
   ============================================================
   IMAGE GENERATION SUCCESSFUL!
   ============================================================
   ```

## Costs

- **Imagen**: ~$0.02-0.04 per image
- **GPT-4**: ~$0.03 per outfit recommendation
- **Total**: ~$0.05-0.07 per generation

## Expected Results

You'll get a professional fashion photo showing:
- ✅ A person in the recommended outfit
- ✅ Appropriate pose for the occasion
- ✅ Matching facial expression
- ✅ Occasion-appropriate background
- ✅ Photo-realistic quality

**Note:** The person will be different from your uploaded photo (similar style/aesthetic but not your exact face).

## Troubleshooting

### "GOOGLE_CLOUD_PROJECT not configured"
- Add project ID to `.env` file
- Restart backend server

### "Permission denied" or "API not enabled"
- Enable Vertex AI API in Google Cloud Console
- Run `gcloud auth application-default login`

### "Quota exceeded"
- Check quotas in Google Cloud Console
- Imagen has generous free tier (100-1000 images/month depending on region)

### Image not showing in UI
- Check console logs for base64 length
- Ensure no errors in image optimization
- Verify image is under 10MB after compression

## Next Steps

Once working, you can:
1. Add a UI toggle to let users choose "Exact person (Replicate)" vs "Dynamic scene (Imagen)"
2. Combine both: Use Replicate for exact face, then Imagen for background replacement
3. Fine-tune prompts for better results
4. Add style parameters (professional, casual, artistic, etc.)

## Support

For issues:
- Check [Vertex AI Imagen docs](https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview)
- Review [pricing](https://cloud.google.com/vertex-ai/pricing#generative_ai_models)
- Test with Google Cloud Console's Imagen playground first
