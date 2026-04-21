const axios = require('axios');

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MAX_CANDIDATES = 20;

/**
 * Build a compact summary of each candidate book for the AI prompt.
 */
function summariseBook(book, index) {
  const authors = (book.authors || []).join(', ');
  const tags = (book.tags || []).join(', ');
  return `[${index}] id:${book._id} | "${book.title}" by ${authors || 'Unknown'} | tags: ${tags || 'none'} | type: ${book.resourceType || 'physical'}`;
}

/**
 * Call OpenAI to rerank the candidate books for the given query.
 * Returns the reranked list, or throws on failure.
 */
async function reRankWithOpenAI(query, candidates) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const candidateText = candidates.map(summariseBook).join('\n');

  const systemPrompt =
    'You are a library search assistant. Given a user query and a numbered list of books, ' +
    'return ONLY a JSON array of book IDs (the "id:" value from each line) ordered from most ' +
    'relevant to least relevant. Include only IDs that are genuinely relevant to the query. ' +
    'Do not include any explanation, markdown, or extra text — just the raw JSON array.';

  const userPrompt =
    `User query: "${query}"\n\nCandidates:\n${candidateText}\n\n` +
    'Return a JSON array of relevant book IDs ordered by relevance, e.g. ["id1","id2"].';

  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0,
      max_tokens: 512
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10_000
    }
  );

  const raw = response.data.choices?.[0]?.message?.content?.trim() || '[]';
  const orderedIds = JSON.parse(raw);

  if (!Array.isArray(orderedIds)) throw new Error('OpenAI returned unexpected format');

  const idToBook = new Map(candidates.map((b) => [String(b._id), b]));
  const reRanked = [];
  const seen = new Set();

  for (const id of orderedIds) {
    const book = idToBook.get(String(id));
    if (book && !seen.has(String(id))) {
      reRanked.push(book);
      seen.add(String(id));
    }
  }

  // Append any candidates not mentioned by the AI at the end
  for (const book of candidates) {
    if (!seen.has(String(book._id))) reRanked.push(book);
  }

  return reRanked;
}

async function optionalAiEnhanceSearch({ query, results }) {
  const useOpenAI = String(process.env.USE_OPENAI_SEARCH || 'false').toLowerCase() === 'true';

  if (!useOpenAI || !process.env.OPENAI_API_KEY) {
    return { mode: 'local', results };
  }

  try {
    const candidates = results.slice(0, MAX_CANDIDATES);
    const tail = results.slice(MAX_CANDIDATES);
    const reRanked = await reRankWithOpenAI(query, candidates);
    return { mode: 'ai', results: [...reRanked, ...tail] };
  } catch (err) {
    console.error('[aiSearchAdapter] OpenAI call failed, falling back to local ranking:', err.message);
    return { mode: 'local_fallback', results };
  }
}

module.exports = { optionalAiEnhanceSearch };
