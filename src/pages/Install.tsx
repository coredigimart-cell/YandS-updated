import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, CheckCircle, Share, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import brandLogo from '@/assets/brand-logo.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <img src={brandLogo} alt="Yousif & Sons Rent A Car" className="h-20 w-auto object-contain" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2 text-success">
              <CheckCircle className="w-6 h-6" />
              App Installed!
            </CardTitle>
            <CardDescription>
              Yousif & Sons Rent A Car is installed on your device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full bg-gradient-to-r from-[#F47C2C] to-[#D8432E] hover:opacity-90">
                Open Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img src={brandLogo} alt="Yousif & Sons Rent A Car" className="h-20 w-auto object-contain" />
          </div>
          <CardTitle className="text-2xl">Install Our App</CardTitle>
          <CardDescription>
            Get the full experience with our installable app. Works offline and loads instantly!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features */}
          <div className="grid gap-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-primary" />
              </div>
              <span>Works like a native app on your phone</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="w-4 h-4 text-primary" />
              </div>
              <span>Works offline after installation</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <span>Faster loading and instant access</span>
            </div>
          </div>

          {/* Install Button or Instructions */}
          {deferredPrompt ? (
            <Button 
              onClick={handleInstall}
              className="w-full bg-gradient-to-r from-[#F47C2C] to-[#D8432E] hover:opacity-90"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>
          ) : isIOS ? (
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <p className="text-sm font-medium">To install on iOS:</p>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</span>
                  Tap the <Share className="w-4 h-4 inline mx-1" /> Share button
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</span>
                  Scroll and tap <Plus className="w-4 h-4 inline mx-1" /> "Add to Home Screen"
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">3</span>
                  Tap "Add" to confirm
                </li>
              </ol>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Open this page in Chrome or Edge browser to install the app, or use your browser's menu to "Add to Home Screen".
              </p>
            </div>
          )}

          <Link to="/" className="block">
            <Button variant="outline" className="w-full">
              Continue to Website
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
