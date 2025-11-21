# Logging System Guide

Complete guide to the logging system that captures all activities and prompts.

## What Gets Logged

### ✅ Application Events
- Server startup
- API requests received
- Parameter values
- Function calls and completions
- Errors and exceptions

### ✅ AI Interactions
- All prompts sent to GPT-4
- All prompts sent to Fal AI
- AI responses (truncated for readability)
- Image generation details

### ✅ Processing Steps
- Image uploads and processing
- Background selection
- Outfit details construction
- File operations

## Log File Location

```
outfit-assistant/
└── logs/
    └── outfit_assistant_YYYYMMDD.log
```

- **New file each day** - Named with date (e.g., `outfit_assistant_20251112.log`)
- **Location**: `outfit-assistant/logs/` directory
- **Auto-created**: Directory and files created automatically

## Log Format

```
2025-11-12 00:10:00,123 - __main__ - INFO - Message here
```

Format breakdown:
- `2025-11-12 00:10:00,123` - Timestamp with milliseconds
- `__main__` - Logger name
- `INFO` - Log level (INFO, ERROR, WARNING)
- `Message here` - Actual log message

## Example Log Output

### Application Start
```
============================================================
OUTFIT ASSISTANT APPLICATION STARTED
============================================================
```

### Rate Outfit Request
```
============================================================
RATE OUTFIT REQUEST RECEIVED
============================================================
Parameters - Occasion: Casual Outing, Budget: $100
```

### Generate Outfit Request
```
============================================================
GENERATE OUTFIT REQUEST RECEIVED
============================================================
Parameters:
  - Occasion: Job Interview
  - Wow Factor: 7
  - Brands: ['Zara', 'H&M']
  - Budget: $200
  - Conditions: Professional but modern
  - User image provided: True
------------------------------------------------------------
GPT-4 OUTFIT DESCRIPTION PROMPT:
Create a detailed outfit recommendation for Job Interview.

Style level: 7/10 (bold, creative, and fashion-forward)
Preferences: from brands like Zara, H&M within a budget of $200
...
------------------------------------------------------------
GPT-4 Response received
Outfit Description: {"outfit_concept": "Modern Professional...
Background selected: professional office lobby with modern corporate interior
Outfit details for image: blazer in navy blue, trousers in charcoal gray...
```

### Image Generation
```
============================================================
FAL AI IMAGE GENERATION STARTED
============================================================
Occasion: Job Interview
Outfit: blazer in navy blue, trousers in charcoal...
Background: professional office lobby with modern corporate interior
------------------------------------------------------------
FAL AI PROMPT:
Professional high-quality fashion photograph, same person, same face from reference image, wearing: [outfit details]
Setting: [background]
Occasion: [occasion]
...
------------------------------------------------------------
Calling Fal AI API...
Fal AI image generated successfully
Image size: 95651 bytes
============================================================
IMAGE GENERATION COMPLETE
============================================================
```

### Errors
```
ERROR - Error in generate_outfit: FAL_API_KEY not configured
ERROR - Traceback (most recent call last):
  File "app.py", line 383, in generate_outfit
    raise Exception("Fal AI generation returned None.")
Exception: Fal AI generation returned None.
```

## How to View Logs

### Option 1: Real-time Console
Logs automatically print to console when server is running.

### Option 2: Log File
```bash
# View entire log file
cat outfit-assistant/logs/outfit_assistant_20251112.log

# View last 50 lines
tail -n 50 outfit-assistant/logs/outfit_assistant_20251112.log

# Follow log in real-time
tail -f outfit-assistant/logs/outfit_assistant_20251112.log

# Search for specific text
grep "ERROR" outfit-assistant/logs/outfit_assistant_20251112.log
grep "PROMPT" outfit-assistant/logs/outfit_assistant_20251112.log
```

### Option 3: Text Editor
Simply open the log file in any text editor like VS Code, Notepad, etc.

## What to Look For

### Debugging Issues

**Check for errors:**
```bash
grep "ERROR" logs/outfit_assistant_*.log
```

**Find specific request:**
```bash
grep "GENERATE OUTFIT" logs/outfit_assistant_*.log
```

**See all prompts used:**
```bash
grep "PROMPT:" logs/outfit_assistant_*.log
```

### Analyzing Performance

**Count requests per day:**
```bash
grep "REQUEST RECEIVED" logs/outfit_assistant_*.log | wc -l
```

**See image generation times:**
```bash
grep "IMAGE GENERATION" logs/outfit_assistant_*.log
```

## Log Levels

- **INFO**: Normal operations, requests, processing steps
- **ERROR**: Errors and exceptions
- **WARNING**: Non-critical issues

## Log Management

### Automatic Rotation
- New file created daily
- Old logs preserved
- No automatic deletion

### Manual Cleanup
```bash
# Delete logs older than 7 days
find outfit-assistant/logs -name "*.log" -mtime +7 -delete

# Archive old logs
tar -czf logs_archive.tar.gz outfit-assistant/logs/*.log
```

## Privacy Considerations

⚠️ **Logs contain:**
- User parameters (occasion, budget, etc.)
- AI prompts and responses
- File paths and timestamps

⚠️ **Logs DO NOT contain:**
- Actual image data (only file paths)
- API keys (only mentions if missing)
- User personal information

### Best Practices
1. Don't share log files publicly
2. Review logs before sharing for debugging
3. Regularly clean old logs
4. Back up important logs

## Troubleshooting

### Log file not created
- Check if `logs/` directory exists
- Check write permissions
- Restart the server

### Logs not showing in console
- Logs go to both file and console
- Check if server is running
- Look for the file in `logs/` directory

### Log file too large
- Old logs accumulate
- Clean up old files manually
- Consider log rotation tools

## Integration with Your Workflow

### Development
- Keep console open to see real-time logs
- Monitor for errors while testing
- Review prompts to optimize AI responses

### Production
- Set up log monitoring
- Configure log rotation
- Archive old logs regularly
- Monitor error rates

### Debugging
1. Reproduce the issue
2. Check timestamp of issue
3. Find corresponding log entries
4. Review prompts and responses
5. Check for error messages

## Example: Finding a Specific Request

```bash
# User says "I got an error at 11:05 PM"
# Search logs around that time

grep "2025-11-12 23:0" logs/outfit_assistant_20251112.log

# This shows all log entries between 23:00 and 23:09
# Look for ERROR entries or failed requests
```

## Benefits

✅ **Complete audit trail** of all operations
✅ **Debug issues** easily with full context  
✅ **Optimize prompts** by reviewing what works
✅ **Monitor performance** and usage patterns
✅ **Track errors** and fix problems quickly

## Ready!

Your logging system is configured and ready. Just:
1. Run the server
2. Use the application
3. Check `outfit-assistant/logs/` for log files
4. Review logs for insights and debugging

Good luck with your hackathon! 📊
