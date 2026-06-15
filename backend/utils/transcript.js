import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';

export async function getTranscript(videoId) {
  try {
    console.log(`Fetching transcript for video ID: ${videoId}`);
    
    // Try using youtube-transcript library first
    const transcripts = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (transcripts && transcripts.length > 0) {
      // Preserve segment boundaries as newlines to keep transcript structure
      const transcript = transcripts
        .map(item => item.text.trim())
        .filter(Boolean)
        .join('\n');
      
      if (transcript.trim()) {
        console.log(`Successfully extracted ${transcript.length} characters from transcript`);
        return transcript;
      }
    }

    // Fallback: Try alternate methods
    console.log('Trying alternative transcript extraction methods...');
    const altTranscript = await tryAlternativeMethods(videoId);
    if (altTranscript) {
      return altTranscript;
    }

    throw new Error('No transcript found for this video. YouTube Shorts often do not have transcripts available.');
  } catch (error) {
    console.error('Transcript extraction error:', error.message);
    throw new Error(`Failed to extract transcript: ${error.message}`);
  }
}

async function tryAlternativeMethods(videoId) {
  try {
    // Try with different language codes
    // Try common caption language codes including auto-generated variants
    const languages = ['en', 'en-US', 'en-GB', 'en-CA', 'a.en', 'auto'];
    
    for (const lang of languages) {
      try {
        console.log(`Trying language: ${lang}`);
        const response = await axios.get(
          `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}`,
          { 
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );
        
        if (response.data && response.data.length > 50) {
          const parsed = parseTranscript(response.data);
          if (parsed && parsed.length > 20) {
            console.log(`Found transcript in ${lang}: ${parsed.length} characters`);
            return parsed;
          }
        }
      } catch (e) {
        console.log(`Failed for language ${lang}: ${e.message}`);
        continue;
      }
    }

    // Try without language parameter
    try {
      console.log('Trying without language parameter');
      const response = await axios.get(
        `https://www.youtube.com/api/timedtext?v=${videoId}`,
        { 
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );
      
      if (response.data && response.data.length > 50) {
        const parsed = parseTranscript(response.data);
        if (parsed && parsed.length > 20) {
          console.log(`Found transcript (no lang param): ${parsed.length} characters`);
          return parsed;
        }
      }
    } catch (e) {
      console.log('Failed without language parameter');
    }

  } catch (error) {
    console.error('Alternative method error:', error.message);
  }
  
  return null;
}

function parseTranscript(xmlData) {
  try {
    const textRegex = /<text[^>]*>(.*?)<\/text>/g;
    let fullText = '';
    let match;
    let matchCount = 0;

    while ((match = textRegex.exec(xmlData)) !== null) {
      const text = htmlDecode(match[1]);
      if (text.trim()) {
        // Preserve line breaks between captions
        fullText += text.trim() + '\n';
        matchCount++;
      }
    }

    console.log(`Parsed ${matchCount} text segments`);
    return fullText.trim() || null;
  } catch (error) {
    console.error('Transcript parsing error:', error);
    return null;
  }
}

function htmlDecode(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/\+/g, ' '); // Sometimes + is used for space
}
