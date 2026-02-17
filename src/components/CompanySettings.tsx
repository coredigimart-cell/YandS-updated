import { useState, useEffect } from 'react';
import { Building2, Phone, MapPin, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export interface CompanyInfo {
  name: string;
  phone: string;
  phone2?: string;
  address: string;
  email?: string;
  tagline?: string;
}

const COMPANY_INFO_KEY = 'yousif_sons_company_info';

export const defaultCompanyInfo: CompanyInfo = {
  name: 'Yousif & Sons',
  phone: '',
  phone2: '',
  address: '',
  email: '',
  tagline: 'Driven by Trust. Powered by Comfort.',
};

export const getCompanyInfo = (): CompanyInfo => {
  try {
    const data = localStorage.getItem(COMPANY_INFO_KEY);
    return data ? { ...defaultCompanyInfo, ...JSON.parse(data) } : defaultCompanyInfo;
  } catch {
    return defaultCompanyInfo;
  }
};

export const saveCompanyInfo = (info: CompanyInfo): void => {
  localStorage.setItem(COMPANY_INFO_KEY, JSON.stringify(info));
};

interface CompanySettingsProps {
  trigger?: React.ReactElement;
}

export const CompanySettings = ({ trigger }: CompanySettingsProps) => {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<CompanyInfo>(defaultCompanyInfo);

  useEffect(() => {
    setInfo(getCompanyInfo());
  }, [open]);

  const handleSave = () => {
    // Always ensure company name stays fixed
    const infoToSave = { ...info, name: 'Yousif & Sons' };
    saveCompanyInfo(infoToSave);
    toast.success('Company information saved successfully!');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Building2 className="w-4 h-4" />
            Company Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            Company Information
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Company Name - Fixed/Read-only */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Company Name
              <span className="text-xs text-muted-foreground ml-1">(Fixed)</span>
            </Label>
            <Input
              id="companyName"
              value="Yousif & Sons"
              disabled
              className="input-styled bg-muted/50 cursor-not-allowed font-semibold text-primary"
            />
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="03XX-XXXXXXX"
                value={info.phone}
                onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                className="input-styled"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone2">Phone 2 (Optional)</Label>
              <Input
                id="phone2"
                placeholder="03XX-XXXXXXX"
                value={info.phone2}
                onChange={(e) => setInfo({ ...info, phone2: e.target.value })}
                className="input-styled"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="info@company.com"
              value={info.email}
              onChange={(e) => setInfo({ ...info, email: e.target.value })}
              className="input-styled"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Address
            </Label>
            <Textarea
              id="address"
              placeholder="Full business address..."
              value={info.address}
              onChange={(e) => setInfo({ ...info, address: e.target.value })}
              className="input-styled min-h-20"
            />
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              placeholder="Your company slogan"
              value={info.tagline}
              onChange={(e) => setInfo({ ...info, tagline: e.target.value })}
              className="input-styled"
            />
          </div>

          {/* Preview */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">PDF Preview</p>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-primary">{info.name || 'Company Name'}</p>
              {info.tagline && <p className="text-xs text-muted-foreground italic">{info.tagline}</p>}
              {info.phone && <p className="text-sm mt-2">📞 {info.phone} {info.phone2 && `| ${info.phone2}`}</p>}
              {info.email && <p className="text-sm">✉️ {info.email}</p>}
              {info.address && <p className="text-sm">📍 {info.address}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 btn-primary-gradient"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
