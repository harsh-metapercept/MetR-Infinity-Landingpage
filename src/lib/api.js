import { marked } from 'marked';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const createConversation = async (domain = 'general') => {
  const response = await fetch(`${BACKEND_URL}/api/v1/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ domain }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

export const getConversation = async (conversationId) => {
  const response = await fetch(`${BACKEND_URL}/api/v1/conversations/${conversationId}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

export const streamQuery = async (query, conversationId, location, onChunk, domain = 'general') => {
  const response = await fetch(`${BACKEND_URL}/api/v1/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      conversation_id: conversationId,
      domain,
      latitude: location?.latitude,
      longitude: location?.longitude,
      country: location?.country,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullMarkdown = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    if (!chunk.trim()) continue;

    buffer += chunk;
    
    const startMarker = '---SUPPORTING_DOCS_START---';
    const endMarker = '---SUPPORTING_DOCS_END---';
    const startIdx = buffer.indexOf(startMarker);
    const endIdx = buffer.indexOf(endMarker);

    if (startIdx !== -1 && endIdx !== -1) {
      const beforeDocs = buffer.substring(0, startIdx);
      const docsJson = buffer.substring(startIdx + startMarker.length, endIdx).trim();
      const afterDocs = buffer.substring(endIdx + endMarker.length);

      if (beforeDocs.trim()) {
        fullMarkdown += beforeDocs;
        const html = marked(fullMarkdown);
        onChunk(html, 'text');
      }
      
      try {
        const docs = JSON.parse(docsJson);
        onChunk(docs, 'docs');
      } catch (e) {
        console.warn('Failed to parse docs:', e);
      }

      buffer = afterDocs;
      fullMarkdown = '';
    } else if (startIdx !== -1) {
      const beforeDocs = buffer.substring(0, startIdx);
      if (beforeDocs.trim()) {
        fullMarkdown += beforeDocs;
        const html = marked(fullMarkdown);
        onChunk(html, 'text');
      }
      buffer = buffer.substring(startIdx);
    } else {
      fullMarkdown += chunk;
      const html = marked(fullMarkdown);
      onChunk(html, 'text');
    }
  }
};
