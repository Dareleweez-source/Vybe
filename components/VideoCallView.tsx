
import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';
import { MicrophoneIcon, MutedMicrophoneIcon, CameraIcon, CameraOffIcon, AudioCallIcon } from '../constants';

interface VideoCallViewProps {
  partner: User;
  onEndCall: () => void;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const VideoCallView: React.FC<VideoCallViewProps> = ({ partner, onEndCall }) => {
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null); // For partner's video
    const [mediaError, setMediaError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
        
        let stream: MediaStream | null = null;
        
        const setupMedia = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                // In a real app, you would use WebRTC to send this stream and receive the remote stream.
                // For now, we'll just show the local stream.
            } catch (err) {
                console.warn("Video call media access failed, using fallback simulation:", err);
                setMediaError("Could not access camera/microphone.");
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = null;
                    localVideoRef.current.src = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
                    localVideoRef.current.loop = true;
                    localVideoRef.current.muted = true;
                    localVideoRef.current.play().catch(e => console.log("Autoplay prevented", e));
                }
                // Use a different video for remote to simulate a partner
                if (remoteVideoRef.current) {
                     remoteVideoRef.current.srcObject = null;
                     remoteVideoRef.current.src = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
                     remoteVideoRef.current.loop = true;
                     remoteVideoRef.current.muted = true; // Mute remote for demo to avoid noise
                     remoteVideoRef.current.play().catch(e => console.log("Autoplay prevented", e));
                }
            }
        };

        setupMedia();
        
        return () => {
            clearInterval(timer);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const toggleMute = () => {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
        }
        setIsMuted(prev => !prev);
    };

    const toggleCamera = () => {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
        }
        setIsCameraOff(prev => !prev);
    };
    
    return (
        <div className="absolute inset-0 bg-black z-50 text-white flex flex-col">
            {/* Remote video (full screen) */}
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            
            {/* Local video (picture-in-picture) */}
            <video ref={localVideoRef} autoPlay playsInline muted className="absolute top-4 right-4 w-1/4 max-w-[150px] rounded-lg border-2 border-white z-10 bg-gray-900" />

            <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/50 via-transparent to-black/50">
                {/* Header info */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold">{partner.name}</h2>
                    <p className="text-lg text-gray-300">{formatTime(callDuration)}</p>
                </div>
                
                {mediaError && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-center p-4"><p className="text-red-400">{mediaError}</p></div>}

                {/* Controls */}
                <div className="flex justify-center items-center gap-6">
                    <button onClick={toggleMute} className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-white text-black' : 'bg-white/20'}`}>
                        {isMuted ? <MutedMicrophoneIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
                    </button>
                    <button onClick={toggleCamera} className={`p-4 rounded-full transition-colors ${isCameraOff ? 'bg-white text-black' : 'bg-white/20'}`}>
                        {isCameraOff ? <CameraOffIcon className="w-6 h-6" /> : <CameraIcon className="w-6 h-6" />}
                    </button>
                    <button onClick={onEndCall} className="p-4 bg-red-500 rounded-full">
                        <AudioCallIcon className="w-6 h-6 transform rotate-[135deg]" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCallView;
