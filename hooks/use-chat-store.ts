import { useEffect } from 'react';
import { useChatStore } from '@/store/chat-store';
import { detectInvestigationIntent } from '@/lib/api/chat.service';

export function useChat() {
  const store = useChatStore();

  // Initialize chat on mount
  useEffect(() => {
    const sessionId = store.session?.session_id;
    
    // Always initialize chat, it will create a session if needed
    store.initializeChat(sessionId);

    // Cleanup on unmount
    return () => {
      // Cancel any ongoing streams
      if ((window as any).__streamCleanup) {
        (window as any).__streamCleanup();
        delete (window as any).__streamCleanup;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Send message with smart routing
  const sendMessage = async (content: string, options?: { streaming?: boolean; websocket?: boolean }) => {
    // For now, always use REST API until SSE is properly configured
    console.log('[useChat] Sending message:', content, 'Session:', store.session);
    await store.sendMessage(content, false);
  };

  // Quick action handler
  const handleQuickAction = (action: string) => {
    sendMessage(action, { streaming: true });
  };

  // Retry failed message
  const retryMessage = async (messageId: string) => {
    const message = store.messages.find(m => m.id === messageId);
    if (message && message.role === 'user') {
      await sendMessage(message.content);
    }
  };

  // Get connection status text
  const getConnectionStatusText = () => {
    switch (store.connectionStatus) {
      case 'connecting':
        return 'Conectando...';
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'error':
        return 'Erro de conexão';
    }
  };

  // Check if can send message
  const canSendMessage = !store.isLoading && store.error === null;

  return {
    // State
    messages: store.messages,
    session: store.session,
    connectionStatus: store.connectionStatus,
    connectionStatusText: getConnectionStatusText(),
    isTyping: store.isTyping,
    agentTyping: store.agentTyping,
    activeAgents: store.activeAgents,
    suggestedActions: store.suggestedActions,
    currentInvestigation: store.currentInvestigation,
    error: store.error,
    isLoading: store.isLoading,
    canSendMessage,
    
    // Actions
    sendMessage,
    handleQuickAction,
    retryMessage,
    clearChat: store.clearChat,
    setTyping: store.setTyping,
    clearError: store.clearError,
    loadMoreMessages: store.loadMoreMessages,
    
    // WebSocket actions
    connectWebSocket: store.connectWebSocket,
    disconnectWebSocket: store.disconnectWebSocket,
    
    // Investigation actions
    subscribeToInvestigation: store.subscribeToInvestigation,
    unsubscribeFromInvestigation: store.unsubscribeFromInvestigation,
  };
}

// Hook for agent status
export function useAgentStatus() {
  const activeAgents = useChatStore((state) => state.activeAgents);
  const agentTyping = useChatStore((state) => state.agentTyping);
  
  const getActiveAgentNames = () => {
    return activeAgents
      .filter(agent => agent.status === 'busy')
      .map(agent => agent.name)
      .join(', ');
  };
  
  const hasActiveAgents = activeAgents.some(agent => agent.status === 'busy');
  
  return {
    activeAgents,
    agentTyping,
    hasActiveAgents,
    activeAgentNames: getActiveAgentNames(),
  };
}

// Hook for suggested actions
export function useSuggestedActions() {
  const suggestedActions = useChatStore((state) => state.suggestedActions);
  const sendMessage = useChatStore((state) => state.sendStreamingMessage);
  
  const handleAction = (action: string) => {
    sendMessage(action);
  };
  
  return {
    suggestedActions,
    handleAction,
  };
}