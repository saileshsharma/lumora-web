# Logging Structure Documentation

## Overview

The backend now uses a **multi-logger system** that separates logs into 3 distinct categories for better debugging and monitoring.

## Log Files

All log files are located in `backend/logs/` with daily rotation based on date (`YYYYMMDD`).

### 1. Application Log
**File**: `logs/application_YYYYMMDD.log`

**Purpose**: General application flow, requests, and business logic

**Contains**:
- Application startup information
- Incoming requests (Rate Outfit, Generate Outfit, Arena submissions)
- Request parameters and configuration
- Processing steps and workflow
- Success/completion messages
- Response summaries

**Example**:
```
2025-11-21 15:30:23 - application - INFO - ============================================================
2025-11-21 15:30:23 - application - INFO - GENERATE OUTFIT REQUEST RECEIVED
2025-11-21 15:30:23 - application - INFO - ============================================================
2025-11-21 15:30:23 - application - INFO - Parameters:
2025-11-21 15:30:23 - application - INFO -   - Occasion: Gym
2025-11-21 15:30:23 - application - INFO -   - Wow Factor: 5
2025-11-21 15:30:23 - application - INFO -   - Budget: No budget limit
2025-11-21 15:30:23 - application - INFO - Background selected: modern fitness center
2025-11-21 15:30:23 - application - INFO - Rating analysis completed successfully
```

### 2. API Calls Log
**File**: `logs/api_calls_YYYYMMDD.log`

**Purpose**: External API interactions (OpenAI, NanobananaAPI, FAL)

**Contains**:
- API call initiation messages
- API request parameters (model, tokens, payload)
- ✅ SUCCESS indicators for successful API calls
- ❌ FAILED indicators for failed API calls
- Token usage statistics
- API response summaries
- Polling/waiting status for async operations

**Example**:
```
2025-11-21 15:30:23 - api - INFO - Calling GPT-4 API for outfit description...
2025-11-21 15:30:23 - api - INFO -   Model: gpt-4o
2025-11-21 15:30:23 - api - INFO -   Max tokens: 1500
2025-11-21 15:30:38 - api - INFO - ✅ GPT-4 API call SUCCESSFUL
2025-11-21 15:30:38 - api - INFO -   Tokens used: 1234
2025-11-21 15:30:40 - api - INFO - ============================================================
2025-11-21 15:30:40 - api - INFO - NANOBANANA API IMAGE GENERATION STARTED
2025-11-21 15:30:40 - api - INFO - ============================================================
2025-11-21 15:30:42 - api - INFO - ✅ NanobananaAPI request SUCCESSFUL
2025-11-21 15:30:55 - api - INFO - ✅ NANOBANANA IMAGE GENERATION SUCCESSFUL
```

### 3. Errors Log
**File**: `logs/errors_YYYYMMDD.log`

**Purpose**: Errors, exceptions, and failure cases

**Contains**:
- All error messages (ERROR level only)
- Exception stack traces
- Failed API calls with error details
- Validation errors
- System errors
- Debugging information for failures

**Example**:
```
2025-11-21 15:35:00 - errors - ERROR - GPT-4 API Error in generate_outfit: API key expired
2025-11-21 15:35:00 - errors - ERROR - Error in generate_outfit: API key expired
2025-11-21 15:35:00 - errors - ERROR - Traceback: Traceback (most recent call last):
  File "/path/to/app.py", line 555, in generate_outfit
    description_response = openai.chat.completions.create(
  ...
OpenAI API Error: Incorrect API key provided
```

## Logger Types

### app_logger
- **Usage**: General application flow
- **Level**: INFO
- **Output**: `logs/application_YYYYMMDD.log` + Console
- **Used for**: Requests, parameters, workflow steps, completion messages

### api_logger
- **Usage**: External API calls
- **Level**: INFO
- **Output**: `logs/api_calls_YYYYMMDD.log`
- **Used for**: OpenAI, NanobananaAPI, FAL API interactions, success/failure indicators

### error_logger
- **Usage**: Errors and exceptions
- **Level**: ERROR
- **Output**: `logs/errors_YYYYMMDD.log`
- **Used for**: All errors, exceptions, stack traces, failed operations

## Log Format

All logs use the same format:
```
YYYY-MM-DD HH:MM:SS,mmm - logger_name - LEVEL - message
```

Example:
```
2025-11-21 15:30:23,827 - application - INFO - GENERATE OUTFIT REQUEST RECEIVED
```

## Viewing Logs

### View specific log file
```bash
# Application logs
tail -f backend/logs/application_$(date +%Y%m%d).log

# API logs
tail -f backend/logs/api_calls_$(date +%Y%m%d).log

# Error logs
tail -f backend/logs/errors_$(date +%Y%m%d).log
```

### View all logs simultaneously
```bash
tail -f backend/logs/*.log
```

