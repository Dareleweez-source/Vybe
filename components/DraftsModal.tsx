import React from 'react';
import type { Post } from '../types';

interface DraftsModalProps {
    isOpen: boolean;
    onClose: () => void;
    drafts: Partial<Post>[];
    onLoadDraft: (draft: Partial<Post>) => void;
    onDeleteDraft: (draftId: string) => void;
}

const DraftsModal: React.FC<DraftsModalProps> = ({ isOpen, onClose, drafts, onLoadDraft, onDeleteDraft }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background dark:bg-dark-background rounded-2xl w-full max-w-md shadow-lg flex flex-col h-[70vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between sticky top-0 bg-background dark:bg-dark-background rounded-t-2xl">
                    <h2 className="text-xl font-bold">Drafts</h2>
                    <button onClick={onClose} className="text-on-surface dark:text-dark-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover">&times;</button>
                </div>
                <div className="overflow-y-auto flex-1">
                    {drafts.length > 0 ? (
                        <ul>
                            {drafts.map(draft => (
                                <li key={draft.id} className="border-b border-gray-200 dark:border-dark-border">
                                    <div className="p-4 hover:bg-gray-100 dark:hover:bg-dark-surface-hover flex justify-between items-start gap-4">
                                        <button onClick={() => onLoadDraft(draft)} className="text-left flex-1 min-w-0">
                                            <p className="font-semibold line-clamp-1">{draft.content || 'No text content'}</p>
                                            <p className="text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary mt-1 truncate">
                                                {draft.fileType && <span className="font-medium mr-2 bg-gray-200 dark:bg-dark-surface-secondary px-1.5 py-0.5 rounded-sm">{draft.fileType.toUpperCase()}</span>}
                                                {draft.poll && <span className="font-medium mr-2 bg-gray-200 dark:bg-dark-surface-secondary px-1.5 py-0.5 rounded-sm">POLL</span>}
                                                {draft.quotedPost && <span className="font-medium mr-2 bg-gray-200 dark:bg-dark-surface-secondary px-1.5 py-0.5 rounded-sm">QUOTE</span>}
                                                <span className="italic">{draft.content ? draft.content.substring(0, 50) + '...' : 'Media or poll content'}</span>
                                            </p>
                                        </button>
                                        <button onClick={() => onDeleteDraft(draft.id!)} className="text-red-500 font-semibold text-sm flex-shrink-0 py-1 px-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50">Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-8 text-center text-on-surface-secondary dark:text-dark-on-surface-secondary">You have no saved drafts.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DraftsModal;