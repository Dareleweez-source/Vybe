import React, { useState } from 'react';
import { ReportReason } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, description: string) => void;
  reportedType: 'post' | 'comment' | 'user';
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'violence', label: 'Violence or Dangerous Organizations' },
  { value: 'nudity', label: 'Nudity or Sexual Activity' },
  { value: 'misinformation', label: 'False Information' },
  { value: 'other', label: 'Something Else' },
];

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit, reportedType }) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedReason) {
      onSubmit(selectedReason, description);
      onClose();
      setSelectedReason(null);
      setDescription('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background dark:bg-dark-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border dark:border-dark-border">
        <div className="p-4 border-b border-border dark:border-dark-border flex justify-between items-center">
          <h2 className="text-lg font-bold">Report {reportedType}</h2>
          <button onClick={onClose} className="text-on-surface-secondary hover:text-on-surface">
            ✕
          </button>
        </div>
        
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <p className="mb-4 text-sm text-on-surface-secondary">
            Please select a problem to continue. You can also add a description to help us understand what is wrong.
          </p>
          
          <div className="space-y-2 mb-4">
            {REPORT_REASONS.map((reason) => (
              <button
                key={reason.value}
                onClick={() => setSelectedReason(reason.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  selectedReason === reason.value
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border dark:border-dark-border hover:bg-surface-hover dark:hover:bg-dark-surface-hover'
                }`}
              >
                {reason.label}
              </button>
            ))}
          </div>

          {selectedReason && (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details (optional)..."
              className="w-full p-3 rounded-xl bg-surface dark:bg-dark-background border border-border dark:border-dark-border focus:outline-none focus:border-primary resize-none h-24"
            />
          )}
        </div>

        <div className="p-4 border-t border-border dark:border-dark-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full font-semibold hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason}
            className="px-6 py-2 rounded-full bg-primary text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