### Search across all logs
```bash
# Find all errors
grep -r "ERROR" backend/logs/

# Find specific API calls
grep -r "GPT-4 API" backend/logs/api_calls_*.log

# Find requests for a specific occasion
grep -r "Occasion: Gym" backend/logs/application_*.log
```

## Success/Failure Indicators

API logs use visual indicators for quick status identification:

**Success**:
```
✅ GPT-4 API call SUCCESSFUL
✅ NanobananaAPI request SUCCESSFUL
✅ NANOBANANA IMAGE GENERATION SUCCESSFUL
```

**Failure**:
```
❌ GPT-4 API call FAILED: [error message]
❌ NanobananaAPI request FAILED: [error message]
❌ NanobananaAPI connection FAILED: [error message]
```

## Debugging Workflow

### 1. User reports "Generate Outfit doesn't work"

**Step 1**: Check application log to see if request was received
```bash
tail -n 100 backend/logs/application_$(date +%Y%m%d).log | grep "GENERATE OUTFIT"
```

**Step 2**: Check API log to see if external APIs succeeded
```bash
tail -n 100 backend/logs/api_calls_$(date +%Y%m%d).log | grep -E "(✅|❌)"
```

**Step 3**: If failures found, check error log for details
```bash
tail -n 100 backend/logs/errors_$(date +%Y%m%d).log
```

### 2. Tracking a specific request

**Find the timestamp** from when the issue occurred, then search all logs:
```bash
grep "15:30:23" backend/logs/*.log
```

### 3. Monitoring API usage

**Check token usage**:
```bash
grep "Tokens used" backend/logs/api_calls_$(date +%Y%m%d).log
```

**Count successful vs failed API calls**:
```bash
# Successes
grep -c "✅" backend/logs/api_calls_$(date +%Y%m%d).log

# Failures
grep -c "❌" backend/logs/api_calls_$(date +%Y%m%d).log
```

## Log Rotation

Logs are automatically rotated daily. Each new day creates a new set of log files with the date in the filename.

**Format**: `{type}_{YYYYMMDD}.log`

Example:
```
logs/application_20251121.log
logs/api_calls_20251121.log
logs/errors_20251121.log
```

## Log Retention

Logs are **not automatically deleted**. You should manually clean up old logs periodically.

**Recommended cleanup** (keep last 30 days):
```bash
find backend/logs -name "*.log" -mtime +30 -delete
```

## Console Output

**Only application logs** are also output to the console (in addition to the file). This provides real-time feedback when running the backend.

API and error logs are **file-only** to avoid cluttering the console.

## Configuration

Logging is configured in `backend/app.py` (lines 19-58):

```python
# Create log filenames with timestamp
date_str = datetime.now().strftime('%Y%m%d')
app_log = os.path.join(log_dir, f"application_{date_str}.log")
api_log = os.path.join(log_dir, f"api_calls_{date_str}.log")
error_log = os.path.join(log_dir, f"errors_{date_str}.log")

# Application Logger - General app flow
app_logger = logging.getLogger('application')

# API Logger - External API calls
api_logger = logging.getLogger('api')

# Error Logger - Errors and exceptions
error_logger = logging.getLogger('errors')
```

## Benefits

### Before (Single Log)
- ❌ Hard to find specific information
- ❌ API calls mixed with application flow
- ❌ Errors buried in thousands of lines
- ❌ Difficult to monitor API usage
- ❌ No quick way to check if APIs are working

### After (Multi-Log System)
- ✅ Separate logs for different concerns
- ✅ Quick API status check with visual indicators
- ✅ Dedicated error log for troubleshooting
- ✅ Easy to monitor API usage and costs
- ✅ Clear separation of application vs API vs errors
- ✅ Faster debugging and problem identification

## Quick Reference Card

| Need to... | Command |
|------------|---------|
| Check if backend is receiving requests | `tail -f backend/logs/application_*.log` |
| Monitor API calls | `tail -f backend/logs/api_calls_*.log` |
| Check for errors | `tail -f backend/logs/errors_*.log` |
| See all logs | `tail -f backend/logs/*.log` |
| Check API success rate | `grep -E "(✅\|❌)" backend/logs/api_calls_*.log` |
| Find a specific error | `grep -r "error message" backend/logs/` |
| Count total requests today | `grep -c "REQUEST RECEIVED" backend/logs/application_*.log` |
| Check token usage | `grep "Tokens used" backend/logs/api_calls_*.log` |

## Troubleshooting

### Logs not being created?

Check permissions on the `logs/` directory:
```bash
ls -la backend/logs/
chmod 755 backend/logs/
```

### Logs are empty?

Ensure the backend is running and restart it to pick up logging changes:
```bash
cd outfit-assistant
./restart.sh
```

### Can't find today's log?

Check the date format matches:
```bash
ls backend/logs/
# Should see: application_20251121.log, api_calls_20251121.log, errors_20251121.log
```

---

**Last Updated**: November 21, 2025
**Version**: 2.0 (Multi-logger system)
