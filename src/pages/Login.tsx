import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import brandLogo from '@/assets/brand-logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        console.log('Attempting sign in with:', formData.email);
        await signIn(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        await signUp(formData.email, formData.password);
        toast.success('Account created successfully!');
      }
      navigate('/');
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account already exists with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(formData.email);
      toast.success('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    } catch (error: any) {
      toast.error('Failed to send reset email. Check the email address.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDFCFB]">
      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo Section - Large and Clear */}
        <div className="text-center mb-8">
          <img 
            src={brandLogo} 
            alt="Yousif & Sons Rent A Car" 
            className="h-32 md:h-40 w-auto mx-auto object-contain animate-scale-in"
          />
        </div>

        {/* Login Card - Modern, Light, Airy */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(244,124,44,0.1)] border border-orange-100 animate-slide-up">
          {/* Modern Segmented Control Tabs */}
          <div className="flex bg-slate-50 rounded-2xl p-1.5 mb-8 border border-slate-100">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setShowForgotPassword(false); }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                isLogin 
                  ? 'bg-gradient-to-r from-brand-orange to-brand-red text-white shadow-md' 
                  : 'text-brand-gray-500 hover:text-brand-gray-700'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setShowForgotPassword(false); }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                !isLogin 
                  ? 'bg-gradient-to-r from-brand-orange to-brand-red text-white shadow-md' 
                  : 'text-brand-gray-500 hover:text-brand-gray-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-brand-gray-700">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400 group-focus-within:text-brand-orange transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-11 h-12 bg-brand-gray-50 border border-brand-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            {!showForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-brand-gray-700">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400 group-focus-within:text-brand-orange transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-11 pr-11 h-12 bg-brand-gray-50 border border-brand-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Sign Up Only) */}
            {!isLogin && !showForgotPassword && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-brand-gray-700">
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400 group-focus-within:text-brand-orange transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-11 h-12 bg-brand-gray-50 border border-brand-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Forgot Password Link */}
            {isLogin && !showForgotPassword && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-brand-orange hover:text-brand-red transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button - Pill Style with Glow */}
            {showForgotPassword ? (
              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-brand-orange to-brand-red text-white rounded-full font-semibold shadow-lg shadow-brand-orange/30 hover:shadow-xl hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Email'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full h-11 rounded-full border-brand-gray-300 text-brand-gray-600 hover:bg-brand-gray-100"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-brand-orange to-brand-red text-white rounded-full font-semibold shadow-lg shadow-brand-orange/30 hover:shadow-xl hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all group mt-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            )}
          </form>

          {/* Subtle Security Badge */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" />
              Secured by Firebase Authentication
            </p>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-center text-sm text-muted-foreground mt-8 font-medium">
          Your Ride, Your Way!
        </p>
      </div>
    </div>
  );
};

export default Login;
