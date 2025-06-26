
import axios from 'axios';

const API_KEYS = [
  '65560d6fd6msha21d1fb7df6c45cp165b1djsn3b50ced25f83',
  '359df03b12msh7db3fabbc8e8adfp14eef9jsn6273b5b4d5dc',
  'bb766ffd43msha36bd23379e5acfp1b50edjsn1b4cc57ec962',
  'f1cfc6624amshc1f7a8bfd6d6077p1623c3jsn944853391dde'
];

let currentKeyIndex = 0;

const API_CONFIG = {
  url: 'https://chatgpt-ai-assistant.p.rapidapi.com/',
  host: 'chatgpt-ai-assistant.p.rapidapi.com'
};

const getNextApiKey = (): string => {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
};

const makeApiRequest = async (userMessage: string, apiKey: string): Promise<string> => {
  const options = {
    method: 'POST',
    url: API_CONFIG.url,
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': API_CONFIG.host,
      'Content-Type': 'application/json'
    },
    data: {
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    }
  };

  const response = await axios.request(options);
  console.log('AI service response:', response.data);
  
  // Extract the response content based on the API response structure
  if (response.data && response.data.choices && response.data.choices[0]) {
    return response.data.choices[0].message.content;
  } else if (response.data && response.data.message) {
    return response.data.message;
  } else if (response.data && typeof response.data === 'string') {
    return response.data;
  } else {
    throw new Error('Unexpected response format');
  }
};

export const generatePhrase = async (userMessage: string): Promise<string> => {
  let lastError: Error | null = null;
  
  // Try all API keys in rotation
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    const currentApiKey = getNextApiKey();
    
    try {
      console.log(`Attempting request with API key ${attempt + 1}/${API_KEYS.length}`);
      return await makeApiRequest(userMessage, currentApiKey);
    } catch (error) {
      console.error(`API key ${attempt + 1} failed:`, error);
      lastError = error as Error;
      
      if (axios.isAxiosError(error)) {
        // If it's a rate limit error, try the next key
        if (error.response?.status === 429) {
          console.log(`Rate limit hit for API key ${attempt + 1}, trying next key...`);
          continue;
        }
        // For other errors, we might want to try other keys too
        if (error.response?.status === 401 || error.response?.status >= 500) {
          console.log(`Error ${error.response.status} for API key ${attempt + 1}, trying next key...`);
          continue;
        }
      }
      
      // For unexpected errors, still try the next key
      continue;
    }
  }
  
  // If all keys failed, throw the last error
  console.error('All API keys failed');
  
  if (axios.isAxiosError(lastError)) {
    if (lastError.response?.status === 429) {
      throw new Error('All API keys have reached their rate limit. Please try again later.');
    } else if (lastError.response?.status === 401) {
      throw new Error('Authentication failed for all API keys. Please check your API keys.');
    } else if (lastError.response?.status >= 500) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    }
  }
  
  throw new Error('Failed to generate response with any API key. Please try again.');
};
