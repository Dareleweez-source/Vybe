import React, { useState } from 'react';
import { Community, Report, User, ReportStatus, Post } from '../types';
import { ShieldIcon, BanIcon, CheckIcon, XIcon, AlertIcon } from '../constants';

interface ModerationDashboardProps {
  community: Community;
  allUsers: User[];
  posts: Post[];
  currentUser: User;
  onUpdateCommunity: (updatedCommunity: Community) => void;
  onBanUser: (userId: string, reason: string) => void;
  onUnbanUser: (userId: string) => void;
  onResolveReport: (reportId: string, resolution: ReportStatus) => void;
  onApprovePost: (postId: string, communityId?: string) => void;
  onRejectPost: (postId: string, communityId?: string) => void;
}

const ModerationDashboard: React.FC<ModerationDashboardProps> = ({
  community,
  allUsers,
  posts,
  currentUser,
  onUpdateCommunity,
  onBanUser,
  onUnbanUser,
  onResolveReport,
  onApprovePost,
  onRejectPost,
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'banned' | 'settings' | 'pending' | 'members' | 'audit'>('reports');
  const [filterWords, setFilterWords] = useState(community.moderationSettings?.autoFilterWords.join(', ') || '');
  const [autoBanReportCount, setAutoBanReportCount] = useState<number | ''>(community.moderationSettings?.autoBanReportCount || '');
  const [communityRules, setCommunityRules] = useState(community.rules?.join('\n') || '');

  const logAction = (action: any, targetId?: string, reason?: string) => {
    const newLog = {
      id: crypto.randomUUID(),
      action,
      moderatorId: currentUser.id,
      targetId,
      reason,
      timestamp: new Date().toISOString()
    };
    return [...(community.auditLogs || []), newLog];
  };

  const handleSaveSettings = () => {
    const newWords = filterWords.split(',').map(w => w.trim()).filter(w => w.length > 0);
    const newRules = communityRules.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    const updatedCommunity = {
      ...community,
      rules: newRules,
      moderationSettings: {
        ...community.moderationSettings!,
        autoFilterWords: newWords,
        autoBanReportCount: autoBanReportCount === '' ? undefined : Number(autoBanReportCount)
      },
      auditLogs: logAction('update_settings')
    };
    onUpdateCommunity(updatedCommunity);
  };

  const handlePromoteModerator = (userId: string) => {
    const updatedCommunity = {
      ...community,
      moderatorIds: [...(community.moderatorIds || []), userId],
      auditLogs: logAction('promote_moderator', userId)
    };
    onUpdateCommunity(updatedCommunity);
  };

  const handleDemoteModerator = (userId: string) => {
    const updatedCommunity = {
      ...community,
      moderatorIds: (community.moderatorIds || []).filter(id => id !== userId),
      auditLogs: logAction('demote_moderator', userId)
    };
    onUpdateCommunity(updatedCommunity);
  };

  const members = allUsers.filter(u => u.joinedCommunityIds?.includes(community.id));

  const getReporterName = (reporterId: string) => {
    const user = allUsers.find(u => u.id === reporterId);
    return user ? user.name : 'Unknown User';
  };

  const getReportedItemName = (report: Report) => {
    if (report.reportedType === 'user') {
      const user = allUsers.find(u => u.id === report.reportedId);
      return user ? user.name : 'Unknown User';
    }
    return `${report.reportedType} #${report.reportedId.substring(0, 8)}`;
  };

  return (
    <div className="bg-background dark:bg-dark-surface rounded-2xl border border-border dark:border-dark-border overflow-hidden">
      <div className="p-4 border-b border-border dark:border-dark-border flex items-center gap-2 bg-surface dark:bg-dark-surface-hover">
        <ShieldIcon className="w-6 h-6 text-primary" />
        <h2 className="text-lg font-bold">Moderation Dashboard</h2>
      </div>

      <div className="flex border-b border-border dark:border-dark-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'reports'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-on-surface-secondary hover:text-on-surface hover:bg-surface-hover dark:hover:bg-dark-surface-hover'
          }`}
        >
          Reports ({community.reports?.filter(r => r.status === 'pending').length || 0})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'pending'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-on-surface-secondary hover:text-on-surface hover:bg-surface-hover dark:hover:bg-dark-surface-hover'
          }`}
        >
          Pending ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('banned')}
          className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'banned'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-on-surface-secondary hover:text-on-surface hover:bg-surface-hover dark:hover:bg-dark-surface-hover'
          }`}
        >
          Banned ({community.bannedUsers?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'members'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-on-surface-secondary hover:text-on-surface hover:bg-surface-hover dark:hover:bg-dark-surface-hover'
          }`}
        >
          Members ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-on-surface-secondary hover:text-on-surface hover:bg-surface-hover dark:hover:bg-dark-surface-hover'
          }`}
        >
          Audit Log
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'settings'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-on-surface-secondary hover:text-on-surface hover:bg-surface-hover dark:hover:bg-dark-surface-hover'
          }`}
        >
          Settings
        </button>
      </div>

      <div className="p-4 min-h-[300px]">
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {community.reports?.length === 0 ? (
              <div className="text-center py-10 text-on-surface-secondary">
                <CheckIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No reports found. Good job!</p>
              </div>
            ) : (
              community.reports?.map((report) => (
                <div key={report.id} className="border border-border dark:border-dark-border rounded-xl p-4 bg-surface dark:bg-dark-background">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase mb-1 ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status}
                      </span>
                      <h3 className="font-bold text-sm">
                        Reported {report.reportedType}: {getReportedItemName(report)}
                      </h3>
                      <p className="text-xs text-on-surface-secondary">
                        Reported by {getReporterName(report.reporterId)} • {new Date(report.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onResolveReport(report.id, 'dismissed')}
                          className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                          title="Dismiss"
                        >
                          <XIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onResolveReport(report.id, 'resolved')}
                          className="p-1.5 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600"
                          title="Resolve (Take Action)"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="bg-background dark:bg-dark-surface-hover p-3 rounded-lg text-sm">
                    <p className="font-semibold text-red-500 mb-1 flex items-center gap-1">
                      <AlertIcon className="w-4 h-4" />
                      Reason: {report.reason}
                    </p>
                    {report.description && <p className="italic">"{report.description}"</p>}
                  </div>
                  {report.status === 'pending' && report.reportedType === 'user' && (
                     <button
                        onClick={() => onBanUser(report.reportedId, report.reason)}
                        className="mt-3 text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                     >
                        <BanIcon className="w-3 h-3" />
                        Ban User
                     </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'pending' && (
            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center py-10 text-on-surface-secondary">
                        <CheckIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No pending posts.</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="border border-border dark:border-dark-border rounded-xl p-4 bg-surface dark:bg-dark-background">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                        <img src={post.user.avatarUrl} alt={post.user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{post.user.name}</p>
                                        <p className="text-xs text-on-surface-secondary">{new Date(post.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onRejectPost(post.id)}
                                        className="px-3 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 text-sm font-bold"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => onApprovePost(post.id)}
                                        className="px-3 py-1 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 text-sm font-bold"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm mb-2">{post.content}</p>
                            {post.imageUrl && (
                                <div className="h-32 w-full bg-gray-100 rounded-lg overflow-hidden mb-2">
                                    <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        )}

        {activeTab === 'banned' && (
          <div className="space-y-4">
            {community.bannedUsers?.length === 0 ? (
              <div className="text-center py-10 text-on-surface-secondary">
                <p>No banned users.</p>
              </div>
            ) : (
              community.bannedUsers?.map((ban) => {
                const user = allUsers.find(u => u.id === ban.userId);
                return (
                  <div key={ban.userId} className="flex items-center justify-between border border-border dark:border-dark-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        {user?.avatarUrl && <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-bold">{user?.name || 'Unknown User'}</p>
                        <p className="text-xs text-red-500">Reason: {ban.reason}</p>
                        <p className="text-xs text-on-surface-secondary">Banned on {new Date(ban.bannedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onUnbanUser(ban.userId)}
                      className="px-3 py-1.5 rounded-lg border border-border dark:border-dark-border text-sm font-semibold hover:bg-surface-hover dark:hover:bg-dark-surface-hover"
                    >
                      Unban
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            {members.length === 0 ? (
              <div className="text-center py-10 text-on-surface-secondary">
                <p>No members found.</p>
              </div>
            ) : (
              members.map((user) => {
                const isOwner = community.ownerId === user.id;
                const isModerator = community.moderatorIds?.includes(user.id);
                return (
                  <div key={user.id} className="flex items-center justify-between border border-border dark:border-dark-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        {user.avatarUrl && <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-bold flex items-center gap-2">
                          {user.name}
                          {isOwner && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Owner</span>}
                          {isModerator && !isOwner && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Moderator</span>}
                        </p>
                        <p className="text-xs text-on-surface-secondary">@{user.handle}</p>
                      </div>
                    </div>
                    {!isOwner && currentUser.id === community.ownerId && (
                      <div className="flex gap-2">
                        {isModerator ? (
                          <button
                            onClick={() => handleDemoteModerator(user.id)}
                            className="px-3 py-1.5 rounded-lg border border-border dark:border-dark-border text-sm font-semibold hover:bg-surface-hover dark:hover:bg-dark-surface-hover"
                          >
                            Demote
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePromoteModerator(user.id)}
                            className="px-3 py-1.5 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/5"
                          >
                            Promote to Mod
                          </button>
                        )}
                        <button
                          onClick={() => onBanUser(user.id, 'Banned by owner')}
                          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-200"
                        >
                          Ban
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-4">
            {!community.auditLogs || community.auditLogs.length === 0 ? (
              <div className="text-center py-10 text-on-surface-secondary">
                <p>No audit logs available.</p>
              </div>
            ) : (
              [...community.auditLogs].reverse().map((log) => {
                const moderator = allUsers.find(u => u.id === log.moderatorId);
                return (
                  <div key={log.id} className="border border-border dark:border-dark-border rounded-xl p-4 bg-surface dark:bg-dark-background">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-sm">{moderator?.name || 'Unknown Moderator'}</span>
                      <span className="text-xs text-on-surface-secondary">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">
                      <span className="font-semibold capitalize">{log.action.replace('_', ' ')}</span>
                      {log.targetId && ` on target #${log.targetId.substring(0, 8)}`}
                    </p>
                    {log.reason && <p className="text-xs text-on-surface-secondary mt-1">Reason: {log.reason}</p>}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Community Rules (one per line)</label>
              <textarea
                value={communityRules}
                onChange={(e) => setCommunityRules(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface dark:bg-dark-background border border-border dark:border-dark-border focus:outline-none focus:border-primary h-32"
                placeholder="1. Be respectful&#10;2. No spam"
              />
              <p className="text-xs text-on-surface-secondary mt-1">
                These rules will be displayed on the community page.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Auto-Filter Words (comma separated)</label>
              <textarea
                value={filterWords}
                onChange={(e) => setFilterWords(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface dark:bg-dark-background border border-border dark:border-dark-border focus:outline-none focus:border-primary h-32"
                placeholder="spam, scam, badword..."
              />
              <p className="text-xs text-on-surface-secondary mt-1">
                Posts containing these words will be automatically flagged for review.
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Require Post Approval</p>
                <p className="text-xs text-on-surface-secondary">All new posts must be approved by a moderator.</p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-gray-200 dark:bg-gray-700">
                <input
                    type="checkbox"
                    checked={community.moderationSettings?.requireApproval || false}
                    onChange={(e) => onUpdateCommunity({
                        ...community,
                        moderationSettings: {
                            ...community.moderationSettings!,
                            requireApproval: e.target.checked
                        },
                        auditLogs: logAction('update_settings')
                    })}
                    className="absolute w-6 h-6 opacity-0 cursor-pointer"
                />
                <span className={`absolute left-0 inline-block w-6 h-6 bg-white border border-gray-300 rounded-full shadow transform transition-transform duration-200 ease-in-out ${community.moderationSettings?.requireApproval ? 'translate-x-6 bg-primary border-primary' : 'translate-x-0'}`}></span>
            </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Auto-Ban Report Threshold</label>
              <input
                type="number"
                min="1"
                value={autoBanReportCount}
                onChange={(e) => setAutoBanReportCount(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-3 rounded-xl bg-surface dark:bg-dark-background border border-border dark:border-dark-border focus:outline-none focus:border-primary"
                placeholder="e.g. 5"
              />
              <p className="text-xs text-on-surface-secondary mt-1">
                Automatically ban users if they receive this many reports. Leave empty to disable.
              </p>
            </div>

            <div className="pt-4 border-t border-border dark:border-dark-border">
              <button
                onClick={handleSaveSettings}
                className="w-full py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationDashboard;
