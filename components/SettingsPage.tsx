import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ShieldIcon, 
  DisplayIcon, 
  WebsiteIcon, 
  ProfileIcon, 
  QrCodeIcon, 
  CreditCardIcon, 
  BackIcon,
  NotificationsIcon,
  BookmarkIcon,
  MonetizationIcon,
  LockIcon,
  ChevronRightIcon
} from '../constants';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
  openLanguageModal: () => void;
  openQrCodeModal: () => void;
  onBack: () => void;
  openThemeModal: () => void;
}

const SettingsSectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="px-4 pt-6 pb-2">
    <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

const SettingsRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  onClick: () => void;
  toggleValue?: boolean;
  onToggleChange?: (val: boolean) => void;
}> = ({ icon, title, subtitle, badge, onClick, toggleValue, onToggleChange }) => (
  <button
    onClick={() => {
      if (onToggleChange) {
        onToggleChange(!toggleValue);
      } else {
        onClick();
      }
    }}
    className="w-full text-left px-4 py-3.5 flex items-center gap-3.5 hover:bg-gray-100/70 dark:hover:bg-dark-surface rounded-xl transition-colors"
  >
    <div className="text-gray-700 dark:text-gray-300 flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{title}</h3>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{subtitle}</p>}
    </div>
    
    {onToggleChange !== undefined ? (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onToggleChange(!toggleValue);
        }}
        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${toggleValue ? 'bg-purple-600 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'}`}
      >
        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </div>
    ) : (
      <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
    )}
  </button>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate, openLanguageModal, openQrCodeModal, onBack, openThemeModal }) => {
  const { t } = useLanguage();
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [isPauseNotifications, setIsPauseNotifications] = useState(false);
  const [isHighQualityUploads, setIsHighQualityUploads] = useState(true);

  return (
    <div className="w-full pb-20 md:pb-6 min-h-screen bg-background dark:bg-dark-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 dark:bg-dark-background/95 backdrop-blur-md z-10 px-4 py-3 border-b border-border dark:border-dark-border flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors" aria-label="Back">
          <BackIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Settings and Activity</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-2">
        {/* Accounts Center Card */}
        <div className="mt-4 mx-2 p-4 rounded-2xl bg-gradient-to-r from-purple-900/10 via-pink-900/10 to-amber-900/10 border border-purple-500/20 dark:border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-sm text-purple-600 dark:text-purple-400">Accounts Center</h2>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Cascade Hub</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
            Manage your connected experiences, profile details, and account security across Cascade services.
          </p>
          <button 
            onClick={() => onNavigate('Profile')} 
            className="text-xs font-bold text-purple-600 dark:text-purple-300 hover:underline flex items-center gap-1"
          >
            Personal details & passwords <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Section 1: How you use Cascade */}
        <SettingsSectionHeader title="How you use Cascade" />
        <div className="space-y-0.5">
          <SettingsRow
            icon={<BookmarkIcon className="w-5 h-5" />}
            title="Saved"
            subtitle="Posts, photos and collections you bookmarked"
            onClick={() => onNavigate('Bookmarks')}
          />
          <SettingsRow
            icon={<NotificationsIcon className="w-5 h-5" />}
            title="Pause All Notifications"
            subtitle="Temporarily mute push notifications"
            toggleValue={isPauseNotifications}
            onToggleChange={setIsPauseNotifications}
            onClick={() => {}}
          />
          <SettingsRow
            icon={<NotificationsIcon className="w-5 h-5" />}
            title="Notification Preferences"
            subtitle="Posts, likes, comments, messages & live streams"
            onClick={() => onNavigate('Notifications')}
          />
        </div>

        {/* Section 2: Who can see your content */}
        <SettingsSectionHeader title="Who can see your content" />
        <div className="space-y-0.5">
          <SettingsRow
            icon={<LockIcon className="w-5 h-5" />}
            title="Private Account"
            subtitle="Only approved followers can view your media and stories"
            toggleValue={isPrivateAccount}
            onToggleChange={setIsPrivateAccount}
            onClick={() => {}}
          />
          <SettingsRow
            icon={<ShieldIcon className="w-5 h-5" />}
            title="Privacy & Security Settings"
            subtitle="Comment filters, tags, mentions and blocked accounts"
            onClick={() => onNavigate('Privacy')}
          />
        </div>

        {/* Section 3: Professional & Monetization */}
        <SettingsSectionHeader title="For Creators and Businesses" />
        <div className="space-y-0.5">
          <SettingsRow
            icon={<MonetizationIcon className="w-5 h-5" />}
            title="Monetization & Revenue"
            subtitle="Subscriptions, gifts and payouts dashboard"
            badge="Creator"
            onClick={() => onNavigate('Monetization')}
          />
          <SettingsRow
            icon={<CreditCardIcon className="w-5 h-5" />}
            title="Wallet & Orders"
            subtitle="Payment methods, creator tip earnings & history"
            onClick={() => onNavigate('Wallet')}
          />
        </div>

        {/* Section 4: App and Media */}
        <SettingsSectionHeader title="Your app and media" />
        <div className="space-y-0.5">
          <SettingsRow
            icon={<DisplayIcon className="w-5 h-5" />}
            title={t('settings_display')}
            subtitle="Switch appearance, Light mode or Dark mode"
            onClick={openThemeModal}
          />
          <SettingsRow
            icon={<WebsiteIcon className="w-5 h-5" />}
            title={t('settings_language')}
            subtitle="Change app language"
            onClick={openLanguageModal}
          />
          <SettingsRow
            icon={<QrCodeIcon className="w-5 h-5" />}
            title="QR Code & Share Profile"
            subtitle="Generate your profile badge for sharing"
            onClick={openQrCodeModal}
          />
          <SettingsRow
            icon={<ProfileIcon className="w-5 h-5" />}
            title="Media Quality"
            subtitle="Upload photos and videos in highest resolution"
            toggleValue={isHighQualityUploads}
            onToggleChange={setIsHighQualityUploads}
            onClick={() => {}}
          />
        </div>

        {/* Log out section */}
        <div className="mt-8 mb-12 px-4">
          <button
            onClick={() => onNavigate('Home')}
            className="w-full py-3 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            Log Out
          </button>
          <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-4">
            Cascade v2.4.0 &bull; Built with Instagram-style design principles
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;