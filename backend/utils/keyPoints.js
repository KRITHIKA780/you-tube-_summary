export async function extractKeyPoints(text) {
  try {
    // Simple keyword extraction based on frequency and position
    const keywords = extractKeywords(text);
    const points = generatePoints(text, keywords);
    return points.join('\n');
  } catch (error) {
    console.error('Key points extraction error:', error);
    return 'Unable to extract key points';
  }
}

function extractKeywords(text) {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'it',
    'as', 'if', 'so', 'also', 'just', 'there', 'their', 'what', 'which', 'who',
    'how', 'about', 'very', 'not', 'too', 'all', 'each', 'every', 'both', 'few'
  ]);

  const words = text
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.replace(/[^\w]/g, ''))
    .filter(word => word.length > 4 && !commonWords.has(word));

  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

function generatePoints(text, keywords) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;
    keywords.forEach(keyword => {
      if (sentence.toLowerCase().includes(keyword)) {
        score++;
      }
    });
    // Give higher scores to sentences that appear early and mid
    if (index < sentences.length / 4) score += 3;
    if (index > sentences.length / 2 && index < (sentences.length * 3) / 4) score += 2;
    return { sentence: sentence.trim(), score, index };
  });

  // Get top 5-7 points, sorted by original order
  const topPoints = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .sort((a, b) => a.index - b.index)
    .map((item, i) => `${i + 1}. ${item.sentence}`);

  return topPoints;
}
