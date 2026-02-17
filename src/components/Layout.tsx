import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle,
  Menu,
  X,
  Info,
  Shield,
  ScrollText,
  Settings,
  LogOut,
  LogIn,
  Car
} from 'lucide-react';
import brandLogo from '@/assets/brand-logo.png';
import { useState } from 'react';
import { CompanySettings } from './CompanySettings';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/new-booking', icon: PlusCircle, label: 'New Booking' },
  { to: '/vehicles', icon: Car, label: 'Vehicles' },
  { to: '/rentals', icon: FileText, label: 'All Rentals' },
];

const footerLinks = [
  { to: '/about', label: 'About Us', icon: Info },
  { to: '/privacy', label: 'Privacy Policy', icon: Shield },
  { to: '/terms', label: 'Terms & Conditions', icon: ScrollText },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col font-sans">
      {/* Header - Modern Minimal */}
      <header className="bg-white sticky top-0 z-50 border-b border-orange-100/60 shadow-[0_1px_2px_rgba(244,124,44,0.03)]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24 md:h-32">
            {/* Logo - Full Brand Logo */}
            <Link to="/" className="flex items-center group">
              <img 
                src={brandLogo} 
                alt="Yousif & Sons Rent A Car" 
                className="h-24 md:h-30 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    location.pathname === to
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
              
              {/* Company Settings */}
              {user && (
                <CompanySettings 
                  trigger={
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-all duration-300">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                  }
                />
              )}
              
              {/* Auth Button */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              {user && (
                <CompanySettings 
                  trigger={
                    <button className="p-2 rounded-xl text-foreground/60 hover:text-foreground hover:bg-muted transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                  }
                />
              )}
              <button
                className="p-2 rounded-xl text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Clean Slide Down */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border animate-fade-in bg-white backdrop-blur-md">
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navItems.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    location.pathname === to
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}
              
              {/* Mobile Auth Button */}
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8 flex-1">
        {children}
      </main>

      {/* Footer - Gray Theme */}
      <footer className="bg-muted border-t border-border py-10 mt-auto">
        <div className="container mx-auto px-4">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src={brandLogo} 
              alt="Yousif & Sons Rent A Car" 
              className="h-20 md:h-24 w-auto object-contain"
            />
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {footerLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm font-medium transition-colors duration-300"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Yousif & Sons Rent A Car. Your Ride, Your Way!
          </p>
        </div>
      </footer>
    </div>
  );
};
