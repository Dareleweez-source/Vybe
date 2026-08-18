
import React, { useState, useEffect } from 'react';
import type { AdCampaign, PromotionType, AdCampaignCta, User, Post, Product } from '../types';
import { ProfileIcon, ShopIcon, TagIcon, RocketIcon, WebsiteIcon } from '../constants';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (campaign: Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'spent' | 'ownerId'>) => void;
  currentUser: User;
  userPosts: Post[];
  userProducts: Product[];
  postToPromote?: Post | null;
}

const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const InputField: React.FC<{label: string, children: React.ReactNode, description?: string}> = ({label, children, description}) => (
    <div>
        <label className="block text-sm font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary mb-1">{label}</label>
        {children}
        {description && <p className="text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary mt-1">{description}</p>}
    </div>
);

const ObjectiveCard: React.FC<{icon: React.ReactNode, title: string, description: string, onClick: () => void}> = ({ icon, title, description, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:bg-surface dark:hover:bg-dark-surface-hover hover:border-primary transition-colors duration-200 flex items-start gap-4">
        <div className="text-primary bg-primary/10 p-3 rounded-lg">{icon}</div>
        <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">{description}</p>
        </div>
    </button>
);


const CreateAdModal: React.FC<CreateAdModalProps> = ({ isOpen, onClose, onCreate, currentUser, userPosts, userProducts, postToPromote }) => {
  const [step, setStep] = useState(1);
  const [promotionType, setPromotionType] = useState<PromotionType | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [, _setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaDataUrl, setMediaDataUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [ctaText, setCtaText] = useState<AdCampaignCta>('Learn More');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [budget, setBudget] = useState(50);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (postToPromote) {
        setTimeout(() => {
          setStep(3);
          setPromotionType('post');
          setSelectedPostId(postToPromote.id);
          setName(`Boost for post: "${postToPromote.content.substring(0, 20)}..."`);
        }, 0);
      } else {
        // Reset to default state for a new campaign
        setTimeout(() => {
          setStep(1);
          setPromotionType(null);
          setSelectedPostId(null);
          setName('');
          setContent('');
          _setMediaFile(null);
          setMediaPreview(null);
          setMediaDataUrl(null);
          setMediaType(null);
          setCtaText('Learn More');
          setDestinationUrl('');
          setBudget(50);
          setStartDate(new Date().toISOString().split('T')[0]);
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          setEndDate(nextWeek.toISOString().split('T')[0]);
          setSelectedProductId(null);
        }, 0);
      }
    }
  }, [isOpen, postToPromote]);
  
  if (!isOpen) return null;
  
  const adBalance = currentUser.adBalance || 0;
  const formattedBalance = (() => {
    try {
      return new Intl.NumberFormat(currentUser.locale || 'en-US', {
        style: 'currency',
        currency: currentUser.currency || 'USD',
      }).format(adBalance);
    } catch (e) {
      console.warn("Could not format currency, using fallback.", e);
      return `$${adBalance.toFixed(2)}`;
    }
  })();
  
  const isBudgetInvalid = budget > adBalance || budget < 10;

  const handleObjectiveSelect = (type: PromotionType) => {
    setPromotionType(type);
    setName(getInitialCampaignName(type));
    
    // Skip content selection if not needed
    if (type === 'post' || type === 'product') {
        setStep(2);
    } else {
        setStep(3);
    }
  };

  const getInitialCampaignName = (type: PromotionType): string => {
    switch(type) {
        case 'account': return `Promote ${currentUser.name}'s Profile`;
        case 'store': return `Drive traffic to ${currentUser.name}'s Store`;
        case 'post': return 'Boosted Post Campaign';
        case 'product': return 'Product Promotion Campaign';
        case 'website': return 'Website Traffic Campaign';
        case 'app': return 'App Install Campaign';
        default: return '';
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
      if (type) {
        _setMediaFile(file);
        setMediaType(type);
        setMediaPreview(URL.createObjectURL(file));
        const dataUrl = await fileToDataURL(file);
        setMediaDataUrl(dataUrl);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotionType || isBudgetInvalid) return;
    
    const baseCampaign = {
        name, budget,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
    };

    let finalCampaign: Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'spent' | 'ownerId'> | null = null;
    
    switch(promotionType) {
        case 'account':
            finalCampaign = {...baseCampaign, promotionType, ctaText: 'View Profile', destinationUrl: '#'};
            break;
        case 'store':
             finalCampaign = {...baseCampaign, promotionType, ctaText: 'View Shop', destinationUrl: '#'};
            break;
        case 'post':
            if (selectedPostId) {
                finalCampaign = {
                    ...baseCampaign,
                    promotionType,
                    promotedPostId: selectedPostId,
                    ctaText: 'View Post',
                    destinationUrl: '#'
                };
            }
            break;
        case 'product':
            if (selectedProductId) {
                finalCampaign = {...baseCampaign, promotionType, promotedProductId: selectedProductId, ctaText: 'Shop Now', destinationUrl: '#'};
            }
            break;
        case 'website':
        case 'app':
            if (content && mediaDataUrl && mediaType && destinationUrl) {
                finalCampaign = {...baseCampaign, promotionType, content, mediaUrl: mediaDataUrl, mediaType, ctaText, destinationUrl };
            }
            break;
    }

    if (finalCampaign) {
        onCreate(finalCampaign);
    } else {
        alert('Please complete all required fields for this campaign type.');
    }
  };
  
  const renderObjectiveSelection = () => (
    <div className="p-6 space-y-4">
        <ObjectiveCard icon={<ProfileIcon className="w-6 h-6"/>} title="Get More Followers" description="Promote your account to a wider audience." onClick={() => handleObjectiveSelect('account')} />
        <ObjectiveCard icon={<RocketIcon className="w-6 h-6"/>} title="Boost a Post" description="Increase the reach of one of your existing posts." onClick={() => handleObjectiveSelect('post')} />
        <ObjectiveCard icon={<ShopIcon className="w-6 h-6"/>} title="Promote Your Store" description="Drive traffic to your Chirp store." onClick={() => handleObjectiveSelect('store')} />
        <ObjectiveCard icon={<TagIcon className="w-6 h-6"/>} title="Feature a Product" description="Showcase a specific product from your store." onClick={() => handleObjectiveSelect('product')} />
        <ObjectiveCard icon={<WebsiteIcon className="w-6 h-6"/>} title="Get Website/App Traffic" description="Send users to an external website or app store." onClick={() => handleObjectiveSelect('website')} />
    </div>
  );
  
  const renderContentSelection = () => {
    if (promotionType === 'post') {
        return (
            <div className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Select a Post to Boost</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userPosts.map(post => (
                        <button key={post.id} onClick={() => setSelectedPostId(post.id)} className={`w-full text-left p-3 border-2 rounded-lg ${selectedPostId === post.id ? 'border-primary' : 'border-gray-200 dark:border-dark-border'}`}>
                            <p className="line-clamp-2">{post.content}</p>
                            <p className="text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary mt-1">{new Date(post.timestamp).toLocaleDateString()}</p>
                        </button>
                    ))}
                </div>
                <button onClick={() => setStep(3)} disabled={!selectedPostId} className="w-full bg-primary text-white font-bold py-2 rounded-full disabled:opacity-50">Next</button>
            </div>
        )
    }
     if (promotionType === 'product') {
        return (
             <div className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Select a Product to Feature</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userProducts.map(product => (
                        <button key={product.id} onClick={() => setSelectedProductId(product.id)} className={`w-full text-left p-3 border-2 rounded-lg flex items-center gap-3 ${selectedProductId === product.id ? 'border-primary' : 'border-gray-200 dark:border-dark-border'}`}>
                           <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover" />
                           <div>
                             <p className="font-semibold">{product.name}</p>
                             <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">${product.price.toFixed(2)}</p>
                           </div>
                        </button>
                    ))}
                </div>
                <button onClick={() => setStep(3)} disabled={!selectedProductId} className="w-full bg-primary text-white font-bold py-2 rounded-full disabled:opacity-50">Next</button>
            </div>
        )
    }
    return null;
  }
  
  const renderDetailsForm = () => (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <InputField label="Campaign Name"><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md p-2" required /></InputField>

        {['website', 'app'].includes(promotionType!) && (
            <>
                <InputField label="Ad Content"><textarea value={content} onChange={e => setContent(e.target.value)} className="w-full bg-surface dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md p-2" rows={3} required /></InputField>
                <InputField label="Media (Image/Video)"><input type="file" onChange={handleFileChange} accept="image/*,video/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" required /></InputField>
                {mediaPreview && (
                    <div className="mt-2">{mediaType === 'image' ? <img src={mediaPreview} alt="media preview" className="rounded-lg max-h-48" /> : <video src={mediaPreview} controls className="rounded-lg max-h-48" />}</div>
                )}
                 <InputField label="Call to Action"><select value={ctaText} onChange={e => setCtaText(e.target.value as any)} className="w-full bg-surface dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md p-2"><option>Learn More</option><option>Shop Now</option><option>Sign Up</option><option>Visit Website</option><option>Install</option></select></InputField>
                <InputField label="Destination URL"><input type="url" placeholder="https://example.com" value={destinationUrl} onChange={e => setDestinationUrl(e.target.value)} className="w-full bg-surface dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md p-2" required /></InputField>
            </>
        )}
        
        <InputField label="Total Budget" description={`Your current balance is ${formattedBalance}.`}>
            <div className="relative">
                 <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-secondary dark:text-dark-on-surface-secondary">{currentUser.currency || '$'}</span>
                <input type="number" min="10" value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full bg-surface dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md p-2 pl-12" />
            </div>
        </InputField>
        {budget > adBalance && (
            <p className="text-sm text-red-600">Your budget cannot exceed your available ad balance.</p>
        )}
        {budget < 10 && (
            <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">Minimum budget is 10 {currentUser.currency || 'USD'}.</p>
        )}
        <div className="grid grid-cols-2 gap-4">
            <InputField label="Start Date"><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-surface dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md p-2" /></InputField>
            <InputField label="End Date"><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-surface dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md p-2" /></InputField>
        </div>
        <button type="submit" disabled={isBudgetInvalid} className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">Launch Campaign</button>
    </form>
  );

  const renderStep = () => {
    switch(step) {
        case 1: return renderObjectiveSelection();
        case 2: return renderContentSelection();
        case 3: return renderDetailsForm();
        default: return null;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background dark:bg-dark-background rounded-2xl w-full max-w-lg shadow-lg flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center relative justify-center">
            <h2 id="create-ad-title" className="text-xl font-bold text-center">
                {postToPromote ? 'Boost Post' : step === 1 ? 'Choose your objective' : 'Create Campaign'}
            </h2>
            <button onClick={onClose} className="absolute right-4 text-on-surface dark:text-dark-on-surface font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1">
            {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default CreateAdModal;
