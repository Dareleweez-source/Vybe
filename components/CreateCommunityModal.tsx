import React, { useState } from 'react';
import type { Community } from '../types';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (communityData: Omit<Community, 'id' | 'ownerId' | 'memberCount'>) => void;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim() || !description.trim()) {
      setError('All fields are required.');
      return;
    }
    if (handle.includes(' ') || handle.length < 3) {
      setError('Handle must be at least 3 characters and contain no spaces.');
      return;
    }
    setError('');
    onCreate({
      name,
      handle: handle.toLowerCase(),
      description,
      isPrivate,
      avatarUrl: `https://picsum.photos/seed/${handle}/200/200`, // Placeholder
      bannerUrl: `https://picsum.photos/seed/${handle}-banner/1500/500`, // Placeholder
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl w-full max-w-md shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 id="create-community-title" className="text-xl font-bold">Create a Community</h2>
            <button 
                onClick={onClose}
                className="text-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close"
            >
                &times;
            </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-on-surface-secondary">Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} maxLength={30} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-surface border p-2 focus:ring-primary focus:border-primary" />
                <p className="text-xs text-on-surface-secondary mt-1">{30 - name.length} characters remaining</p>
            </div>
            <div>
                <label htmlFor="handle" className="block text-sm font-medium text-on-surface-secondary">Handle</label>
                <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-secondary">c/</span>
                    <input type="text" id="handle" value={handle} onChange={e => setHandle(e.target.value)} maxLength={20} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-surface border p-2 pl-7 focus:ring-primary focus:border-primary" />
                </div>
                 <p className="text-xs text-on-surface-secondary mt-1">{20 - handle.length} characters remaining</p>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-on-surface-secondary">Description</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-surface border p-2 focus:ring-primary focus:border-primary"></textarea>
            </div>
            <div className="flex items-center justify-between bg-surface p-3 rounded-lg">
                <label htmlFor="isPrivate" className="flex flex-col">
                    <span className="font-semibold text-sm">Private Community</span>
                    <span className="text-xs text-on-surface-secondary">Only approved users can view and submit.</span>
                </label>
                <button
                    type="button"
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${isPrivate ? 'bg-primary' : 'bg-gray-200'}`}
                >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            
            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50">
                Create Community
            </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityModal;