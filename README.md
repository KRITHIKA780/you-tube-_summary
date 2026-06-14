# YouTube Summarizer

A full-stack application that allows users to input a YouTube URL and get:
- ✅ Automatic transcript extraction
- ✅ AI-powered video summarization
- ✅ Key points extraction
- ✅ Clean, responsive web interface

## Features

- **URL Input**: Simple interface to enter YouTube video links
- **Transcript Extraction**: Automatically fetches video transcripts
- **Smart Summarization**: AI-powered summary generation using OpenAI
- **Key Points**: Extracts the most important points from the video
- **Real-time Processing**: Fast processing with loading indicators
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Comprehensive error messages and validation

## Project Structure

```
├── backend/
│   ├── server.js              # Express server entry point
│   ├── package.json           # Backend dependencies
│   ├── utils/
│   │   ├── transcript.js      # YouTube transcript extraction
│   │   ├── summarizer.js      # AI summarization logic
│   │   └── keyPoints.js       # Key points extraction
│   └── .env.example           # Environment variables template
├── frontend/
│   ├── index.html             # Single-page HTML interface
│   ├── package.json           # Frontend dependencies (React)
│   └── .env.example           # Frontend environment variables
└── README.md                  # This file
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (optional - falls back to basic summarization)

## Installation

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the template:
```bash
cp .env.example .env
```

4. Add your OpenAI API key to `.env`:
```
PORT=5000
OPENAI_API_KEY=sk-your-key-here
```

### Frontend Setup

#### Option 1: Simple HTML (No Build Required)
The `frontend/index.html` file works standalone - just open it in your browser after starting the backend.

#### Option 2: React Development Server
1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

The server will start on `http://localhost:5000`

### Start Frontend

#### Using HTML directly:
Open `frontend/index.html` in your web browser

#### Using React:
```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`

## API Endpoints

### POST /api/summarize

Summarizes a YouTube video

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response:**
```json
{
  "videoId": "dQw4w9WgXcQ",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "transcript": "Full video transcript text...",
  "summary": "AI-generated summary...",
  "keyPoints": "1. Key point 1\n2. Key point 2\n...",
  "timestamp": "2024-06-14T10:30:00.000Z"
}
```

### GET /api/health

Health check endpoint

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Usage

1. Start the backend server
2. Open the frontend (HTML or React)
3. Paste a YouTube URL into the input field
4. Click "Summarize" or press Enter
5. View the transcript, summary, and key points

## Supported YouTube URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

## Configuration

### Environment Variables

**Backend (.env):**
- `PORT`: Server port (default: 5000)
- `OPENAI_API_KEY`: Your OpenAI API key (optional)

**Frontend (.env):**
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)

## Features & Limitations

### Supported Features
- ✅ Transcript extraction
- ✅ Summarization (with or without OpenAI)
- ✅ Key point extraction
- ✅ URL validation
- ✅ Error handling
- ✅ Responsive UI

### Current Limitations
- Some videos may not have publicly available transcripts
- Transcripts must be in English (for best results)
- API rate limits apply with OpenAI

## Troubleshooting

### "Failed to extract transcript"
- The video may not have captions enabled
- Check if the video URL is valid
- Some videos restrict transcript access

### CORS Error
- Ensure both frontend and backend are running
- Check that the API URL in frontend matches the backend URL

### "OpenAI API key not found"
- The app will fall back to basic summarization
- To enable AI summarization, add your OpenAI API key to `.env`

## Future Enhancements

- [ ] Multiple language support
- [ ] Custom summarization length
- [ ] History/saved summaries
- [ ] Video thumbnail display
- [ ] Download summary as PDF
- [ ] Share summaries
- [ ] Batch processing

## Technology Stack

**Backend:**
- Node.js
- Express.js
- OpenAI API
- youtube-transcript library

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript
- (Optional) React

## License

MIT

## Support

For issues or questions, please create an issue in the repository.

---

Happy summarizing! 📺✨
