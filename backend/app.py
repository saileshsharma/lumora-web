from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import base64
from io import BytesIO
from PIL import Image
import openai
import requests
from dotenv import load_dotenv
import fal_client
import logging
from datetime import datetime
import fashion_arena

# Load environment variables
load_dotenv()

# Configure logging
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)

# Create log filename with timestamp
log_filename = os.path.join(log_dir, f"outfit_assistant_{datetime.now().strftime('%Y%m%d')}.log")

# Configure logging format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_filename),
        logging.StreamHandler()  # Also output to console
    ]
)

logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS to allow requests from various origins
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://ai-outfit-assistant.vercel.app",
            "http://localhost:5173",  # Vite dev server
            "http://localhost:3000",  # Alternative port
            "http://localhost:5001",  # Local backend
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5001",
            "https://lumora-web-production.up.railway.app",  # Production frontend
            "https://web-production-c70ba.up.railway.app",  # New backend URL
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

logger.info("="*60)
logger.info("OUTFIT ASSISTANT APPLICATION STARTED")
logger.info("="*60)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Configure Fal AI
fal_key = os.getenv('FAL_API_KEY')
if fal_key:
    os.environ['FAL_KEY'] = fal_key


def encode_image_to_base64(image_data):
    """Convert image to base64 string for OpenAI API"""
    try:
        # If image_data is already base64, return it
        if isinstance(image_data, str) and image_data.startswith('data:image'):
            return image_data
        
        # Otherwise, encode it
        image = Image.open(BytesIO(image_data))
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    except Exception as e:
        print(f"Error encoding image: {e}")
        return None

def save_base64_to_temp_file(base64_data):
    """Save base64 image data to a temporary file and return the path"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_data)
        
        # Create temp file
        import tempfile
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
        temp_file.write(image_data)
        temp_file.close()
        
        return temp_file.name
    except Exception as e:
        print(f"Error saving base64 to file: {e}")
        return None

def generate_outfit_image_with_replicate(person_image_base64, outfit_description, occasion, background_description):
    """
    Use NanobananaAPI to generate outfit visualization with face preservation
    """
    try:
        logger.info("="*60)
        logger.info("NANOBANANA API IMAGE GENERATION STARTED")
        logger.info("="*60)
        logger.info(f"Occasion: {occasion}")
        logger.info(f"Outfit: {outfit_description[:200]}...")
        logger.info(f"Background: {background_description}")
        
        nanobanana_api_key = os.getenv('NANOBANANA_API_KEY')
        if not nanobanana_api_key:
            raise Exception("NANOBANANA_API_KEY not configured")
        
        print("=" * 60)
        print("GENERATING IMAGE WITH NANOBANANA API")
        print("=" * 60)
        
        # Step 1: Upload person image to get public URL (using Fal CDN)
        person_image_path = save_base64_to_temp_file(person_image_base64)
        if not person_image_path:
            raise Exception("Failed to process person image")
        
        print(f"✓ Person image saved: {person_image_path}")
        logger.info(f"Person image saved: {person_image_path}")
        
        # Upload image to Fal CDN to get a public URL
        image_url = fal_client.upload_file(person_image_path)
        print(f"✓ Image uploaded to CDN: {image_url}")
        logger.info(f"Image uploaded to CDN: {image_url}")
        
        # Step 2: Create prompt for NanobananaAPI
        prompt = f"""Transform this person wearing {outfit_description}. 
