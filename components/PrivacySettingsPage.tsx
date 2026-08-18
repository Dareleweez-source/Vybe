
import React, { useState, useRef, useEffect } from 'react';
import type { User, MessagingSettings } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { BackIcon } from '../constants';

interface PrivacySettingsPageProps {
  currentUser: User;
  onUpdateSettings: (settings: MessagingSettings) => void;
  onBack?: () => void;
}

const ToggleSwitch: React.FC<{
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ label, enabled, onChange }) => (
  <div className="flex justify-between items-center bg-background p-4 rounded-lg border border-gray-200">
    <h4 className="font-semibold">{label}</h4>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${enabled ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const RadioButton: React.FC<{
    id: string;
    name: string;
    label: string;
    value: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ id, name, label, value, checked, onChange }) => (
    <label htmlFor={id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
        <span className="font-semibold">{label}</span>
        <input type="radio" id={id} name={name} value={value} checked={checked} onChange={onChange} className="w-5 h-5 text-primary focus:ring-primary focus:ring-2" />
    </label>
);


const PrivacySettingsPage: React.FC<PrivacySettingsPageProps> = ({ currentUser, onUpdateSettings, onBack }) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  // FIX: Explicitly typed the ref with `<number>` to ensure its `current` property is a number.
  const lastScrollY = useRef<number>(0);
  const { t } = useLanguage();

  const defaultSettings: MessagingSettings = {
    allowDmsFrom: 'everyone',
    allowAudioCalls: true,
    allowVideoCalls: true,
  };

  const [settings, setSettings] = useState<MessagingSettings>(
    currentUser.messagingSettings || defaultSettings
  );

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
  
  const handleSettingChange = (updatedSettings: Partial<MessagingSettings>) => {
    const newSettings = { ...settings, ...updatedSettings };
    setSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  return (
    <div className="w-full pb-16 md:pb-0">
      <div className={`sticky top-0 bg-background/80 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-200 transition-transform duration-300 flex items-center gap-4 ${!isHeaderVisible ? '-translate-y-full' : ''}`}>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-on-surface dark:text-dark-on-surface">
            <BackIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{t('privacy_title')}</h1>
          <p className="text-sm text-on-surface-secondary">{t('privacy_description')}</p>
        </div>
      </div>

      <div className="p-4 space-y-8">
        <section>
          <h2 className="text-lg font-bold mb-1">{t('privacy_dms_title')}</h2>
          <p className="text-sm text-on-surface-secondary mb-4">{t('privacy_dms_description')}</p>
          <div className="space-y-3">
              <RadioButton 
                id="dms-everyone" name="dms" label={t('privacy_dms_everyone')} value="everyone"
                checked={settings.allowDmsFrom === 'everyone'}
                onChange={(e) => handleSettingChange({ allowDmsFrom: e.target.value as any })}
              />
               <RadioButton 
                id="dms-following" name="dms" label={t('privacy_dms_following')} value="following"
                checked={settings.allowDmsFrom === 'following'}
                onChange={(e) => handleSettingChange({ allowDmsFrom: e.target.value as any })}
              />
               <RadioButton 
                id="dms-none" name="dms" label={t('privacy_dms_none')} value="none"
                checked={settings.allowDmsFrom === 'none'}
                onChange={(e) => handleSettingChange({ allowDmsFrom: e.target.value as any })}
              />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-1">{t('privacy_calls_title')}</h2>
          <p className="text-sm text-on-surface-secondary mb-4">{t('privacy_calls_description')}</p>
           <div className="space-y-4">
            <ToggleSwitch
              label={t('privacy_allow_audio')}
              enabled={settings.allowAudioCalls}
              onChange={(value) => handleSettingChange({ allowAudioCalls: value })}
            />
            <ToggleSwitch
              label={t('privacy_allow_video')}
              enabled={settings.allowVideoCalls}
              onChange={(value) => handleSettingChange({ allowVideoCalls: value })}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacySettingsPage;
