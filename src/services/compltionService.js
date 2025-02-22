// src/services/completionService.js
import axios from 'axios';

export const getCompletions = async (code, position, context) => {
  try {
    const response = await axios.post('http://localhost:3000/api/completions', {
      code,
      position,
      context,
      language: context.language
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching completions:', error);
    return { suggestions: [] };
  }
};

export const getQuickFixes = async (code, markers) => {
  try {
    const response = await axios.post('http://localhost:3000/api/quickfix', {
      code,
      markers
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching quick fixes:', error);
    return { fixes: [] };
  }
};

export const getSnippets = async (language) => {
  try {
    const response = await axios.post('http://localhost:3000/api/snippets', {
      language
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching snippets:', error);
    return { snippets: [] };
  }
};