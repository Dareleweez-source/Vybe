import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, VolumeUpIcon, VolumeOffIcon, FullscreenIcon } from '../constants';

interface VideoPlayerProps {
    src: string;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    className?: string;
    onToggleFullscreen?: () => void;
    onClick?: (e: React.MouseEvent) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
    src, 
    autoPlay = false, 
    muted = true, 
    loop = true, 
    className = "",
    onToggleFullscreen,
    onClick
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(muted);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (autoPlay && videoRef.current) {
            videoRef.current.play().catch(() => setIsPlaying(false));
        }
    }, [autoPlay, src]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            if (videoRef.current.duration > 0) {
                setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const togglePlay = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play().catch(() => {});
                setIsPlaying(true);
            }
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (videoRef.current && duration > 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            videoRef.current.currentTime = pos * duration;
        }
    };

    const handleToggleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggleFullscreen) {
            onToggleFullscreen();
        } else if (videoRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                videoRef.current.requestFullscreen();
            }
        }
    };

    const handleVideoClick = (e: React.MouseEvent) => {
        if (onClick) {
            onClick(e);
        } else {
            togglePlay(e);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            window.clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = window.setTimeout(() => {
                setShowControls(false);
            }, 2500);
        }
    };

    const handleMouseLeave = () => {
        if (isPlaying) {
            setShowControls(false);
        }
    };

    return (
        <div 
            className={`relative group flex items-center justify-center overflow-hidden ${className}`} 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleVideoClick}
        >
            <video
                ref={videoRef}
                src={src}
                loop={loop}
                playsInline
                muted={isMuted}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setIsPlaying(false)}
            />
            
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                    <div className="bg-black/40 p-3 rounded-full backdrop-blur-sm">
                        <PlayIcon className="w-8 h-8 text-white fill-current" />
                    </div>
                </div>
            )}
            
            <div 
                className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20 flex flex-col gap-2 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative w-full h-1.5 bg-white/30 rounded-full cursor-pointer group/progress" onClick={handleSeek}>
                    <div className="absolute top-0 left-0 h-full bg-primary rounded-full pointer-events-none" style={{ width: `${progress}%` }}></div>
                    <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-sm pointer-events-none" style={{ left: `${progress}%` }}></div>
                </div>
                
                <div className="flex items-center justify-between text-white mt-1">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="hover:text-primary transition-colors">
                            {isPlaying ? <PauseIcon className="w-6 h-6 fill-current" /> : <PlayIcon className="w-6 h-6 fill-current" />}
                        </button>
                        <span className="text-xs font-medium tabular-nums drop-shadow-md">
                            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button onClick={toggleMute} className="hover:text-primary transition-colors">
                            {isMuted ? <VolumeOffIcon className="w-6 h-6" /> : <VolumeUpIcon className="w-6 h-6" />}
                        </button>
                        {onToggleFullscreen || !onToggleFullscreen ? (
                            <button onClick={handleToggleFullscreen} className="hover:text-primary transition-colors" title="Full Screen">
                                <FullscreenIcon className="w-5 h-5" />
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
