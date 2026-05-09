import {
  aiChatStream,
  createAiChatSession,
  deleteAiChatSession,
  getAiChatMessages,
  getAiChatSessions,
} from '@teable/openapi';

export const useAiChatApi = () => {
  return {
    aiChatStream,
    createAiChatSession,
    deleteAiChatSession,
    getAiChatMessages,
    getAiChatSessions,
  };
};
