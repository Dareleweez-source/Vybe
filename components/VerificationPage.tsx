
import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import { VerifiedIcon, CameraIcon, BackIcon } from '../constants';

interface VerificationPageProps {
  currentUser: User;
  handleVerificationRequestSubmit: () => void;
  handleVerificationPayment: () => void;
  handleResubmitVerification: () => void;
  onBack?: () => void;
}

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
};

const VerificationPage: React.FC<VerificationPageProps> = ({ currentUser, handleVerificationRequestSubmit, handleVerificationPayment, handleResubmitVerification, onBack }) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef<number>(0);
  const [step, setStep] = useState(1);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [idType, setIdType] = useState('passport');
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);
  const idPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdPhoto(file);
      const dataUrl = await fileToDataURL(file);
      setIdPhotoPreview(dataUrl);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim() && idPhoto) {
        handleVerificationRequestSubmit();
    }
  };
  
  const handleResubmit = () => {
    handleResubmitVerification();
    setStep(1);
    setFullName('');
    setIdType('passport');
    setIdPhoto(null);
    setIdPhotoPreview(null);
  };
  
  const renderNoneState = () => {
      if (step === 1) { // Intro Step
          return (
              <div className="bg-surface dark:bg-dark-surface rounded-2xl p-6 text-center">
                  <VerifiedIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">Get Your Verification Badge</h2>
                  <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-2 mb-6 max-w-md mx-auto">Confirm your identity to get the blue badge and let everyone know your account is authentic.</p>
                  <ul className="text-left space-y-2 max-w-sm mx-auto mb-8">
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">✓</span> Authenticate your identity.</li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">✓</span> Build trust with your audience.</li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">✓</span> Unlock access to future creator tools.</li>
                  </ul>
                  <button onClick={() => setStep(2)} className="w-full max-w-sm mx-auto bg-primary text-white font-bold py-3 rounded-full hover:bg-primary-hover transition-colors">
                      Get Started
                  </button>
              </div>
          );
      }
      if (step === 2) { // Form Step
          return (
            <div className="bg-surface dark:bg-dark-surface rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-2">Submit Your Information</h2>
                <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mb-6">This information is used for verification purposes only and is handled securely.</p>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="full-name" className="block text-sm font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary mb-1">Full Legal Name</label>
                        <input type="text" id="full-name" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full bg-background dark:bg-dark-background border border-gray-300 dark:border-dark-border rounded-md p-2 focus:ring-primary focus:border-primary" />
                    </div>
                     <div>
                        <label htmlFor="id-type" className="block text-sm font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary mb-1">Type of ID</label>
                        <select id="id-type" value={idType} onChange={e => setIdType(e.target.value)} className="w-full bg-background dark:bg-dark-background border border-gray-300 dark:border-dark-border rounded-md p-2 focus:ring-primary focus:border-primary">
                            <option value="passport">Passport</option>
                            <option value="drivers-license">Driver's License</option>
                            <option value="national-id">National ID Card</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary mb-1">Photo of ID</label>
                        <div onClick={() => idPhotoInputRef.current?.click()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-dark-border border-dashed rounded-md cursor-pointer hover:border-primary">
                            <div className="space-y-1 text-center">
                                {idPhotoPreview ? (
                                    <img src={idPhotoPreview} alt="ID preview" className="mx-auto h-24 w-auto rounded-md" />
                                ) : (
                                    <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                                )}
                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                    <span className="relative rounded-md font-medium text-primary hover:text-primary/80">
                                        <span>{idPhoto ? 'Change file' : 'Upload a file'}</span>
                                        <input ref={idPhotoInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                    </div>
                    <button type="submit" disabled={!fullName.trim() || !idPhoto} className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary-hover disabled:opacity-50 transition-colors">
                        Submit for Review
                    </button>
                </form>
            </div>
          );
      }
      return null;
  }
  
  const renderContent = () => {
    switch(currentUser.verificationStatus) {
      case 'verified':
        return (
          <div className="text-center p-8 bg-surface dark:bg-dark-surface rounded-2xl">
            <VerifiedIcon className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold">You're Verified!</h2>
            <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-2">Your account has the verified badge, which is now visible next to your name.</p>
          </div>
        );
      case 'pending_review':
        return (
          <div className="text-center p-8 bg-surface dark:bg-dark-surface rounded-2xl">
            <svg className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <h2 className="text-2xl font-bold">Submission Received</h2>
            <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-2">Your verification request is under review. This process typically takes 2-3 business days. We'll notify you when the review is complete.</p>
          </div>
        );
      case 'pending_payment':
         return (
          <div className="bg-surface dark:bg-dark-surface rounded-2xl p-6 text-center">
            <h2 className="text-2xl font-bold">Complete Your Verification</h2>
            <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-2 mb-8 max-w-md mx-auto">Your information has been approved! Complete the payment to receive your verification badge.</p>
            <div className="space-y-4 max-w-sm mx-auto">
                <button onClick={() => handleVerificationPayment()} className="w-full text-left p-4 border-2 border-gray-300 dark:border-dark-border rounded-lg hover:border-primary transition-colors">
                    <p className="font-bold text-lg">Monthly</p>
                    <p className="text-2xl font-extrabold">$3<span className="text-base font-normal text-on-surface-secondary dark:text-dark-on-surface-secondary">/month</span></p>
                </button>
                 <div className="relative">
                     <button onClick={() => handleVerificationPayment()} className="w-full text-left p-4 border-2 border-primary rounded-lg">
                        <p className="font-bold text-lg">Yearly</p>
                        <p className="text-2xl font-extrabold">$35<span className="text-base font-normal text-on-surface-secondary dark:text-dark-on-surface-secondary">/year</span></p>
                    </button>
                    <div className="absolute -top-3 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</div>
                 </div>
            </div>
          </div>
        );
      case 'rejected':
         return (
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-200">Verification Not Approved</h2>
            <p className="text-red-700 dark:text-red-300 mt-2 mb-4">
                <strong>Reason:</strong> {currentUser.rejectionReason || 'There was an issue with your submission.'}
            </p>
            <button onClick={handleResubmit} className="w-full max-w-sm mx-auto bg-primary text-white font-bold py-3 rounded-full hover:bg-primary-hover transition-colors">
                Resubmit Application
            </button>
          </div>
        );
      case 'none':
      default:
        return renderNoneState();
    }
  };

  return (
    <div className="w-full pb-16 md:pb-0">
      <div className={`sticky top-0 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-200 dark:border-dark-border transition-transform duration-300 flex items-center gap-4 ${!isHeaderVisible ? '-translate-y-full' : ''}`}>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
            <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Verification</h1>
      </div>
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default VerificationPage;
