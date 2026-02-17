import { Rental } from '@/types/rental';
import { formatCurrency, formatDate } from '@/lib/storage';
import { Car, Phone, MapPin, CreditCard, Calendar, User, Users, FileText, Clock, Image, Shield } from 'lucide-react';
import { URDU_TERMS_LIST, TERMS_TITLE } from '@/lib/termsAndConditions';

interface InvoicePreviewProps {
  rental: Rental;
}

export const InvoicePreview = ({ rental }: InvoicePreviewProps) => {
  const displayAgreementNumber = rental.agreementNumber || rental.id.toUpperCase();
  
  // Collect all client images
  const clientImages = [];
  if (rental.client.photo) {
    clientImages.push({ label: 'Client Photo', src: rental.client.photo });
  }
  if (rental.client.cnicFrontImage) {
    clientImages.push({ label: 'CNIC Front', src: rental.client.cnicFrontImage });
  }
  if (rental.client.cnicBackImage) {
    clientImages.push({ label: 'CNIC Back', src: rental.client.cnicBackImage });
  }
  if (rental.client.drivingLicenseImage) {
    clientImages.push({ label: 'Driving License', src: rental.client.drivingLicenseImage });
  }

  // Format time to 12-hour format
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  return (
    <div id="invoice-content" className="bg-white p-6 md:p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-4 border-primary pb-6 mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
            <Car className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>
              Yousif & Sons
            </h1>
            <p className="text-muted-foreground text-sm">Rent A Car</p>
            <p className="text-xs text-primary/70 italic">Driven by Trust. Powered by Comfort.</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="flex items-center sm:justify-end gap-2 mb-1">
            <FileText className="w-5 h-5 text-primary" />
            <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AGREEMENT</p>
          </div>
          <p className="text-base md:text-lg font-semibold text-foreground">#{displayAgreementNumber}</p>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{formatDate(rental.createdAt)}</p>
        </div>
      </div>

      {/* Client & Witness Info */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Client Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm uppercase tracking-wide border-b-2 border-muted pb-2">
            <User className="w-4 h-4 text-primary" />
            Client Details
          </h3>
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 space-y-2 border border-border/50">
            <p className="font-bold text-foreground text-base">{rental.client.fullName}</p>
            <p className="text-sm text-muted-foreground">CNIC: <span className="font-medium text-foreground">{rental.client.cnic}</span></p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" /> 
              <span className="font-medium text-foreground">{rental.client.phone}</span>
            </p>
            <p className="text-sm text-muted-foreground flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary mt-0.5" /> 
              <span className="font-medium text-foreground">{rental.client.address}</span>
            </p>
          </div>
        </div>

        {/* Witness Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm uppercase tracking-wide border-b-2 border-muted pb-2">
            <Users className="w-4 h-4 text-primary" />
            Witness Details
          </h3>
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 space-y-2 border border-border/50">
            <p className="font-bold text-foreground text-base">{rental.witness.name}</p>
            <p className="text-sm text-muted-foreground">CNIC: <span className="font-medium text-foreground">{rental.witness.cnic}</span></p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" /> 
              <span className="font-medium text-foreground">{rental.witness.phone}</span>
            </p>
            <p className="text-sm text-muted-foreground flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary mt-0.5" /> 
              <span className="font-medium text-foreground">{rental.witness.address}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="mb-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm uppercase tracking-wide border-b-2 border-muted pb-2">
          <Car className="w-4 h-4 text-primary" />
          Vehicle Details
        </h3>
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Vehicle Image or Logo */}
            {rental.vehicle.image ? (
              <img 
                src={rental.vehicle.image} 
                alt={rental.vehicle.name}
                className="w-24 h-16 object-cover rounded-lg border-2 border-primary/20 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">{rental.vehicle.brand?.charAt(0) || 'V'}</span>
              </div>
            )}
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-gradient-to-r from-primary to-accent text-white rounded-full text-xs font-semibold mb-2">
                {rental.vehicle.brand || 'Vehicle'}
              </div>
              <p className="font-bold text-foreground text-lg">{rental.vehicle.brand} {rental.vehicle.model}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {rental.vehicle.year && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700">
                    📅 {rental.vehicle.year}
                  </span>
                )}
                {rental.vehicle.color && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-medium text-purple-700">
                    🎨 {rental.vehicle.color}
                  </span>
                )}
                {rental.vehicle.type && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-medium text-green-700">
                    🚗 {rental.vehicle.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Period - Enhanced Display */}
      <div className="mb-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm uppercase tracking-wide border-b-2 border-muted pb-2">
          <Calendar className="w-4 h-4 text-primary" />
          Rental Period
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase">Delivery</span>
            </div>
            <p className="font-bold text-foreground text-sm md:text-base">📅 {formatDate(rental.deliveryDate)}</p>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm mt-1">⏰ {formatTime(rental.deliveryTime)}</p>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 rounded-xl p-4 border border-rose-200 dark:border-rose-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase">Return</span>
            </div>
            <p className="font-bold text-foreground text-sm md:text-base">📅 {formatDate(rental.returnDate)}</p>
            <p className="font-semibold text-rose-600 dark:text-rose-400 text-sm mt-1">⏰ {formatTime(rental.returnTime)}</p>
          </div>
        </div>
        <div className="mt-3 text-center">
          <span className="inline-block bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold capitalize border border-primary/20">
            {rental.rentType} Rental
          </span>
        </div>
      </div>

      {/* Client Documents / Images */}
      {clientImages.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm uppercase tracking-wide border-b-2 border-muted pb-2">
            <Image className="w-4 h-4 text-primary" />
            Client Documents
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {clientImages.map((img, index) => (
              <div key={index} className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-2 border border-border/50 text-center">
                <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">{img.label}</p>
                <img 
                  src={img.src} 
                  alt={img.label}
                  className="w-full h-20 md:h-24 object-contain rounded-lg bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cG9seWxpbmUgcG9pbnRzPSIyMSAxNSAxNiAxMCA1IDIxIi8+PC9zdmc+';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Details */}
      <div className="mb-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm uppercase tracking-wide border-b-2 border-muted pb-2">
          <CreditCard className="w-4 h-4 text-primary" />
          Payment Details
        </h3>
        <div className="border border-border rounded-xl overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-muted-foreground text-sm">Total Amount</td>
                <td className="px-4 py-3 text-right font-bold text-foreground">{formatCurrency(rental.totalAmount)}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-muted-foreground text-sm">Advance Payment</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatCurrency(rental.advancePayment)}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-muted-foreground text-sm">Balance Due</td>
                <td className="px-4 py-3 text-right font-bold text-rose-600">{formatCurrency(rental.balance)}</td>
              </tr>
              <tr className="bg-gradient-to-r from-primary to-accent">
                <td className="px-4 py-3 text-primary-foreground font-semibold text-sm">Payment Status</td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    rental.paymentStatus === 'paid' 
                      ? 'bg-emerald-500 text-white' 
                      : rental.paymentStatus === 'partial'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}>
                    {rental.paymentStatus}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      {rental.notes && (
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wide">📝 Notes</h3>
          <p className="text-muted-foreground bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 border-l-4 border-primary text-sm">{rental.notes}</p>
        </div>
      )}

      {/* Urdu Terms & Conditions - Fixed, Non-editable */}
      <div className="mb-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm uppercase tracking-wide border-b-2 border-muted pb-2">
          <Shield className="w-4 h-4 text-primary" />
          <span>{TERMS_TITLE}</span>
          <span className="text-xs font-normal text-muted-foreground ml-2">(Terms & Conditions)</span>
        </h3>
        <div 
          className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4 md:p-6 border-2 border-amber-200 dark:border-amber-800"
          dir="rtl"
          style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" }}
        >
          <h4 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-4 text-center border-b border-amber-300 dark:border-amber-700 pb-2">
            {TERMS_TITLE}
          </h4>
          <ol className="space-y-3 text-amber-900 dark:text-amber-100 text-sm leading-relaxed list-decimal list-inside">
            {URDU_TERMS_LIST.map((term, index) => (
              <li key={index} className="text-right pr-2">
                {term}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="border-b-2 border-dashed border-muted-foreground/50 h-16 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Client Signature</p>
            <p className="text-xs text-muted-foreground mt-1">کرایہ دار کے دستخط</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-dashed border-muted-foreground/50 h-16 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Witness Signature</p>
            <p className="text-xs text-muted-foreground mt-1">گواہ کے دستخط</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-border pt-6 mt-8 text-center">
        <p className="font-semibold text-primary text-base" style={{ fontFamily: 'Playfair Display, serif' }}>
          Yousif & Sons Rent A Car
        </p>
        <p className="text-xs text-muted-foreground italic mt-1">Driven by Trust. Powered by Comfort.</p>
        <p className="text-xs text-muted-foreground mt-3">
          Thank you for choosing us! For any queries, please contact us.
        </p>
      </div>
    </div>
  );
};