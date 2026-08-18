
import React, { useState, useEffect, useRef } from 'react';
import type { LiveStream, LiveStreamComment, User } from '../types';
import { PeopleIcon, SendIcon, LikeIcon } from '../constants';
import { ALL_USERS } from '../mockData';

interface LiveStreamPageProps {
  stream: LiveStream;
  currentUser: User;
  onEndStream: (streamId: string) => void;
  onAddComment: (streamId: string, text: string, user?: User) => void;
  onCommentReaction: (streamId: string, commentId: string, emoji: string) => void;
  onBack: () => void;
}

const REACTION_EMOJIS = ['❤️', '😂', '😮', '🔥', '👍'];

const CommentItem: React.FC<{
    comment: LiveStreamComment;
    onReact: (emoji: string) => void;
}> = ({ comment, onReact }) => {
    const [showReactions, setShowReactions] = useState(false);
    const reactions = comment.reactions || [];

    return (
        <div 
            className="flex items-start gap-2 animate-slide-in-left group relative"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
            onClick={() => setShowReactions(!showReactions)} // For mobile/touch
        >
            <img src={comment.user.avatarUrl} className="w-6 h-6 rounded-full border border-white/20 mt-0.5" />
            <div className="flex-1 min-w-0">
                <div>
                    <span className="font-bold text-sm text-white/90 mr-2">{comment.user.name}</span>
                    <span className="text-white text-sm">{comment.text}</span>
                </div>
                {reactions.length > 0 && (
                    <div className="flex gap-1 mt-0.5">
                        {reactions.map((r, i) => (
                            <span key={i} className={`text-[10px] px-1 rounded-full ${r.userReacted ? 'bg-primary/50 border border-primary text-white' : 'bg-white/10 text-white/80'}`}>
                                {r.emoji} {r.count}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            
            {showReactions && (
                <div className="absolute top-0 right-0 -mt-8 bg-black/80 rounded-full px-2 py-1 flex gap-2 backdrop-blur-md border border-white/10 shadow-lg z-10 animate-fade-in">
                    {REACTION_EMOJIS.map(emoji => (
                        <button 
                            key={emoji} 
                            onClick={(e) => { e.stopPropagation(); onReact(emoji); setShowReactions(false); }}
                            className="hover:scale-125 transition-transform text-lg"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const LiveStreamPage: React.FC<LiveStreamPageProps> = ({ stream, currentUser, onEndStream, onAddComment, onCommentReaction, onBack }) => {
  const isBroadcaster = stream.broadcaster.id === currentUser.id;
  const videoRef = useRef<HTMLVideoElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState('');
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Real-time Chat Simulation
  useEffect(() => {
    if (stream.status !== 'live') return;

    const phrases = [
        "Amazing!", "Hello from London", "Love this song", "🔥", "Can you show the view?", 
        "What time is it there?", "😍😍😍", "Cool!", "Sound is great", "Wow", "Incredible!",
        "Shoutout please!", "Is this live?", "Haha 😂"
    ];
    
    // Filter out current user from mock users for simulation
    const simulatedUsers = ALL_USERS.filter(u => u.id !== currentUser.id);

    const interval = setInterval(() => {
        // 40% chance to receive a comment every 2 seconds
        if (Math.random() > 0.6) {
            const randomUser = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
            const randomMsg = phrases[Math.floor(Math.random() * phrases.length)];
            if (randomUser) {
                onAddComment(stream.id, randomMsg, randomUser);
            }
        }
    }, 2000);

    return () => clearInterval(interval);
  }, [stream.status, stream.id, onAddComment, currentUser.id]);

  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    const videoElement = videoRef.current;

    if (isBroadcaster) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          mediaStream = stream;
          if (videoElement) {
            videoElement.srcObject = stream;
          }
        })
        .catch(err => {
            console.warn("Error accessing media devices, using fallback simulation.", err);
            setMediaError(null); 
            if (videoElement) {
                videoElement.srcObject = null;
                videoElement.src = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
                videoElement.loop = true;
                videoElement.muted = true;
                videoElement.play().catch(() => {});
            }
        });
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (videoElement) {
        videoElement.pause();
        if (videoElement.srcObject) {
           const stream = videoElement.srcObject as MediaStream;
           stream.getTracks().forEach(track => track.stop());
        }
        videoElement.srcObject = null;
      }
    };
  }, [isBroadcaster]);

  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [stream.comments]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onAddComment(stream.id, comment.trim());
      setComment('');
    }
  };

  const handleHeartClick = () => {
    const newHeart = { id: Date.now(), x: Math.random() * 20 - 10 }; 
    setHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2000); 
  };
  
  const handleVideoClick = () => {
    if (isBroadcaster) return;

    if (videoRef.current) {
      if (videoRef.current.paused) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                if (error.name !== 'AbortError') {
                    console.error("Livestream video play failed:", error);
                }
            });
        }
        if (!document.fullscreenElement && videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
          });
        }
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div ref={pageRef} className="w-full h-screen bg-black flex flex-col relative text-white overflow-hidden">
       <style>{`
          @keyframes float-up {
            to {
              transform: translateY(-200px) scale(1.2);
              opacity: 0;
            }
          }
          .heart-animation {
            animation: float-up 2s ease-out forwards;
          }
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
          }
        `}</style>

      {/* Video Background */}
      <video
        ref={videoRef}
        src={!isBroadcaster ? "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" : undefined}
        autoPlay
        muted={isBroadcaster}
        loop={!isBroadcaster}
        playsInline
        onClick={handleVideoClick}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {isBroadcaster && mediaError && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4 z-20">
            <h2 className="text-xl font-bold text-red-500">Streaming Error</h2>
            <p className="mt-2 text-white">{mediaError}</p>
            <button onClick={onBack} className="mt-6 bg-primary text-white font-bold py-2 px-6 rounded-full">
                Go Back
            </button>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50 pointer-events-none"></div>

      <header className="relative z-10 p-4 flex items-center gap-3 text-white">
        <img src={stream.broadcaster.avatarUrl} alt={stream.broadcaster.name} className="w-10 h-10 rounded-full flex-shrink-0 border border-white/20" />
        <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm leading-tight truncate">{stream.title}</h1>
                {stream.status === 'live' && <div className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">LIVE</div>}
            </div>
            <p className="text-xs text-white/80 truncate">{stream.broadcaster.name}</p>
        </div>
        <div className="flex items-center gap-2">
             <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold">
                <PeopleIcon className="w-3 h-3" />
                <span>{stream.viewers.toLocaleString()}</span>
            </div>
            <button 
                onClick={() => { if(isBroadcaster) onEndStream(stream.id); else onBack(); }} 
                className="bg-white/20 hover:bg-white/30 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold pointer-events-auto"
            >
                {/* Close Icon / End Icon */}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      </header>

      <div className="flex-1 relative z-10 flex flex-col justify-end p-4 pb-20 md:pb-4">
            <div ref={commentsContainerRef} className="space-y-2 max-h-[40vh] overflow-y-auto mask-image-b pointer-events-auto mb-4 scrollbar-hide">
                {stream.comments.length === 0 && (
                    <div className="text-white/50 text-sm italic">No comments yet. Say hello!</div>
                )}
                {stream.comments.map((comment) => (
                    <CommentItem 
                        key={comment.id} 
                        comment={comment} 
                        onReact={(emoji) => onCommentReaction(stream.id, comment.id, emoji)}
                    />
                ))}
            </div>

         {/* Floating Hearts */}
         <div className="absolute bottom-20 right-4 pointer-events-none">
            {hearts.map((heart) => (
                <div 
                    key={heart.id} 
                    className="absolute bottom-0 heart-animation text-2xl drop-shadow-md"
                    style={{ right: `${heart.x}px` }}
                >
                    ❤️
                </div>
            ))}
         </div>

         {/* Footer Controls */}
         <div className="flex items-center gap-3 pointer-events-auto">
            <form onSubmit={handleCommentSubmit} className="flex-1 relative">
                <input 
                    type="text" 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Say something..." 
                    className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-full py-2.5 pl-4 pr-10 text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all"
                />
                <button type="submit" disabled={!comment.trim()} className="absolute right-1 top-1 p-1.5 bg-white/10 rounded-full text-white hover:bg-white/20 disabled:opacity-50 transition-colors">
                    <SendIcon className="w-4 h-4" />
                </button>
            </form>
            <button onClick={handleHeartClick} className="bg-gradient-to-tr from-pink-500 to-red-500 p-2.5 rounded-full text-white shadow-lg active:scale-95 transition-transform">
                <LikeIcon className="w-6 h-6 fill-current" />
            </button>
         </div>
      </div>
    </div>
  );
};

export default LiveStreamPage;
