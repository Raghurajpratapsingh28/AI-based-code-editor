import axios from 'axios';

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

export const getCompletion = async ({ prompt, language }) => {
  try {
    const response = await axios.post(
      OPENAI_API_ENDPOINT,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: 'system',
            content: `You are an AI code completion assistant. Provide brief, contextual code completions for ${language}. Only return the completion text, no explanations or markdown.`
          },
          {
            role: 'user',
            content: `Complete this ${language} code (only provide the completion, no explanations): ${prompt}`
          }
        ],
        max_tokens: 100,
        temperature: 0.1,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      text: response.data.choices[0].message.content.trim()
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    return { text: '' };
  }
};