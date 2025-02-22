// import axios from "axios";

// const OPENAI_API_URL = "https://api.openai.com/v1/completions";

// export const getGroqCompletion = async (prompt) => {
//   try {
//     console.log("API Key:", import.meta.env.VITE_OPENAI_API_KEY);
//     const response = await axios.post(
//       OPENAI_API_URL,
//       {
//         model: "text-davinci-003",
//         prompt: prompt,
//         max_tokens: 100,
//         temperature: 0.7,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     return response.data.choices[0].text.trim();
//   } catch (error) {
//     console.error("Error fetching completion:", error.response?.data || error.message);
//     return null;
//   }
// };

import axios from 'axios';

const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export const getGroqCompletion = async ({ prompt, language }) => {
  try {
    const response = await axios.post(
      GROQ_API_ENDPOINT,
      {
        model: 'llama2-70b-4096',
        messages: [
          {
            role: 'system',
            content: `You are an AI code completion assistant. Provide brief, contextual code completions for ${language}. Only return the completion text, no explanations.`
          },
          {
            role: 'user',
            content: `Complete this ${language} code: ${prompt}`
          }
        ],
        max_tokens: 100,
        temperature: 0.1,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      text: response.data.choices[0].message.content.trim()
    };
  } catch (error) {
    console.error('Groq API Error:', error);
    return { text: '' };
  }
};