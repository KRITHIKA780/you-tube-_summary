import OpenAI from 'openai';

let openai = null;

// Initialize OpenAI client
function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function summarizeText(text) {
  try {
    const client = getOpenAIClient();

    if (!client) {
      // Fallback: simple extractive summary if OpenAI not configured
      return generateFallbackSummary(text);
    }

    // Split into chunks if text is very long
    const textChunks = splitText(text, 3000);
    const summaryPoints = [];

    for (const chunk of textChunks) {
      try {
        const response = await client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a concise summarizer. Return ONLY a numbered list (1. ...) of 5-7 concise bullet points that capture the core ideas. No paragraphs, no extra text, no preamble.'
            },
            {
              role: 'user',
              content: `Summarize the following transcript text into numbered bullet points (keep each point to 1-2 sentences):\n\n${chunk}`
            }
          ],
          max_tokens: 300,
          temperature: 0.2,
        });

        if (response.choices && response.choices[0]) {
          const points = response.choices[0].message.content;
          summaryPoints.push(points);
        }
      } catch (error) {
        console.error('Error in chunk processing:', error);
      }
    }

    // Combine, normalize to a numbered list and deduplicate
    const finalSummary = summaryPoints.join('\n');
    const normalized = normalizeToNumberedList(finalSummary, 7);
    return normalized || generateFallbackSummary(text);
  } catch (error) {
    console.error('Summarization error:', error);
    return generateFallbackSummary(text);
  }
}

function normalizeToNumberedList(rawText, maxItems = 7) {
  if (!rawText) return null;
  const lines = rawText.split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  // Collect candidate lines that look like bullets or sentences
  const candidates = [];
  for (const line of lines) {
    // Remove leading bullets like •, -, or numbering
    const cleaned = line.replace(/^\s*(?:\d+\.|\*|•|\-|\s)+\s*/, '').trim();
    if (cleaned.length > 10) candidates.push(cleaned);
    if (candidates.length >= maxItems) break;
  }

  if (candidates.length === 0) return null;

  // Deduplicate while preserving order
  const seen = new Set();
  const uniq = [];
  for (const c of candidates) {
    const key = c.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(c);
    }
  }

  return uniq.map((t, i) => `${i + 1}. ${t}`).join('\n');
}

export async function extractKeyPoints(text) {
  try {
    const client = getOpenAIClient();

    if (!client) {
      // Fallback: simple extractive key points
      return generateFallbackKeyPoints(text);
    }

    // For very long texts, focus on the most important sections
    let focusText = text;
    if (text.length > 5000) {
      // Take first 30% and last 30% of content (usually most important)
      const thirdLength = Math.floor(text.length / 3);
      focusText = text.substring(0, thirdLength * 2) + '\n...\n' + text.substring(text.length - thirdLength);
    }

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Extract ONLY 5-7 most critical points from this text. Format as a numbered list. Each point should be concise (1-2 sentences). No paragraphs or lengthy explanations.'
        },
        {
          role: 'user',
          content: `Extract key points:\n\n${focusText}`
        }
      ],
      max_tokens: 500,
      temperature: 0.5,
    });

    if (response.choices && response.choices[0]) {
      return response.choices[0].message.content;
    }

    return generateFallbackKeyPoints(text);
  } catch (error) {
    console.error('Key points extraction error:', error);
    return generateFallbackKeyPoints(text);
  }
}

function splitText(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
}

function generateFallbackSummary(text) {
  // Extract important sentences without AI
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.replace(/\s+/g, ' ').trim()).filter(s => s.length > 20);

  if (sentences.length === 0) return 'No summary available';

  // Choose up to 5 representative sentences from start/middle/end
  const picks = [];
  picks.push(sentences[0]);
  if (sentences.length > 2) picks.push(sentences[Math.floor(sentences.length / 3)]);
  if (sentences.length > 3) picks.push(sentences[Math.floor(sentences.length / 2)]);
  if (sentences.length > 4) picks.push(sentences[Math.floor((sentences.length * 2) / 3)]);
  if (sentences.length > 1 && picks.length < 5) picks.push(sentences[sentences.length - 1]);

  // Deduplicate and limit
  const uniq = Array.from(new Set(picks)).slice(0, 5);

  return uniq.map((s, i) => `${i + 1}. ${s.replace(/\s+\[.*?\]\s*/g, ' ').trim()}`).join('\n');
}

function generateFallbackKeyPoints(text) {
  const sentences = text.split(/[.!?]+/)
    .filter(s => s.trim().length > 30)
    .slice(0, 7);
  
  const points = sentences
    .map((s, i) => `${i + 1}. ${s.trim()}`)
    .join('\n');
  
  return points || 'No key points could be extracted';
}