Setting: {background_description}. 
Occasion: {occasion}. 
Keep the same person's face and features exactly as in the original image. Natural pose appropriate for {occasion}, facial expression matching the formality. 
Photorealistic, professional fashion photography, magazine quality, 3/4 body shot with professional studio lighting."""
        
        logger.info("-" * 60)
        logger.info("NANOBANANA API PROMPT:")
        logger.info(prompt)
        logger.info("-" * 60)
        
        # Step 3: Submit task to NanobananaAPI
        print(f"✓ Calling NanobananaAPI...")
        logger.info("Calling NanobananaAPI...")
        
        headers = {
            "Authorization": f"Bearer {nanobanana_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "prompt": prompt,
            "type": "IMAGETOIAMGE",  # Image to Image editing
            "imageUrls": [image_url],
            "numImages": 1,
            "image_size": "3:4",  # Portrait format for fashion
            "callBackUrl": "https://webhook.site/dummy"  # Dummy callback, we'll poll instead
        }
        
        logger.info(f"Request payload: {payload}")
        
        response = requests.post(
            "https://api.nanobananaapi.ai/api/v1/nanobanana/generate",
            headers=headers,
            json=payload
        )
        
        if response.status_code != 200:
            logger.error(f"NanobananaAPI request failed: {response.status_code} - {response.text}")
            raise Exception(f"NanobananaAPI request failed: {response.text}")
        
        task_data = response.json()
        logger.info(f"Task submitted: {task_data}")
        
        if task_data.get('code') != 200:
            raise Exception(f"NanobananaAPI error: {task_data.get('msg')}")
        
        task_id = task_data['data']['taskId']
        print(f"✓ Task submitted: {task_id}")
        logger.info(f"Task ID: {task_id}")
        
        # Step 4: Poll for task completion
        print(f"✓ Waiting for image generation...")
        logger.info("Polling for task completion...")
        
        import time
        max_attempts = 60  # 60 attempts * 2 seconds = 2 minutes max
        attempt = 0
        
        while attempt < max_attempts:
            time.sleep(2)  # Wait 2 seconds between polls
            attempt += 1
            
            # Check task status
            status_response = requests.get(
                f"https://api.nanobananaapi.ai/api/v1/nanobanana/record-info?taskId={task_id}",
                headers=headers
            )
            
            if status_response.status_code != 200:
                logger.warning(f"Status check failed: {status_response.status_code}")
                continue
            
            status_data = status_response.json()
            logger.info(f"Attempt {attempt}: Full response = {status_data}")
            
            if status_data.get('code') == 200:
                task_info = status_data.get('data', {})
                success_flag = task_info.get('successFlag')
                
                logger.info(f"Attempt {attempt}: successFlag = {success_flag}")
                
                if success_flag == 1:
                    # Task completed successfully
                    response_data = task_info.get('response', {})
                    generated_image_url = response_data.get('resultImageUrl')
                    
                    if generated_image_url:
                        print(f"✓ Image generated successfully!")
                        logger.info(f"Generated image URL: {generated_image_url}")
                        break
                    else:
                        logger.warning(f"Success flag is 1 but no resultImageUrl found")
                elif success_flag is not None and success_flag != 0:
                    # If successFlag exists and is not 0 or 1, treat as error
                    error_msg = task_info.get('errorMessage', 'Unknown error')
                    raise Exception(f"Task failed: {error_msg}")
        else:
            raise Exception("Task timeout - image generation took too long")
        
        # Step 5: Download and optimize the generated image
        response = requests.get(generated_image_url)
        img = Image.open(BytesIO(response.content))
        logger.info(f"Image downloaded: {len(response.content)} bytes")
        
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
        
        print(f"✓ Image optimized: {len(response.content)} -> {len(optimized_data)} bytes")
        
        # Convert to base64
        image_base64 = base64.b64encode(optimized_data).decode()
        result_url = f"data:image/jpeg;base64,{image_base64}"
        
        # Cleanup
        try:
            os.unlink(person_image_path)
        except Exception as e:
            print(f"Warning: Could not delete temp file: {e}")
        
        print(f"✓ Base64 length: {len(image_base64)} chars")
        print("=" * 60)
        print("IMAGE GENERATION SUCCESSFUL!")
        print("=" * 60)
        
        logger.info(f"Image size: {len(optimized_data)} bytes")
        logger.info("="*60)
        logger.info("IMAGE GENERATION COMPLETE")
        logger.info("="*60)
        
        return result_url
        
    except Exception as e:
        import traceback
        logger.error(f"Error in NanobananaAPI generation: {e}")
        logger.error(traceback.format_exc())
        print(f"Error in NanobananaAPI generation: {e}")
        traceback.print_exc()
        return None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Outfit Assistant API is running"})

@app.route('/api/rate-outfit', methods=['POST'])
def rate_outfit():
    """
    Rate an outfit based on uploaded photo, occasion, and budget
    """
    try:
        logger.info("="*60)
        logger.info("RATE OUTFIT REQUEST RECEIVED")
        logger.info("="*60)
        
        data = request.json
        
        # Extract parameters
        image_base64 = data.get('image')
        occasion = data.get('occasion', 'Casual Outing')
        budget = data.get('budget', '')
        
        logger.info(f"Parameters - Occasion: {occasion}, Budget: {budget}")
        
        if not image_base64:
            logger.error("No image provided in request")
            return jsonify({"error": "No image provided"}), 400
        
        # Build the prompt for GPT-4 Vision
        budget_text = f" with a budget of {budget}" if budget else ""
        
        prompt = f"""Analyze this outfit for a {occasion}{budget_text}.

