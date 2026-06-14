import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getTranscript } from './utils/transcript.js';
import { summarizeText } from './utils/summarizer.js';
import { extractKeyPoints } from './utils/keyPoints.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Main summarization endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    // Extract video ID from URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Get transcript
    let transcript;
    try {
      transcript = await getTranscript(videoId);
    } catch (error) {
      console.error('Transcript error:', error.message);
      return res.status(500).json({ 
        error: 'Unable to extract transcript from this video. The video may not have captions available or may have age restrictions.',
        details: error.message
      });
    }

    if (!transcript || transcript.trim().length === 0) {
      return res.status(500).json({ 
        error: 'No transcript content found for this video' 
      });
    }

    console.log(`Processing transcript of ${transcript.length} characters`);

    // Generate summary
    const summary = await summarizeText(transcript);

    // Extract key points
    const keyPoints = await extractKeyPoints(transcript);

    res.json({
      videoId,
      url,
      transcript,
      summary,
      keyPoints,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during summarization' });
  }
});

// Helper function to extract video ID from URL
function extractVideoId(url) {
  const patterns = [
    // Standard videos
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // Embed
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    // /v/
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    // Shorts - IMPORTANT: Shorts use different URL format
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    // Shorts with parameters
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})\?/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      console.log(`Extracted video ID: ${match[1]} from URL: ${url}`);
      return match[1];
    }
  }
  
  console.log(`Could not extract video ID from: ${url}`);
  return null;
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
