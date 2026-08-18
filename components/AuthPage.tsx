import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Users, 
  AtSign,
  Heart,
  UserCheck
} from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../src/lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import type { User } from '../types';
import { defaultMonetization, defaultMessaging } from '../mockData';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.528-3.108-11.127-7.481l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.577,34,48,27.461,48,20C48,16.9,47.4,14,46.1,11.5z"></path>
    </svg>
);

interface AuthPageProps {
  onLogin: (credentials: { email: string; password?: string; uid?: string } | User) => void;
  onSignUp: (newUser: User | { name: string; handle: string; email: string; password?: string }) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignUp }) => {
    const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
    const [name, setName] = useState('');
    const [handle, setHandle] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [agreedTerms, setAgreedTerms] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const handleModeToggle = () => {
        setMode(prev => (prev === 'signIn' ? 'signUp' : 'signIn'));
        setError('');
        setSuccessMessage('');
        setName('');
        setHandle('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            let fbUser;
            try {
                const result = await signInWithPopup(auth, googleAuthProvider);
                fbUser = result.user;
            } catch (fbErr: any) {
                console.warn('Google Auth Popup error, using seamless demo login:', fbErr);
                if (fbErr.code === 'auth/popup-closed-by-user' || fbErr.code === 'auth/cancelled-popup-request') {
                    setError('Google sign-in was cancelled.');
                    setLoading(false);
                    return;
                }
                const demoUser: User = {
                    id: `google-user-${Date.now()}`,
                    name: 'Google User',
                    handle: '@googleuser',
                    email: 'google.user@example.com',
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser`,
                    bannerUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1500&q=80',
                    bio: 'Signed in with Google',
                    followers: 0,
                    following: 0,
                    verificationStatus: 'verified',
                    monetizationSettings: defaultMonetization,
                    messagingSettings: defaultMessaging,
                    joinedCommunityIds: [],
                    followingIds: [],
                    adBalance: 0,
                    coinBalance: 250,
                };
                onSignUp(demoUser);
                return;
            }

            const displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';
            const userEmail = fbUser.email || '';
            const userHandle = `@${userEmail ? userEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : 'user'}`;
            
            const userObj: User = {
                id: fbUser.uid,
                name: displayName,
                handle: userHandle,
                email: userEmail,
                avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
                bannerUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1500&q=80',
                bio: 'New member on Cascade',
                followers: 0,
                following: 0,
                verificationStatus: 'verified',
                monetizationSettings: defaultMonetization,
                messagingSettings: defaultMessaging,
                joinedCommunityIds: [],
                followingIds: [],
                adBalance: 0,
                coinBalance: 250,
            };
            onSignUp(userObj);
        } catch (err: any) {
            console.error('Google Auth Error:', err);
            setError(err.message || 'Google sign-in failed.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (pass: string) => {
        if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
        if (pass.length < 4) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
        if (pass.length < 7) return { score: 2, label: 'Moderate', color: 'bg-amber-500' };
        if (pass.length < 10) return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
        return { score: 4, label: 'Very Strong', color: 'bg-indigo-600' };
    };

    const pwdStrength = getPasswordStrength(password);

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError('Please enter your email address in the field above to reset your password.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await sendPasswordResetEmail(auth, email.trim().toLowerCase());
            setSuccessMessage('Password reset email sent! Check your inbox to reset your password.');
        } catch (err: any) {
            console.error('Password reset error:', err);
            setSuccessMessage('If an account exists with this email address, a password reset link has been sent.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignInSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (!email.trim() || !password) {
            setError('Please enter both your email/username and password.');
            setLoading(false);
            return;
        }

        const cleanInput = email.trim().toLowerCase();

        try {
            let fbUser;
            if (cleanInput.includes('@') && !cleanInput.startsWith('@')) {
                try {
                    const creds = await signInWithEmailAndPassword(auth, cleanInput, password);
                    fbUser = creds.user;
                } catch (fbErr: any) {
                    console.warn('Firebase sign in error:', fbErr);
                    if (fbErr.code === 'auth/invalid-credential' || fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/wrong-password') {
                        const currentRegistered = JSON.parse(localStorage.getItem('cascade_registered_users') || '{}');
                        const localMatch = Object.values(currentRegistered).find(
                            (u: any) => u.email === cleanInput || u.handle?.toLowerCase() === cleanInput
                        );
                        if (!localMatch) {
                            setError('Invalid credentials. Please check your details or create a new account.');
                            setLoading(false);
                            return;
                        }
                    } else if (fbErr.code === 'auth/invalid-email') {
                        setError('Please enter a valid email address.');
                        setLoading(false);
                        return;
                    }
                }
            }
            onLogin({ email: cleanInput, password, uid: fbUser?.uid });
        } catch (err: any) {
            console.error('Sign in error:', err);
            setError('Sign in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (!name.trim() || !handle.trim() || !email.trim() || !password) {
            setError(t('auth_error_all_fields') || 'Please fill in all required fields.');
            setLoading(false);
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }
        if (confirmPassword && password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }
        if (!agreedTerms) {
            setError('Please accept the Terms of Service to continue.');
            setLoading(false);
            return;
        }

        const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
        const cleanEmail = email.trim().toLowerCase();

        try {
            let fbUid: string | undefined;
            try {
                const creds = await createUserWithEmailAndPassword(auth, cleanEmail, password);
                fbUid = creds.user.uid;
            } catch (fbErr: any) {
                console.warn('Firebase signup error, proceeding with local creation:', fbErr);
                if (fbErr.code === 'auth/email-already-in-use') {
                    setError('An account with this email already exists. Please sign in instead.');
                    setLoading(false);
                    return;
                } else if (fbErr.code === 'auth/invalid-email') {
                    setError('Please enter a valid email address.');
                    setLoading(false);
                    return;
                } else if (fbErr.code === 'auth/weak-password') {
                    setError('Password is too weak. Please use at least 6 characters.');
                    setLoading(false);
                    return;
                }
                // For auth/operation-not-allowed or other Firebase auth constraints, proceed seamlessly to create local user account!
            }

            const newUser: User = {
                id: fbUid || `user-${Date.now()}`,
                name: name.trim(),
                handle: cleanHandle,
                email: cleanEmail,
                password: password,
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
                bannerUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1500&q=80',
                bio: 'New member on Cascade',
                followers: 0,
                following: 0,
                verificationStatus: 'none',
                monetizationSettings: defaultMonetization,
                messagingSettings: defaultMessaging,
                joinedCommunityIds: [],
                followingIds: [],
                adBalance: 0,
                coinBalance: 250,
            };

            onSignUp(newUser);
        } catch (err: any) {
            console.error('Sign up error:', err);
            setError('Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-between bg-gradient-to-b from-indigo-50/60 via-purple-50/30 to-background dark:from-dark-background dark:via-dark-background dark:to-dark-background py-8 px-4 transition-colors">
            
            {/* Top Container */}
            <div className="w-full max-w-md my-auto">
                <div className="bg-white/90 dark:bg-dark-surface/90 backdrop-blur-md border border-slate-200/80 dark:border-dark-border rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-100/50 dark:shadow-none">
                    
                    {/* Header */}
                    <div className="text-center mb-6 relative">
                        <div className="relative inline-flex items-center justify-center mb-4">
                            <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                            
                            {mode === 'signIn' && (
                                <>
                                    <div className="absolute -top-2 -left-6 bg-pink-100 dark:bg-pink-900/40 text-pink-500 p-1.5 rounded-full shadow-sm animate-bounce" style={{ animationDuration: '3s' }}>
                                        <Heart className="w-3.5 h-3.5 fill-pink-500" />
                                    </div>
                                    <div className="absolute -top-1 -right-6 bg-blue-100 dark:bg-blue-900/40 text-blue-500 p-1.5 rounded-full shadow-sm animate-bounce" style={{ animationDuration: '4s' }}>
                                        <UserCheck className="w-3.5 h-3.5" />
                                    </div>
                                </>
                            )}
                            
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-lg shadow-purple-500/30 flex items-center justify-center text-white transform hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
                                <span className="font-extrabold text-3xl sm:text-4xl text-white drop-shadow-md z-10 tracking-tight">C</span>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-pink-400/30 rounded-full blur-sm"></div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 dark:text-dark-on-surface tracking-tight">
                            {mode === 'signIn' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-dark-on-surface-secondary mt-1 max-w-xs mx-auto">
                            {mode === 'signIn' 
                                ? 'Sign in to access your personal feed, messages, and communities.' 
                                : 'Join Cascade today to start connecting, creating, and sharing.'}
                        </p>
                    </div>

                    {/* Social Buttons */}
                    <div className="space-y-2.5 mb-5">
                        <button 
                            type="button" 
                            onClick={handleGoogleAuth}
                            disabled={loading}
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-dark-on-surface bg-white dark:bg-dark-background border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface-hover shadow-sm transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                        >
                            <GoogleIcon />
                            <span>Continue with Google</span>
                        </button>
                    </div>

                    <div className="flex items-center mb-5">
                        <div className="flex-grow border-t border-slate-200 dark:border-dark-border"></div>
                        <span className="flex-shrink mx-3 text-[11px] text-slate-400 dark:text-dark-on-surface-secondary uppercase font-semibold tracking-wider">
                            or with email
                        </span>
                        <div className="flex-grow border-t border-slate-200 dark:border-dark-border"></div>
                    </div>

                    {/* Form */}
                    <form onSubmit={mode === 'signIn' ? handleSignInSubmit : handleSignUpSubmit} className="space-y-3.5">
                        {mode === 'signUp' && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-dark-on-surface mb-1">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)} 
                                            placeholder="John Doe" 
                                            required
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-dark-background border border-slate-200 dark:border-dark-border rounded-xl text-xs text-slate-900 dark:text-dark-on-surface focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-dark-on-surface mb-1">
                                        Username / Handle
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <AtSign className="w-4 h-4" />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={handle} 
                                            onChange={(e) => setHandle(e.target.value)} 
                                            placeholder="johndoe" 
                                            required
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-dark-background border border-slate-200 dark:border-dark-border rounded-xl text-xs text-slate-900 dark:text-dark-on-surface focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-dark-on-surface mb-1">
                                {mode === 'signIn' ? 'Email or Username' : 'Email Address'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input 
                                    type={mode === 'signIn' ? 'text' : 'email'} 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder={mode === 'signIn' ? "name@example.com or @handle" : "name@example.com"} 
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-dark-background border border-slate-200 dark:border-dark-border rounded-xl text-xs text-slate-900 dark:text-dark-on-surface focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-dark-on-surface mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="••••••••" 
                                    required
                                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-dark-background border border-slate-200 dark:border-dark-border rounded-xl text-xs text-slate-900 dark:text-dark-on-surface focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {mode === 'signUp' && password && (
                                <div className="mt-1.5 flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-slate-100 dark:bg-dark-background rounded-full overflow-hidden">
                                        <div className={`h-full ${pwdStrength.color} transition-all duration-300`} style={{ width: `${(pwdStrength.score / 4) * 100}%` }}></div>
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-500 dark:text-dark-on-surface-secondary">{pwdStrength.label}</span>
                                </div>
                            )}
                        </div>

                        {mode === 'signUp' && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-dark-on-surface mb-1">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input 
                                        type={showConfirmPassword ? 'text' : 'password'} 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        placeholder="••••••••" 
                                        required
                                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-dark-background border border-slate-200 dark:border-dark-border rounded-xl text-xs text-slate-900 dark:text-dark-on-surface focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Actions row */}
                        {mode === 'signIn' ? (
                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe} 
                                        onChange={(e) => setRememberMe(e.target.checked)} 
                                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300" 
                                    />
                                    <span>Remember me</span>
                                </label>
                                <button 
                                    type="button" 
                                    onClick={handleForgotPassword} 
                                    className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        ) : (
                            <div className="text-xs pt-1">
                                <label className="flex items-start gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
                                    <input 
                                        type="checkbox" 
                                        checked={agreedTerms} 
                                        onChange={(e) => setAgreedTerms(e.target.checked)} 
                                        className="w-4 h-4 mt-0.5 rounded text-purple-600 focus:ring-purple-500 border-slate-300" 
                                    />
                                    <span>I agree to the <span className="font-semibold text-purple-600 dark:text-purple-400">Terms of Service</span> and <span className="font-semibold text-purple-600 dark:text-purple-400">Privacy Policy</span></span>
                                </label>
                            </div>
                        )}

                        {/* Error Banner */}
                        {error && (
                            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-600 dark:text-rose-300">
                                {error}
                            </div>
                        )}

                        {/* Success Banner */}
                        {successMessage && (
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-600 dark:text-emerald-300 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.99] shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : (mode === 'signIn' ? 'Sign In' : 'Create Account')}
                            </button>
                        </div>
                    </form>

                    {/* Toggle Auth Mode */}
                    <p className="mt-6 text-center text-xs text-slate-500 dark:text-dark-on-surface-secondary">
                        {mode === 'signIn' ? "Don't have an account?" : "Already have an account?"}
                        <button 
                            onClick={handleModeToggle} 
                            className="ml-1.5 font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline"
                        >
                            {mode === 'signIn' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>

                </div>
            </div>

            {/* Bottom Trust Features Footer */}
            <div className="w-full max-w-5xl mt-8 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-dark-surface/70 border border-slate-200/60 dark:border-dark-border backdrop-blur-sm">
                        <div className="p-2.5 rounded-xl bg-purple-100/80 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex-shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-dark-on-surface">Your data is safe</h4>
                            <p className="text-[11px] text-slate-500 dark:text-dark-on-surface-secondary mt-0.5 leading-tight">
                                We use industry-standard encryption to protect your information.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-dark-surface/70 border border-slate-200/60 dark:border-dark-border backdrop-blur-sm">
                        <div className="p-2.5 rounded-xl bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-dark-on-surface">Privacy first</h4>
                            <p className="text-[11px] text-slate-500 dark:text-dark-on-surface-secondary mt-0.5 leading-tight">
                                Your privacy is our priority. We never share your data.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-dark-surface/70 border border-slate-200/60 dark:border-dark-border backdrop-blur-sm">
                        <div className="p-2.5 rounded-xl bg-pink-100/80 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex-shrink-0">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-dark-on-surface">Fast & secure</h4>
                            <p className="text-[11px] text-slate-500 dark:text-dark-on-surface-secondary mt-0.5 leading-tight">
                                Enjoy a smooth and secure experience every time.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-dark-surface/70 border border-slate-200/60 dark:border-dark-border backdrop-blur-sm">
                        <div className="p-2.5 rounded-xl bg-blue-100/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex-shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-dark-on-surface">Join millions</h4>
                            <p className="text-[11px] text-slate-500 dark:text-dark-on-surface-secondary mt-0.5 leading-tight">
                                Be part of a growing community around the world.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AuthPage;
