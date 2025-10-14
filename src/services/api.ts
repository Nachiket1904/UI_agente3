import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';


export interface Bot {
  id: string;
  name: string;
  system_prompt: string;
  logo_left?: string;
  logo_right?: string;
  created_at?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  response_time?: number;
}

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
  response_time: number;
}

export const api = {
  // Get all bots
  getBots: async (): Promise<Bot[]> => {
    const response = await axios.get(`${API_BASE_URL}bots/bots`);
    return response.data;
  },

  // Get single bot
  getBot: async (botId: string): Promise<Bot> => {
    const response = await axios.get(`${API_BASE_URL}/bots/${botId}`);
    return response.data;
  },

  // Create new bot
  createBot: async (data: {
    name: string;
    system_prompt: string;
    logo_left?: File;
    logo_right?: File;
    pdfs?: File[];
  }): Promise<Bot> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('system_prompt', data.system_prompt);
    
    if (data.logo_left) {
      formData.append('logo_left', data.logo_left);
    }
    if (data.logo_right) {
      formData.append('logo_right', data.logo_right);
    }
    if (data.pdfs) {
      data.pdfs.forEach(pdf => {
        formData.append('pdfs', pdf);
      });
    }

    const response = await axios.post(`${API_BASE_URL}/bots`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update bot
  updateBot: async (
    botId: string,
    data: {
      system_prompt?: string;
      logo_left?: File;
      logo_right?: File;
      pdfs?: File[];
      rebuild_vectorstore?: boolean;
    }
  ): Promise<Bot> => {
    const formData = new FormData();
    
    if (data.system_prompt) {
      formData.append('system_prompt', data.system_prompt);
    }
    if (data.logo_left) {
      formData.append('logo_left', data.logo_left);
    }
    if (data.logo_right) {
      formData.append('logo_right', data.logo_right);
    }
    if (data.pdfs) {
      data.pdfs.forEach(pdf => {
        formData.append('pdfs', pdf);
      });
    }
    if (data.rebuild_vectorstore !== undefined) {
      formData.append('rebuild_vectorstore', String(data.rebuild_vectorstore));
    }

    const response = await axios.put(`${API_BASE_URL}/bots/${botId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete bot
  deleteBot: async (botId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/bots/${botId}`);
  },

  // Chat with bot
  // Chat with bot
  chat: async (botId: string, question: string): Promise<ChatResponse> => {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      bot_id: botId,
      query: question,
    });
    return response.data;
  },

};