Please provide:
1. Wow Factor Score (1-10): Rate the overall visual impact and style
2. Occasion Fitness Score (1-10): How appropriate is this for {occasion}?
3. Overall Rating (1-10): Combined assessment

Then provide detailed feedback including:
- Strengths of the outfit
- Areas for improvement
- Specific suggestions for colors, fit, accessories
- 3-5 shopping recommendations with descriptions
- A humorous "roast" - brutally honest, witty, and playful criticism about the outfit (2-3 sentences, make it funny but not mean-spirited)

Format your response as JSON with this structure:
{{
  "wow_factor": <number>,
  "occasion_fitness": <number>,
  "overall_rating": <number>,
  "wow_factor_explanation": "<brief explanation>",
  "occasion_fitness_explanation": "<brief explanation>",
  "overall_explanation": "<brief explanation>",
  "strengths": ["<strength1>", "<strength2>", ...],
  "improvements": ["<improvement1>", "<improvement2>", ...],
  "suggestions": ["<suggestion1>", "<suggestion2>", ...],
  "roast": "<humorous witty roast of the outfit>",
  "shopping_recommendations": [
    {{
      "item": "<item name>",
      "description": "<description>",
      "price": "<estimated price>",
      "reason": "<why this would enhance the outfit>"
    }}
  ]
}}"""
        
        # Call OpenAI GPT-4 Vision API
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_base64
                            }
                        }
                    ]
                }
            ],
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        
        # Parse the response
        result = response.choices[0].message.content
        
        return jsonify({"success": True, "data": result})
        
    except Exception as e:
        print(f"Error in rate_outfit: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-outfit', methods=['POST'])
def generate_outfit():
    """
    Generate outfit suggestions based on user preferences with realistic person image
    """
    try:
        logger.info("="*60)
        logger.info("GENERATE OUTFIT REQUEST RECEIVED")
        logger.info("="*60)
        
        data = request.json
        
        # Extract parameters
        user_image = data.get('user_image', None)
        wow_factor = data.get('wow_factor', 5)
        brands = data.get('brands', [])
        budget = data.get('budget', '')
        occasion = data.get('occasion', 'Casual Outing')
        conditions = data.get('conditions', '')
        
        logger.info(f"Parameters:")
        logger.info(f"  - Occasion: {occasion}")
        logger.info(f"  - Wow Factor: {wow_factor}")
        logger.info(f"  - Brands: {brands}")
        logger.info(f"  - Budget: {budget}")
        logger.info(f"  - Conditions: {conditions}")
        logger.info(f"  - User image provided: {user_image is not None}")
        
        # Build the style description based on wow factor
        if wow_factor <= 3:
            style_desc = "classic, safe, and timeless"
        elif wow_factor <= 6:
            style_desc = "balanced, stylish, and modern"
        else:
            style_desc = "bold, creative, and fashion-forward"
        
        # Build brand preference text
        brand_text = f" from brands like {', '.join(brands)}" if brands else ""
        budget_text = f" within a budget of {budget}" if budget else ""
        conditions_text = f" Additional requirements: {conditions}." if conditions else ""
        
        # Step 1: Generate outfit description using GPT-4
        description_prompt = f"""Create a detailed outfit recommendation for {occasion}.

Style level: {wow_factor}/10 ({style_desc})
Preferences:{brand_text}{budget_text}
{conditions_text}

Provide:
1. Complete outfit description (top, bottom, shoes, accessories)
2. Color palette and why it works
3. Style notes and occasion appropriateness
4. 5-8 specific product recommendations with:
   - Item type and description
   - Estimated price
   - Why it fits the outfit
   
