import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Edit, Trash2, Check, X, MessageCircle, Share2, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InvoicePreview } from '@/components/InvoicePreview';
import { formatCurrency, formatDate } from '@/lib/storage';
import { 
  subscribeToRentals, 
  updateRentalInFirestore, 
  deleteRentalFromFirestore 
} from '@/lib/firestoreService';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { downloadPDFDirect } from '@/lib/pdfDownloader';
import { Rental, PaymentStatus } from '@/types/rental';
import { toast } from 'sonner';

const Invoice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState(false);
  const [editingAgreementNumber, setEditingAgreementNumber] = useState(false);
  const [advancePayment, setAdvancePayment] = useState(0);
  const [agreementNumber, setAgreementNumber] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      // Subscribe to real-time updates for rentals
      const unsubscribe = subscribeToRentals((rentals) => {
        const found = rentals.find(r => r.id === id);
        if (found) {
          setRental(found);
          setAdvancePayment(found.advancePayment);
          setAgreementNumber(found.agreementNumber || '');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [id]);

  const handleDelete = async () => {
    if (rental && window.confirm('Are you sure you want to delete this rental agreement?')) {
      try {
        await deleteRentalFromFirestore(rental.id);
        toast.success('Agreement deleted successfully');
        navigate('/rentals');
      } catch (error) {
        toast.error('Failed to delete agreement');
      }
    }
  };

  const handlePrint = () => {
    if (rental) {
      generateInvoicePDF(rental);
    }
  };

  const handleDownloadPDF = async () => {
    if (rental && !isDownloading) {
      setIsDownloading(true);
      try {
        await downloadPDFDirect(rental);
        toast.success('PDF downloaded successfully!');
      } catch (error) {
        console.error('Download error:', error);
        toast.error('Failed to download PDF. Try Print instead.');
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleUpdatePayment = async () => {
    if (rental) {
      const balance = rental.totalAmount - advancePayment;
      let paymentStatus: PaymentStatus = 'pending';
      if (advancePayment >= rental.totalAmount) {
        paymentStatus = 'paid';
      } else if (advancePayment > 0) {
        paymentStatus = 'partial';
      }

      try {
        await updateRentalInFirestore(rental.id, {
          advancePayment,
          balance,
          paymentStatus,
        });
        setEditingPayment(false);
        toast.success('Payment updated successfully');
      } catch (error) {
        toast.error('Failed to update payment');
      }
    }
  };

  const handleUpdateAgreementNumber = async () => {
    if (rental) {
      try {
        await updateRentalInFirestore(rental.id, {
          agreementNumber: agreementNumber || undefined,
        });
        setEditingAgreementNumber(false);
        toast.success('Agreement number updated successfully');
      } catch (error) {
        toast.error('Failed to update agreement number');
      }
    }
  };

  const handleMarkAsPaid = async () => {
    if (rental) {
      try {
        await updateRentalInFirestore(rental.id, {
          advancePayment: rental.totalAmount,
          balance: 0,
          paymentStatus: 'paid' as PaymentStatus,
        });
        setAdvancePayment(rental.totalAmount);
        toast.success('Marked as fully paid');
      } catch (error) {
        toast.error('Failed to mark as paid');
      }
    }
  };

  // Generate WhatsApp share message
  const generateWhatsAppMessage = (): string => {
    if (!rental) return '';
    
    const agreementNum = rental.agreementNumber || rental.id.toUpperCase();
    const deliveryDate = formatDate(rental.deliveryDate);
    const returnDate = formatDate(rental.returnDate);
    
    const message = `🚗 *Yousif & Sons Rent A Car*
━━━━━━━━━━━━━━━━
📋 *Agreement #${agreementNum}*

👤 *Client:* ${rental.client.fullName}
📱 *Phone:* ${rental.client.phone}

🚙 *Vehicle:* ${rental.vehicle.name}
${rental.vehicle.color ? `🎨 *Color:* ${rental.vehicle.color}` : ''}

📅 *Delivery:* ${deliveryDate} at ${rental.deliveryTime}
📅 *Return:* ${returnDate} at ${rental.returnTime}

💰 *Total:* Rs ${rental.totalAmount.toLocaleString()}
💵 *Paid:* Rs ${rental.advancePayment.toLocaleString()}
📊 *Balance:* Rs ${rental.balance.toLocaleString()}
━━━━━━━━━━━━━━━━
📄 View Agreement: ${window.location.origin}/agreement/${rental.id}

Thank you for choosing Yousif & Sons!
🌐 Driven by Trust. Powered by Comfort.`;

    return encodeURIComponent(message);
  };

  // Share via WhatsApp to client
  const handleWhatsAppShare = () => {
    if (!rental) return;
    
    // Clean phone number (remove spaces, dashes, etc.)
    let phone = rental.client.phone.replace(/[\s\-\(\)]/g, '');
    
    // Add Pakistan country code if not present
    if (phone.startsWith('03')) {
      phone = '92' + phone.substring(1);
    } else if (!phone.startsWith('+') && !phone.startsWith('92')) {
      phone = '92' + phone;
    }
    
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  // Copy agreement link
  const handleCopyLink = () => {
    if (!rental) return;
    
    const link = `${window.location.origin}/agreement/${rental.id}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success('Agreement link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  // Share via general WhatsApp (without pre-filled number)
  const handleWhatsAppGeneral = () => {
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const displayAgreementNumber = rental?.agreementNumber || rental?.id.toUpperCase() || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="animate-fade-in text-center py-12">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
          Agreement not found
        </h2>
        <Link to="/rentals">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rentals
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/rentals">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Agreement
              </h1>
              {editingAgreementNumber ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={agreementNumber}
                    onChange={(e) => setAgreementNumber(e.target.value)}
                    placeholder="Enter agreement number"
                    className="w-48 h-8 text-sm"
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-success" onClick={handleUpdateAgreementNumber}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => {
                    setEditingAgreementNumber(false);
                    setAgreementNumber(rental.agreementNumber || '');
                  }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button 
                  onClick={() => setEditingAgreementNumber(true)}
                  className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
                >
                  <span className="text-xl font-bold">#{displayAgreementNumber}</span>
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-muted-foreground">
              {rental.client.fullName} • {rental.vehicle.name}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* WhatsApp Share Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                className="bg-[#25D366] hover:bg-[#22c35e] text-white flex items-center gap-2 shadow-lg shadow-green-500/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Share Agreement</p>
                    <p className="text-xs text-muted-foreground">Send via WhatsApp</p>
                  </div>
                </div>
                
                {/* Send to Client */}
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 hover:border-green-400 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-green-700 dark:text-green-300 text-sm">Send to Client</p>
                    <p className="text-xs text-muted-foreground">{rental.client.phone}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Share to Any Contact */}
                <button
                  onClick={handleWhatsAppGeneral}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted border border-border hover:border-primary/30 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">Share to Anyone</p>
                    <p className="text-xs text-muted-foreground">Choose contact</p>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted border border-border hover:border-primary/30 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Copy className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">Copy Link</p>
                    <p className="text-xs text-muted-foreground">Share anywhere</p>
                  </div>
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF} 
            disabled={isDownloading}
            className="flex items-center gap-2"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isDownloading ? 'Saving...' : 'Save PDF'}</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDelete}
            className="text-destructive hover:bg-destructive/10 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-elevated p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Payment Status</h3>
            <div className="flex items-center gap-3">
              <span className={`${
                rental.paymentStatus === 'paid' ? 'badge-success' :
                rental.paymentStatus === 'partial' ? 'badge-warning' : 'badge-pending'
              } capitalize`}>
                {rental.paymentStatus}
              </span>
              <span className="text-muted-foreground">
                Balance: <span className="font-semibold text-foreground">{formatCurrency(rental.balance)}</span>
              </span>
            </div>
          </div>

          {rental.paymentStatus !== 'paid' && (
            <div className="flex flex-wrap gap-2">
              {editingPayment ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(parseInt(e.target.value) || 0)}
                    className="input-styled w-32 px-3 py-2 text-sm"
                    max={rental.totalAmount}
                  />
                  <Button size="sm" onClick={handleUpdatePayment} className="btn-accent-gradient">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingPayment(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingPayment(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Update Payment
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleMarkAsPaid}
                    className="btn-accent-gradient"
                  >
                    Mark as Paid
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="card-elevated overflow-hidden">
        <InvoicePreview rental={rental} />
      </div>
    </div>
  );
};

export default Invoice;