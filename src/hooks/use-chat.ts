import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ENDPOINTS, authHelpers } from '../lib/api-config';
import { Chat, CreateChat, Message, SendMessage } from '../lib/types';

// Chat hooks
export const useChats = () => {
  const token = authHelpers.getToken();
  
  return useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: async () => {
      try {
        const response = await api.get(ENDPOINTS.CHAT.ALL);
        // Backend returns ChatResponse with chats array
        return response.data.chats || [];
      } catch (error) {
        throw error;
      }
    },
    enabled: !!token, // Only run query if user has a token
    retry: false, // Don't retry on failure to prevent loops
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateChat): Promise<{ _id: string }> => {
      const response = await api.post(ENDPOINTS.CHAT.CREATE, data);
      // Backend returns SuccessResponse with chat_id in data
      return { _id: response.data.data.chat_id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

export const useChatMessages = (chatId: string) => {
  const token = authHelpers.getToken();
  
  return useQuery<Message[]>({
    queryKey: ['chat-messages', chatId],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.CHAT.MESSAGES(chatId));
      return response.data;
    },
    enabled: !!chatId && !!token, // Only run if we have both chatId and token
  });
};

export const useSendMessage = (chatId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendMessage): Promise<Message> => {
      const response = await api.post(ENDPOINTS.CHAT.SEND_MESSAGE(chatId), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

export const useMarkChatAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string): Promise<void> => {
      await api.put(ENDPOINTS.CHAT.MARK_READ(chatId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

export const useUnreadMessagesCount = () => {
  const token = authHelpers.getToken();
  const { data: chats } = useChats();
  
  if (!token) return 0;
  
  return chats?.reduce((total, chat) => {
    const unreadCount = Object.values(chat.unread_count || {}).reduce((sum, count) => sum + count, 0);
    return total + unreadCount;
  }, 0) || 0;
};