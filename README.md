# 🎨 AI-Powered Outfit Assistant - MVP

An intelligent fashion assistant that uses AI to rate existing outfits and generate personalized outfit recommendations with visual previews.

## 🌟 Features

### Mode 1: Outfit Rater
- **Photo Analysis**: Upload outfit photos for AI-powered evaluation
- **Multi-factor Rating**: Get scores for Wow Factor, Occasion Fitness, and Overall Rating
- **Detailed Feedback**: Receive strengths, improvements, and styling suggestions
- **Shopping Recommendations**: Get product suggestions to enhance your outfit
- **Occasion-Aware**: Tailored feedback based on specific events and occasions

### Mode 2: Outfit Generator
- **AI Image Generation**: Create outfit visualizations using DALL-E 3
- **Customizable Style**: Adjust the "wow factor" from classic to bold
- **Brand Preferences**: Specify favorite brands for personalized suggestions
- **Budget-Conscious**: Set budget ranges for realistic recommendations
- **Condition-Based**: Add special requirements (colors, items, restrictions)
- **Shopping Integration**: Get specific product recommendations matching the generated outfit

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd outfit-assistant
   ```

2. **Set up Python environment**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Create virtual environment (recommended)
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Configure OpenAI API Key**
   ```bash
   # Create .env file from template
   copy .env.example .env  # Windows
   # OR
   cp .env.example .env    # macOS/Linux
   
   # Edit .env file and add your OpenAI API key
   # OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

4. **Start the Backend Server**
   ```bash
   # Make sure you're in the backend directory with venv activated
   python app.py
   ```
   
   The server will start at `http://localhost:5000`

5. **Open the Frontend**
   ```bash
   # In a new terminal, navigate to frontend directory
   cd ../frontend
   
   # Open index.html in your browser
   # Option 1: Double-click index.html
   # Option 2: Use Python's built-in server
   python -m http.server 8080
   # Then visit http://localhost:8080
   ```

## 📖 Usage Guide

### Outfit Rater Mode

1. **Upload Photo**: Click or drag-and-drop an outfit photo
2. **Select Occasion**: Choose from pre-defined options or enter custom
3. **Set Budget** (Optional): Specify your shopping budget
4. **Get Rating**: Click "Rate My Outfit" and wait for AI analysis
5. **Review Results**: 
   - View Wow Factor, Occasion Fitness, and Overall scores
   - Read detailed feedback and suggestions
   - Browse shopping recommendations

### Outfit Generator Mode

1. **Upload Photo** (Optional): Add your photo for personalized suggestions
2. **Adjust Wow Factor**: Slide from Classic (1) to Bold (10)
3. **Add Brand Preferences** (Optional): List up to 5 favorite brands
4. **Set Budget**: Enter your budget range (required)
5. **Select Occasion**: Choose the event type
6. **Add Conditions** (Optional): Special requirements like colors or items
7. **Generate Outfit**: Click "Generate Outfit" and wait 20-30 seconds
8. **Review Results**:
   - View AI-generated outfit visualization
   - Read detailed outfit description and styling notes
   - Browse product recommendations
   - Click "Generate Another" for more options

## 🛠️ Technical Stack

- **Backend**: Python Flask
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Models**: 
  - GPT-4 Vision (outfit analysis)
  - DALL-E 3 (outfit image generation)
- **APIs**: OpenAI API

## 📁 Project Structure

```
outfit-assistant/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment template
│   └── .env               # Your API keys (create this)
├── frontend/
│   ├── index.html         # Main UI
│   ├── styles.css         # Styling
│   └── script.js          # Frontend logic
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

Edit `backend/.env`:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/rate-outfit` - Rate uploaded outfit
- `POST /api/generate-outfit` - Generate new outfit
- `POST /api/regenerate-outfit` - Regenerate with feedback

## 💰 Cost Considerations

This MVP uses OpenAI's paid APIs:

- **GPT-4 Vision**: ~$0.01-0.03 per outfit rating
- **DALL-E 3**: ~$0.04 per image generation
- **Total per generation**: ~$0.05-0.07

**Tip**: Monitor usage at [OpenAI Platform](https://platform.openai.com/usage)

## 🐛 Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed: `python --version`
- Activate virtual environment
- Install dependencies: `pip install -r requirements.txt`
- Check for port conflicts (port 5000)

### "OpenAI API key not configured" error
- Create `.env` file in `backend/` directory
- Add your API key: `OPENAI_API_KEY=sk-...`
- Restart the backend server

### Frontend can't connect to backend
- Verify backend is running at `http://localhost:5000`
- Check browser console for CORS errors
- Ensure `FLASK_ENV=development` in `.env`

### Image upload fails
- Check file size (must be < 10MB)
- Verify file format (JPG, PNG, HEIC)
- Try a different image

### Slow response times
- DALL-E 3 generation takes 20-30 seconds (normal)
- GPT-4 Vision analysis takes 5-15 seconds (normal)
- Check your internet connection
- Monitor OpenAI API status

## 🎯 MVP Limitations

This is a Minimum Viable Product with some limitations:

- **Shopping Links**: Currently mock/demo (not real product links)
- **No User Accounts**: No login or save history functionality
- **No Persistence**: Results are not saved between sessions
- **Rate Limiting**: Subject to OpenAI API rate limits
- **Cost**: Each request costs money (OpenAI API fees)
- **Image Quality**: DALL-E 3 results may vary
- **No Feedback Loop**: User feedback doesn't improve model (yet)

## 🚀 Future Enhancements

Potential improvements for future versions:

- Real e-commerce integration (Amazon, Shopify APIs)
- User authentication and saved outfits
- Virtual try-on capabilities
- Social sharing features
- Wardrobe management
- Weather-based recommendations
- Celebrity style matching
- Mobile app (React Native)
- More AI models (Stable Diffusion, etc.)

## 📝 API Response Examples

### Outfit Rater Response
```json
{
  "wow_factor": 8,
  "occasion_fitness": 9,
  "overall_rating": 8.5,
  "strengths": ["Great color coordination", "Perfect fit"],
  "improvements": ["Add accessories"],
  "suggestions": ["Try a statement necklace"],
  "shopping_recommendations": [...]
}
```

### Outfit Generator Response
```json
{
  "outfit_concept": "Modern business casual...",
  "items": [...],
  "color_palette": "Navy and white with...",
  "product_recommendations": [...],
  "outfit_image_url": "https://..."
}
```

## 🔐 Security Notes

- Never commit `.env` file to version control
- Keep your OpenAI API key secret
- Use environment variables for sensitive data
- Consider rate limiting for production
- Implement user authentication for production

## 📄 License

This is an MVP demo project. For production use, ensure proper licensing.

## 🤝 Contributing

This is an MVP/hackathon project. Feel free to fork and enhance!

## 📧 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review OpenAI API documentation
3. Check Flask documentation

## 🎉 Acknowledgments

- OpenAI for GPT-4 Vision and DALL-E 3
- Flask for the backend framework
- The open-source community

---

**Built with ❤️ for AI Hackathon 2025**

*Last Updated: November 11, 2025*
