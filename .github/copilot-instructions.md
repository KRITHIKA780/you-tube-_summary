# YouTube Summarizer Project

This is a full-stack application for summarizing YouTube videos and extracting key points.

## Project Structure
- `backend/` - Node.js/Express server with video processing APIs
- `frontend/` - React web interface for URL input and results display
- `.vscode/` - VS Code configuration

## Key Features
- Extract YouTube video transcripts
- AI-powered summarization
- Key points extraction
- Clean, responsive UI

## Setup Instructions
1. Install Node.js (v16+)
2. Set up backend: `cd backend && npm install`
3. Set up frontend: `cd frontend && npm install`
4. Configure API keys in `.env` files
5. Run backend: `npm start` (from backend folder)
6. Run frontend: `npm start` (from frontend folder)

## Environment Variables
Create `.env` files in both backend and frontend folders:

**backend/.env:**
```
PORT=5000
OPENAI_API_KEY=your_key_here
```

**frontend/.env:**
```
REACT_APP_API_URL=http://localhost:5000
```
