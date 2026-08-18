import React, { useState } from 'react';
import type { User } from '../types';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
  blockedUserIds: string[];
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({ isOpen, onClose, users, currentUser, onSelectUser, blockedUserIds }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const otherUsers = (users || []).filter(user => user.id !== currentUser.id && user.accountStatus !== 'disabled' && !blockedUserIds.includes(user.id));

  const filteredUsers = otherUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-10 md:pt-20" onClick={onClose}>
      <div className="bg-background rounded-2xl w-full max-w-md shadow-lg flex flex-col h-[70vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-background">
          <button onClick={onClose} className="text-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200" aria-label="Close">&times;</button>
          <h2 className="text-xl font-bold">New message</h2>
          <div className="w-9"></div> {/* Spacer */}
        </div>
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search people"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface rounded-full py-2 px-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="overflow-y-auto flex-1">
          {filteredUsers.length > 0 ? (
            <ul>
              {filteredUsers.map(user => (
                <li key={user.id}>
                  <button onClick={() => onSelectUser(user)} className="w-full text-left p-4 flex items-center gap-4 hover:bg-gray-100 transition-colors duration-200">
                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-on-surface-secondary">{user.handle}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-center text-on-surface-secondary">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;