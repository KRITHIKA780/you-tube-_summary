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
              content: 'Extract the 3-4 most important points from this text. Return ONLY bullet points, no paragraphs. Each point should be 1-2 sentences maximum.'
            },
            {
              role: 'user',
              content: `Extract key points from:\n\n${chunk}`
            }
          ],
          max_tokens: 300,
          temperature: 0.5,
        });

        if (response.choices && response.choices[0]) {
          const points = response.choices[0].message.content;
          summaryPoints.push(points);
        }
      } catch (error) {
        console.error('Error in chunk processing:', error);
      }
    }

    // Combine and deduplicate points
    const finalSummary = summaryPoints.join('\n');
    return finalSummary || generateFallbackSummary(text);
  } catch (error) {
    console.error('Summarization error:', error);
    return generateFallbackSummary(text);
  }
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
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  if (sentences.length === 0) return 'No summary available';
  
  // Take key sentences from different parts
  const summary = [];
  if (sentences.length > 0) summary.push('• ' + sentences[0].trim());
  if (sentences.length > 1) summary.push('• ' + sentences[Math.floor(sentences.length / 2)].trim());
  if (sentences.length > 2) summary.push('• ' + sentences[sentences.length - 1].trim());
  
  return summary.join('\n');
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
