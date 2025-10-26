import axios from 'axios';

// Set your base API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Converts a local file path to a public static URL for FastAPI
function toStaticUrl(path: string): string {
  // Replace Windows backslashes with slashes, remove leading 'bots/', and prepend API static path
  const normalized = path.replace(/\\/g, '/').replace(/^bots\//, '');
  return `${API_BASE_URL}/static/${normalized}`;
}

export interface Bot {
  id: string;
  name: string;
  system_prompt: string;
  logo_left?: string;
  logo_right?: string;
  created_at?: string;
  logos?: string[]; // Add this if bots have logos array
  pdfs?: string[];  // Add this if bots have pdfs array
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
    const response = await axios.get(`${API_BASE_URL}/bots/bots`);
    console.log("Fetched bots:", response.data);
    // Map logo and pdf paths to proper URLs
    return response.data.map((bot: any) => ({
      ...bot,
      logos: bot.logos ? bot.logos.map(toStaticUrl) : [],
      pdfs: bot.pdfs ? bot.pdfs.map(toStaticUrl) : [],
    }));
  },

  // Get single bot
  getBot: async (botId: string): Promise<Bot> => {
    const response = await axios.get(`${API_BASE_URL}/bots/${botId}`);
    const bot = response.data;
    return {
      ...bot,
      logos: bot.logos ? bot.logos.map(toStaticUrl) : [],
      pdfs: bot.pdfs ? bot.pdfs.map(toStaticUrl) : [],
    };
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

  // Delete a single PDF
  deletePdf: async (botId: string, pdfName: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/bots/${botId}/pdf`, {
      params: { pdf_name: pdfName },
    });
  },


  // Chat with bot
  chat: async (botId: string, question: string): Promise<ChatResponse> => {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      bot_id: botId,
      query: question,
    });
    return response.data;
  },
};

