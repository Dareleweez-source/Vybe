import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { NewStoryData } from '../types';
import { SettingsIcon, CameraIcon, MusicIcon, TextColorIcon, FontIcon, RocketIcon } from '../constants';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleCreateStory: (storyData: NewStoryData, adData?: { isAd: boolean; ctaText: string; ctaLink: string }) => void;
}

const BACKGROUNDS = [
  'bg-gradient-to-br from-purple-400 to-indigo-600',
  'bg-gradient-to-br from-pink-500 to-orange-400',
  'bg-gradient-to-br from-green-400 to-blue-500',
  'bg-gray-800',
  'bg-rose-500',
  'bg-gradient-to-br from-teal-400 to-cyan-600',
];
const FONTS = [
  { name: 'Modern', class: 'font-sans' },
  { name: 'Classic', class: 'font-serif' },
  { name: 'Mono', class: 'font-mono' },
  { name: 'Cursive', class: '[font-family:cursive]' },
];
const TEXT_COLORS = ['text-white', 'text-black', 'text-yellow-300', 'text-pink-400'];

const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose, handleCreateStory }) => {
  const [view, setView] = useState<'menu' | 'editor'>('menu');
  
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [storyType, setStoryType] = useState<'image' | 'video' | 'text' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [text, setText] = useState('');
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [fontIndex, setFontIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  const [isAd, setIsAd] = useState(false);
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [showAdSettings, setShowAdSettings] = useState(false);

  const backgroundStyle = BACKGROUNDS[backgroundIndex];
  const fontStyle = FONTS[fontIndex].class;
  const textColor = TEXT_COLORS[colorIndex];

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const setupCamera = useCallback(async () => {
    stopCameraStream();
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Error accessing camera/mic, using fallback simulation:", err);
      setCameraError(null);
      if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = null;
          cameraVideoRef.current.src = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
          cameraVideoRef.current.loop = true;
          cameraVideoRef.current.muted = true;
          cameraVideoRef.current.play().catch(e => console.log(e));
      }
    }
  }, [stopCameraStream]);

  const resetState = useCallback(() => {
    setView('menu');
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
    setStoryType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setText('');
    setBackgroundIndex(0);
    setFontIndex(0);
    setColorIndex(0);
    stopCameraStream();
    setCameraError(null);
    setIsAd(false);
    setCtaText('');
    setCtaLink('');
    setShowAdSettings(false);
  }, [mediaPreview, stopCameraStream]);
  
  const handleClose = () => {
    setTimeout(resetState, 300);
    onClose();
  };

  useEffect(() => {
    let isMounted = true;
    if (isOpen && view === 'menu') {
      setTimeout(() => {
        setupCamera().then(() => {
          if (!isMounted) stopCameraStream();
        });
      }, 0);
    } else {
      stopCameraStream();
    }
    return () => {
      isMounted = false;
      stopCameraStream();
    };
  }, [isOpen, view, stopCameraStream, setupCamera]);


  const cycleBackground = () => setBackgroundIndex((prev) => (prev + 1) % BACKGROUNDS.length);
  const cycleFont = () => setFontIndex((prev) => (prev + 1) % FONTS.length);
  const cycleColor = () => setColorIndex((prev) => (prev + 1) % TEXT_COLORS.length);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;

      if (fileType) {
        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
        setStoryType(fileType);
        setView('editor');
      }
    }
  };
  
  const handleTextStoryClick = () => {
    setStoryType('text');
    setView('editor');
  };

  const handleSubmit = () => {
    const adData = isAd && ctaText.trim() && ctaLink.trim()
        ? { isAd, ctaText, ctaLink }
        : undefined;

    if ((storyType === 'image' || storyType === 'video') && mediaFile) {
      handleCreateStory({ type: 'media', file: mediaFile, fileType: storyType }, adData);
    } else if (storyType === 'text' && text.trim()) {
      handleCreateStory({ type: 'text', text: text.trim(), backgroundStyle, fontStyle, textColor }, adData);
    }
    handleClose();
  };
  
  const renderMenu = () => (
    <>
      <div className="p-4 border-b border-border dark:border-dark-border flex items-center justify-between">
        <button onClick={handleClose} className="text-on-surface dark:text-dark-on-surface text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover dark:hover:bg-dark-surface-hover" aria-label="Close">&times;</button>
        <h2 id="create-story-title" className="text-lg font-bold">New story</h2>
        <button className="text-on-surface dark:text-dark-on-surface w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover dark:hover:bg-dark-surface-hover" aria-label="Settings"><SettingsIcon className="w-6 h-6" /></button>
      </div>
       <div className="p-2 border-b border-border dark:border-dark-border flex items-center justify-around">
          <button onClick={handleTextStoryClick} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors">
            <span className="text-2xl font-serif">Aa</span>
            <span className="font-semibold text-xs">Text</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors">
            <MusicIcon className="w-6 h-6" />
            <span className="font-semibold text-xs">Music</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-surface-hover dark:hover:bg-dark-surface-hover transition-colors">
            <CameraIcon className="w-6 h-6" />
            <span className="font-semibold text-xs">Camera</span>
          </button>
      </div>
      <div className="flex-1 flex items-center justify-center bg-black overflow-hidden relative">
        <video ref={cameraVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        {cameraError && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4">
            <p className="text-white mb-4">{cameraError}</p>
            <button onClick={setupCamera} className="bg-primary text-white font-bold py-2 px-4 rounded-full hover:bg-primary-hover">Retry</button>
          </div>
        )}
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" hidden />
    </>
  );

  const renderEditor = () => (
    <>
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/40 to-transparent">
        <button onClick={handleClose} className="bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold hover:bg-black/70 transition-colors">&times;</button>
        <div className="flex items-center gap-2 md:gap-4">
          {storyType === 'text' && (
            <button onClick={cycleBackground} className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors" aria-label="Change background">
              <div className={`w-6 h-6 rounded-full border-2 border-white ${backgroundStyle}`} />
            </button>
          )}
          <button onClick={cycleFont} className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors" aria-label="Change font"><FontIcon className="w-6 h-6"/></button>
          <button onClick={cycleColor} className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors" aria-label="Change text color"><TextColorIcon className="w-6 h-6"/></button>
          <button onClick={() => setShowAdSettings(!showAdSettings)} className={`bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors ${showAdSettings ? 'bg-primary/50' : ''}`} aria-label="Ad settings">
            <RocketIcon className="w-6 h-6"/>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full h-full flex items-center justify-center relative overflow-hidden bg-black">
        {storyType === 'text' && <div className={`absolute inset-0 transition-all duration-300 ${backgroundStyle}`}></div>}
        {storyType === 'image' && mediaPreview && <img src={mediaPreview} alt="Story preview" className="w-full h-full object-contain" />}
        {storyType === 'video' && mediaPreview && <video src={mediaPreview} autoPlay loop muted playsInline className="w-full h-full object-contain" />}
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={storyType === 'text' ? "Start typing" : "Add a caption..."}
          className={`w-full max-w-full bg-transparent text-3xl font-bold text-center focus:outline-none resize-none p-4 z-10 transition-all duration-300 ${fontStyle} ${textColor} placeholder:text-white/80`}
          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
        />
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/40 to-transparent">
        {showAdSettings && (
            <div className="bg-black/50 p-4 rounded-lg mb-4 space-y-3 text-white">
                <div className="flex justify-between items-center">
                    <label htmlFor="is-ad-toggle" className="font-bold">Mark as Ad</label>
                    <button
                        id="is-ad-toggle"
                        onClick={() => setIsAd(!isAd)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${isAd ? 'bg-primary' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isAd ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                {isAd && (
                    <>
                        <input
                            type="text"
                            value={ctaText}
                            onChange={(e) => setCtaText(e.target.value)}
                            placeholder="Call to Action (e.g., Shop Now)"
                            className="w-full bg-black/30 border border-white/30 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                            type="url"
                            value={ctaLink}
                            onChange={(e) => setCtaLink(e.target.value)}
                            placeholder="Destination URL (https://...)"
                            className="w-full bg-black/30 border border-white/30 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </>
                )}
            </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={ (storyType === 'text' && !text.trim()) || (storyType !== 'text' && !mediaFile) || (isAd && (!ctaText.trim() || !ctaLink.trim())) }
          className="w-full bg-white text-black font-bold py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
        >
          Post to Story
        </button>
      </div>
    </>
  );

  const isEditor = view === 'editor';

  return (
    <div 
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={isEditor ? undefined : handleClose}
    >
      <div
        className={`bg-background dark:bg-dark-background transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'} 
                    absolute inset-0 flex flex-col md:rounded-2xl md:shadow-lg md:overflow-hidden 
                    ${isEditor ? '' : 'md:max-w-md md:max-h-[90vh] md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {isEditor ? renderEditor() : renderMenu()}
      </div>
    </div>
  );
};

export default CreateStoryModal;