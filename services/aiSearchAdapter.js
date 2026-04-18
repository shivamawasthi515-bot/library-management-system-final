async function optionalAiEnhanceSearch({ query, results }) {
  const useOpenAI = String(process.env.USE_OPENAI_SEARCH || 'false').toLowerCase() === 'true';

  if (!useOpenAI) {
    return { mode: 'local', results };
  }

  return { mode: 'local_fallback', results };
}

module.exports = { optionalAiEnhanceSearch };
