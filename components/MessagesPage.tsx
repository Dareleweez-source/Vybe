import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { User, Message } from '../types';
// FIX: Changed to a named import to resolve module export error.
import { ChatView } from './ChatView';
import NewMessageModal from './NewMessageModal';
import { ComposeIcon, VerifiedIcon, MicrophoneIcon, BackIcon } from '../constants';

import AppHeader from './AppHeader';

interface MessagesPageProps {
  messages: Message[];
  currentUser: User;
  allUsers: User[];
  onSendMessage: (receiverId: string, message: { text?: string; audioUrl?: string; type: 'text' | 'audio' }) => void;
  onMarkAsRead: (partnerId: string) => void;
  onMessageReaction: (messageId: string, emoji: string) => void;
  activeConversationUserId: string | null;
  setActiveConversationUserId: (userId: string | null) => void;
  blockedUserIds: string[];
  onBack?: () => void;
  onNavigate?: (path: string) => void;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ messages, currentUser, allUsers, onSendMessage, onMarkAsRead, onMessageReaction, activeConversationUserId, setActiveConversationUserId, blockedUserIds, onBack, onNavigate }) => {
  const [isNewMessageModalOpen, setNewMessageModalOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollTop = useRef<number>(0);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const conversations = useMemo(() => {
    const conversationsMap = new Map<string, { user: User; lastMessage: Message }>();
    
    const sortedMessages = [...(messages || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    for (const message of sortedMessages) {
      const partnerId = message.senderId === currentUser.id ? message.receiverId : message.senderId;
      if (!conversationsMap.has(partnerId)) {
        const partner = allUsers.find(u => u.id === partnerId);
        if (partner && partner.accountStatus !== 'disabled' && !blockedUserIds.includes(partnerId)) {
          conversationsMap.set(partnerId, {
            user: partner,
            lastMessage: message,
          });
        }
      }
    }
    
    return Array.from(conversationsMap.values());
  }, [messages, currentUser.id, allUsers, blockedUserIds]);
  
  useEffect(() => {
    const container = scrollableContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      if (currentScrollTop > lastScrollTop.current && currentScrollTop > 50) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollTop.current = currentScrollTop;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectConversation = (userId: string) => {
    onMarkAsRead(userId);
    setActiveConversationUserId(userId);
  };

  const handleSelectUser = (user: User) => {
    onMarkAsRead(user.id);
    setActiveConversationUserId(user.id);
    setNewMessageModalOpen(false);
  };

  const activePartner = allUsers.find(u => u.id === activeConversationUserId);
  const messagesForActiveConversation = (messages || []).filter(
    msg => (msg.senderId === currentUser.id && msg.receiverId === activeConversationUserId) ||
           (msg.senderId === activeConversationUserId && msg.receiverId === currentUser.id)
  );
  
  if (activeConversationUserId && activePartner) {
    return (
      <div className="w-full flex flex-col h-[100dvh] md:h-auto">
          <ChatView
            partner={activePartner}
            messages={messagesForActiveConversation}
            currentUser={currentUser}
            onSendMessage={onSendMessage}
            onBack={() => setActiveConversationUserId(null)}
            onMessageReaction={onMessageReaction}
          />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-screen">
      {onNavigate && <AppHeader currentUser={currentUser} activeView="Messages" onNavigate={onNavigate} />}
      <div className={`sticky top-0 bg-background dark:bg-dark-background z-10 px-4 py-3 border-b border-border dark:border-dark-border flex justify-between items-center transition-transform duration-300 shadow-sm ${!isHeaderVisible ? '-translate-y-full' : ''}`}>
        <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
                <BackIcon className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-xl font-bold">Messages</h1>
        </div>
        <button onClick={() => setNewMessageModalOpen(true)} className="p-2 rounded-full hover:bg-primary/10" aria-label="New message">
            <ComposeIcon className="w-6 h-6 text-primary" />
        </button>
      </div>
      <div ref={scrollableContainerRef} className="overflow-y-auto flex-1">
        {conversations.length > 0 ? (
          <ul>
            {conversations.map(({ user, lastMessage }) => {
              const isUnread = lastMessage.senderId !== currentUser.id && !lastMessage.read;
              return (
                <li key={user.id}>
                  <button onClick={() => handleSelectConversation(user.id)} className="w-full text-left p-4 flex items-center gap-4 hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors duration-200 border-b border-border dark:border-dark-border">
                    <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold truncate">{user.name}</span>
                          {user.verificationStatus === 'verified' && <VerifiedIcon className="w-4 h-4 text-primary flex-shrink-0" />}
                          <span className="text-on-surface-secondary dark:text-dark-on-surface-secondary truncate">{user.handle}</span>
                      </div>
                       <p className={`${isUnread ? 'text-on-surface dark:text-dark-on-surface font-semibold' : 'text-on-surface-secondary dark:text-dark-on-surface-secondary'} truncate flex items-center gap-1.5`}>
                        {lastMessage.type === 'audio' ? (
                          <>
                            <MicrophoneIcon className="w-4 h-4 flex-shrink-0" />
                            <span>Voice message</span>
                          </>
                        ) : lastMessage.text}
                      </p>
                    </div>
                    {isUnread && <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h2 className="text-2xl font-bold">No messages yet</h2>
            <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-2 max-w-sm">Start a conversation by sending a new message.</p>
          </div>
        )}
      </div>
      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setNewMessageModalOpen(false)}
        users={allUsers}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        blockedUserIds={blockedUserIds}
      />
    </div>
  );
};

export default MessagesPage;