
import React, { useState, useRef, useEffect } from 'react';

interface StartLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStream: (title: string) => void;
}

const StartLiveModal: React.FC<StartLiveModalProps> = ({ isOpen, onClose, onCreateStream }) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const setupCamera = async () => {
      if (isOpen) {
        try {
          setError(null);
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.warn("Error accessing camera/mic, using fallback simulation:", err);
          // Fallback for preview/demo
          if (videoRef.current) {
             videoRef.current.srcObject = null;
             videoRef.current.src = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
             videoRef.current.loop = true;
             videoRef.current.muted = true;
             videoRef.current.play().catch(e => console.log(e));
          }
        }
      } else {
        // Cleanup: stop media tracks when modal is closed
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
    };
    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateStream(title.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl w-full max-w-lg shadow-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold">Go Live</h2>
          <button onClick={onClose} className="text-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="stream-title" className="block text-sm font-medium text-on-surface-secondary mb-1">Stream Title</label>
              <input
                id="stream-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What's your stream about?"
                className="w-full bg-surface border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Streaming
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StartLiveModal;
