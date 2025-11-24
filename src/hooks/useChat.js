import { useState } from 'react';
import { createConversation, sendQuery } from '../lib/api';

export const useChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendQuery = async (query, conversationId, location, domain = 'general') => {
    setLoading(true);
    setError(null);

    try {
      const data = await sendQuery(query, conversationId, location, domain);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const handleCreateConversation = async (domain = 'general') => {
    try {
      const data = await createConversation(domain);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    sendQuery: handleSendQuery,
    createConversation: handleCreateConversation,
    loading,
    error,
  };
};