Format as JSON:
{{
  "outfit_concept": "<overall concept and inspiration>",
  "items": [
    {{
      "type": "<item type>",
      "description": "<detailed description>",
      "color": "<color>",
      "style_notes": "<why this works>"
    }}
  ],
  "color_palette": "<description of colors and why they work>",
  "occasion_notes": "<why this works for the occasion>",
  "product_recommendations": [
    {{
      "item": "<item name>",
      "type": "<clothing type>",
      "brand": "<suggested brand>",
      "description": "<description>",
      "price": "<estimated price>",
      "reason": "<why recommended>"
    }}
  ]
}}"""
        
        logger.info("-" * 60)
        logger.info("GPT-4 OUTFIT DESCRIPTION PROMPT:")
        logger.info(description_prompt)
        logger.info("-" * 60)
        
        messages = [{"role": "user", "content": description_prompt}]
        
        # If user provided image, include it for context
        if user_image:
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": description_prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": user_image}
                        }
                    ]
                }
            ]
        
        logger.info("Calling GPT-4 API...")
        description_response = openai.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        
        outfit_description = description_response.choices[0].message.content
        logger.info("GPT-4 Response received")
        logger.info(f"Outfit Description: {outfit_description[:500]}...")

        # Parse JSON response safely
        try:
            outfit_data = json.loads(outfit_description)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse GPT-4 JSON response: {e}")
            logger.error(f"Response content: {outfit_description}")
            raise ValueError(f"Invalid JSON response from GPT-4: {str(e)}")
        
        # Build detailed outfit description for image generation
        outfit_details = " ".join([f"{item['description']} in {item['color']}" for item in outfit_data.get('items', [])])
        
        # Step 3: Determine appropriate background based on occasion
        background_map = {
            'Job Interview': 'professional office lobby with modern corporate interior',
            'Casual Outing': 'trendy urban street with stylish storefronts and natural daylight',
            'Formal Event': 'elegant ballroom with chandeliers and sophisticated ambiance',
            'Date Night': 'upscale restaurant interior with romantic lighting',
            'Business Meeting': 'contemporary conference room with glass walls',
            'Professional/Formal': 'elegant professional setting with modern corporate interior or sophisticated ballroom ambiance',
            'Wedding Guest': 'beautiful outdoor garden venue with floral decorations',
            'Garden Party': 'elegant outdoor garden party setting with lush greenery, flowers, and natural daylight',
            'Beach/Resort': 'pristine sandy beach with turquoise ocean water and tropical scenery',
            'Gym/Athletic': 'modern fitness center or outdoor athletic track',
            'Party/Club': 'stylish nightclub interior with ambient lighting',
            'Halloween': 'festive Halloween party setting with atmospheric decorations',
            'Travel': 'airport terminal or scenic travel destination'
        }

        # Get background or use neutral elegant backdrop as fallback
        background = background_map.get(occasion, 'elegant neutral backdrop with natural lighting')
        
        logger.info(f"Background selected: {background}")
        logger.info(f"Outfit details for image: {outfit_details}")
        
        # Step 4: Generate realistic outfit image using NanobananaAPI
        # Verify prerequisites
        if not user_image:
            raise ValueError("No user image provided. Image generation requires a user photo.")
        
        nanobanana_api_key = os.getenv('NANOBANANA_API_KEY')
        if not nanobanana_api_key:
            raise ValueError("NANOBANANA_API_KEY not configured. Please add it to your .env file.")
        
        # Call NanobananaAPI image generation
        image_url = generate_outfit_image_with_replicate(
            user_image, 
            outfit_details,
            occasion,
            background
        )
        
        if not image_url:
            raise Exception("NanobananaAPI generation returned None. Check logs above for specific error.")

        # Format response to match frontend expectations
        result_data = json.dumps({
            "success": True,
            "outfit_description": outfit_description,
            "outfit_image_url": image_url
        })

        return jsonify({
            "success": True,
            "data": result_data
        })
        
    except Exception as e:
        print(f"Error in generate_outfit: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/regenerate-outfit', methods=['POST'])
def regenerate_outfit():
    """
    Regenerate outfit with user feedback
    """
    try:
        data = request.json
        
        # Extract parameters including feedback
        feedback = data.get('feedback', {})
        previous_params = data.get('previous_params', {})
        
        # Call generate_outfit with adjusted parameters based on feedback
        # For MVP, we'll just call generate_outfit again
        return generate_outfit()
        
    except Exception as e:
        print(f"Error in regenerate_outfit: {e}")
        return jsonify({"error": str(e)}), 500

# ============================================================================
# FASHION ARENA ENDPOINTS
# ============================================================================

@app.route('/api/arena/submit', methods=['POST'])
def submit_to_arena():
    """
    Submit a photo to Fashion Arena
    """
    try:
        logger.info("="*60)
        logger.info("FASHION ARENA SUBMISSION REQUEST")
        logger.info("="*60)
        
        data = request.json
        
        # Extract parameters
        photo = data.get('photo')
        title = data.get('title', 'Untitled')
        description = data.get('description', '')
        occasion = data.get('occasion', 'General')
        source_mode = data.get('source_mode', 'unknown')
        user_id = data.get('user_id')
        
        if not photo:
            return jsonify({"error": "No photo provided"}), 400

        # Validate photo data - reject local file paths
        if photo.startswith("file://"):
            logger.warning(f"Rejected submission with local file path")
            return jsonify({"error": "Invalid photo data. Please use base64-encoded image data."}), 400

        logger.info(f"Submission - Title: {title}, Occasion: {occasion}, Source: {source_mode}")

        # Submit to Fashion Arena
        submission = fashion_arena.submit_to_arena(
            photo_data=photo,
            title=title,
            description=description,
            occasion=occasion,
            source_mode=source_mode,
            user_id=user_id
        )
        
        logger.info(f"Submission successful - ID: {submission['id']}")
        
        return jsonify({
            "success": True,
            "submission": submission
        })
        
    except Exception as e:
        logger.error(f"Error in submit_to_arena: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/arena/submissions', methods=['GET'])
def get_arena_submissions():
    """
    Get all Fashion Arena submissions
    """
    try:
        sort_by = request.args.get('sort_by', 'recent')
        submissions = fashion_arena.get_all_submissions(sort_by=sort_by)
        
        # Remove photo data to reduce payload size (send thumbnails separately if needed)
        for sub in submissions:
            if 'photo' in sub:
                # Keep only first 100 chars of base64 for preview indicator
                sub['has_photo'] = bool(sub['photo'])
                # Don't remove photo completely for now, client needs it
                # sub.pop('photo')
        
        return jsonify({
            "success": True,
            "submissions": submissions,
            "total": len(submissions)
        })
        
    except Exception as e:
        logger.error(f"Error in get_arena_submissions: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/arena/leaderboard', methods=['GET'])
def get_arena_leaderboard():
    """
    Get Fashion Arena leaderboard (top 10)
    """
    try:
        limit = int(request.args.get('limit', 10))
        leaderboard = fashion_arena.get_leaderboard(limit=limit)
        
        return jsonify({
            "success": True,
            "leaderboard": leaderboard
        })
        
    except Exception as e:
        logger.error(f"Error in get_arena_leaderboard: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/arena/vote', methods=['POST'])
def vote_on_submission():
    """
    Vote on a Fashion Arena submission
    """
    try:
        data = request.json
        
        submission_id = data.get('submission_id')
        vote_type = data.get('vote_type', 'upvote')  # 'upvote' or 'downvote'
        rating = data.get('rating', 5)  # 1-10
        voter_id = data.get('voter_id')
        
        if not submission_id:
            return jsonify({"error": "No submission_id provided"}), 400
        
        if vote_type not in ['upvote', 'downvote']:
            return jsonify({"error": "Invalid vote_type. Must be 'upvote' or 'downvote'"}), 400
        
        if not (1 <= rating <= 10):
            return jsonify({"error": "Rating must be between 1 and 10"}), 400
        
        logger.info(f"Vote received - Submission: {submission_id}, Type: {vote_type}, Rating: {rating}")
        
        # Submit vote
        updated_submission = fashion_arena.vote_submission(
            submission_id=submission_id,
            vote_type=vote_type,
            rating=rating,
            voter_id=voter_id
        )
        
        if not updated_submission:
            return jsonify({"error": "Submission not found"}), 404
        
        return jsonify({
            "success": True,
            "submission": updated_submission
        })
        
    except Exception as e:
        logger.error(f"Error in vote_on_submission: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/arena/submission/<submission_id>', methods=['GET'])
def get_submission_details(submission_id):
    """
    Get details of a specific submission
    """
    try:
        submission = fashion_arena.get_submission_by_id(submission_id)
        
        if not submission:
            return jsonify({"error": "Submission not found"}), 404
        
        return jsonify({
            "success": True,
            "submission": submission
        })
        
    except Exception as e:
        logger.error(f"Error in get_submission_details: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/arena/stats', methods=['GET'])
def get_arena_stats():
    """
    Get Fashion Arena statistics
    """
    try:
        stats = fashion_arena.get_stats()

        return jsonify({
            "success": True,
            "stats": stats
        })

    except Exception as e:
        logger.error(f"Error in get_arena_stats: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/arena/restore', methods=['POST'])
def restore_arena_data():
    """
    Restore Fashion Arena data from backup
    """
    try:
        logger.info("="*60)
        logger.info("FASHION ARENA DATA RESTORE REQUEST")
        logger.info("="*60)

        data = request.json

        if not data:
            return jsonify({"error": "No data provided"}), 400

        logger.info(f"Restoring data...")

        # Restore data
        count = fashion_arena.restore_data(data)

        logger.info(f"Successfully restored {count} submissions")

        return jsonify({
            "success": True,
            "message": f"Successfully restored {count} submissions",
            "count": count
        })

    except Exception as e:
        logger.error(f"Error in restore_arena_data: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/arena/like', methods=['POST'])
def like_submission():
    """
    Like a Fashion Arena submission (simple increment)
    """
    try:
        data = request.json

        submission_id = data.get('submission_id')

        if not submission_id:
            return jsonify({"error": "No submission_id provided"}), 400

        logger.info(f"Like received - Submission: {submission_id}")

        # Like submission
        updated_submission = fashion_arena.like_submission(submission_id)

        if not updated_submission:
            return jsonify({"error": "Submission not found"}), 404

        return jsonify({
            "success": True,
            "submission": updated_submission
        })

    except Exception as e:
        logger.error(f"Error in like_submission: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/arena/cleanup', methods=['POST'])
def cleanup_invalid_submissions():
    """
    Clean up submissions with invalid photo data (local file paths)
    """
    try:
        logger.info("="*60)
        logger.info("FASHION ARENA CLEANUP REQUEST")
        logger.info("="*60)

        # Cleanup invalid submissions
        result = fashion_arena.cleanup_invalid_submissions()

        logger.info(f"Cleanup complete - Removed {result['removed_count']} invalid submissions")

        return jsonify({
            "success": True,
            "message": f"Removed {result['removed_count']} submissions with invalid photo data",
            "result": result
        })

    except Exception as e:
        logger.error(f"Error in cleanup_invalid_submissions: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/arena/submission/<submission_id>', methods=['DELETE'])
def delete_submission(submission_id):
    """
    Delete a submission (password protected)
    """
    try:
        data = request.json
        password = data.get('password')

        # Check password
        if password != '182838':
            return jsonify({"error": "Incorrect password"}), 403

        logger.info(f"Delete request for submission: {submission_id}")

        # Delete submission
        success = fashion_arena.delete_submission(submission_id)

        if not success:
            return jsonify({"error": "Submission not found"}), 404

        logger.info(f"Submission {submission_id} deleted successfully")

        return jsonify({
            "success": True,
            "message": "Submission deleted successfully"
        })

    except Exception as e:
        logger.error(f"Error in delete_submission: {e}")
        return jsonify({"error": str(e)}), 500

# Serve React frontend static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve the React frontend"""
    frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'dist')

    # If the path is a file that exists, serve it
    if path and os.path.exists(os.path.join(frontend_dir, path)):
        return send_from_directory(frontend_dir, path)

    # Otherwise, serve index.html (for client-side routing)
    return send_from_directory(frontend_dir, 'index.html')

if __name__ == '__main__':
    # Check if API key is configured
    if not os.getenv('OPENAI_API_KEY'):
        print("WARNING: OPENAI_API_KEY not found in environment variables")
        print("Please create a .env file with your OpenAI API key")

    # Use Railway's PORT environment variable, fallback to 5001 for local development
    # (5000 is often used by macOS AirPlay Receiver)
    port = int(os.getenv('PORT', 5001))
    app.run(debug=False, host='0.0.0.0', port=port)
