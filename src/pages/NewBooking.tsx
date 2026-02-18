import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Car, 
  Users, 
  CreditCard,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Check,
  Edit,
  ClipboardCheck,
  FileText,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VehicleSelector, VehicleSelection } from '@/components/VehicleSelector';
import { ImageUploadWithCamera } from '@/components/ImageUploadWithCamera';
import DateOnlyPicker from '@/components/DateOnlyPicker';
import TimeOnlyPicker from '@/components/TimeOnlyPicker';
import { AccessoriesChecklist, defaultAccessories, AccessoriesData } from '@/components/AccessoriesChecklist';
import { SignatureCanvas } from '@/components/SignatureCanvas';
import { VehicleConditionChecklist, defaultVehicleCondition, VehicleConditionData } from '@/components/VehicleConditionChecklist';
import { DentsScratchesReport, defaultDentsScratches, DentsScratchesData } from '@/components/DentsScratchesReport';
import { SmartPricingCalculator, defaultSmartPricing, SmartPricingData } from '@/components/SmartPricingCalculator';
import { SuccessDialog } from '@/components/SuccessDialog';
import { 
  formatCurrency 
} from '@/lib/storage';
import { getVehiclesOnce, addRentalToFirestore } from '@/lib/firestoreService';
import { saveBookingToR2, uploadToR2 } from '@/lib/r2Storage';
import { Client, Vehicle, Witness, RentType, PaymentStatus, Rental } from '@/types/rental';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Client', icon: User },
  { id: 2, title: 'Vehicle', icon: Car },
  { id: 3, title: 'Condition', icon: ClipboardCheck },
  { id: 4, title: 'Period', icon: Calendar },
  { id: 5, title: 'Witness', icon: Users },
  { id: 6, title: 'Payment', icon: CreditCard },
  { id: 7, title: 'Agreement', icon: FileText },
];

const NewBooking = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [duration, setDuration] = useState({ hours: 0, days: 0, weeks: 0, months: 0 });
  
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  const [client, setClient] = useState<Client>({
    id: '',
    fullName: '',
    cnic: '',
    phone: '',
    address: '',
  });
  
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleSelection, setVehicleSelection] = useState<VehicleSelection>({
    brand: '',
    model: '',
    year: '',
    color: '',
    logo: '',
  });
  
  const [rentalDetails, setRentalDetails] = useState({
    deliveryDate: '',
    deliveryTime: '',
    returnDate: '',
    returnTime: '',
    rentType: 'daily' as RentType,
    customDays: 0,
  });
  
  const [witness, setWitness] = useState<Witness>({
    name: '',
    cnic: '',
    phone: '',
    address: '',
  });
  
  const [payment, setPayment] = useState({
    totalAmount: 0,
    advancePayment: 0,
    balance: 0,
    paymentStatus: 'pending' as PaymentStatus,
    notes: '',
  });
  
  const [agreementNumber, setAgreementNumber] = useState('');
  
  const [accessories, setAccessories] = useState<AccessoriesData>(defaultAccessories);
  const [vehicleCondition, setVehicleCondition] = useState<VehicleConditionData>(defaultVehicleCondition);
  const [dentsScratches, setDentsScratches] = useState<DentsScratchesData>(defaultDentsScratches);
  const [clientSignature, setClientSignature] = useState('');
  const [ownerSignature, setOwnerSignature] = useState('');
  const [smartPricing, setSmartPricing] = useState<SmartPricingData>(defaultSmartPricing);
  const [showSuccess, setShowSuccess] = useState(false);
  const [vehicleImage, setVehicleImage] = useState('');

  useEffect(() => {
    const loadVehicles = async () => {
      const data = await getVehiclesOnce();
      setVehicles(data);
    };
    loadVehicles();
  }, []);

  useEffect(() => {
    if (rentalDetails.deliveryDate && rentalDetails.deliveryTime && 
        rentalDetails.returnDate && rentalDetails.returnTime) {
      const delivery = new Date(`${rentalDetails.deliveryDate}T${rentalDetails.deliveryTime}`);
      const returnD = new Date(`${rentalDetails.returnDate}T${rentalDetails.returnTime}`);
      const diffMs = returnD.getTime() - delivery.getTime();
      
      if (diffMs > 0) {
        const hours = Math.ceil(diffMs / (1000 * 60 * 60));
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const weeks = Math.max(1, Math.ceil(days / 7));
        const months = Math.max(1, Math.ceil(days / 30));
        
        setDuration({ hours, days: Math.max(1, days), weeks, months });
      }
    }
  }, [rentalDetails.deliveryDate, rentalDetails.deliveryTime, rentalDetails.returnDate, rentalDetails.returnTime]);

  const calculateDynamicPrice = (rentType: RentType): number => {
    const perDay = smartPricing.perDayPrice || (selectedVehicle?.dailyRate || 0);
    if (perDay <= 0) return 0;
    
    switch (rentType) {
      case 'hourly':
        return Math.round(perDay / 24) * duration.hours;
      case 'daily':
        return perDay * duration.days;
      case 'weekly':
        return perDay * 7 * duration.weeks;
      case 'monthly':
        return perDay * 30 * duration.months;
      case 'custom':
        return perDay * rentalDetails.customDays;
      default:
        return 0;
    }
  };

  useEffect(() => {
    if (!isManualOverride) {
      const perDay = smartPricing.perDayPrice;
      if (perDay > 0) {
        let total = 0;
        if (rentalDetails.rentType === 'custom' && rentalDetails.customDays > 0) {
          total = perDay * rentalDetails.customDays;
        } else if (rentalDetails.customDays > 0) {
          total = perDay * rentalDetails.customDays;
        } else if (duration.days > 0) {
          total = calculateDynamicPrice(rentalDetails.rentType);
        }
        
        setPayment(prev => ({
          ...prev,
          totalAmount: total,
          balance: total - prev.advancePayment,
        }));
      }
    }
  }, [smartPricing.perDayPrice, rentalDetails.rentType, rentalDetails.customDays, duration, isManualOverride]);

  useEffect(() => {
    setPayment(prev => ({
      ...prev,
      balance: prev.totalAmount - prev.advancePayment,
      paymentStatus: prev.advancePayment >= prev.totalAmount ? 'paid' : 
                     prev.advancePayment > 0 ? 'partial' : 'pending',
    }));
  }, [payment.advancePayment, payment.totalAmount]);

  const validateCNIC = (cnic: string): boolean => {
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    return cnicRegex.test(cnic);
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!client.fullName || !client.cnic || !client.phone || !client.address) {
          toast.error('Please fill all client details');
          return false;
        }
        if (!validateCNIC(client.cnic)) {
          toast.error('Invalid CNIC format. Use: 12345-1234567-1');
          return false;
        }
        return true;
      case 2:
        if (!vehicleSelection.brand || !vehicleSelection.model) {
          toast.error('Please select a vehicle brand and model');
          return false;
        }
        if (!vehicleSelection.year) {
          toast.error('Please enter the manufacturing year');
          return false;
        }
        if (!vehicleSelection.color) {
          toast.error('Please enter the car color');
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        if (!rentalDetails.deliveryDate || !rentalDetails.deliveryTime ||
            !rentalDetails.returnDate || !rentalDetails.returnTime) {
          toast.error('Please fill all rental period details');
          return false;
        }
        const delivery = new Date(`${rentalDetails.deliveryDate}T${rentalDetails.deliveryTime}`);
        const returnD = new Date(`${rentalDetails.returnDate}T${rentalDetails.returnTime}`);
        if (returnD <= delivery) {
          toast.error('Return date must be after delivery date');
          return false;
        }
        return true;
      case 5:
        if (!witness.name || !witness.cnic || !witness.phone || !witness.address) {
          toast.error('Please fill all witness details');
          return false;
        }
        if (!validateCNIC(witness.cnic)) {
          toast.error('Invalid witness CNIC format. Use: 12345-1234567-1');
          return false;
        }
        return true;
      case 6:
        if (payment.advancePayment < 0) {
          toast.error('Advance payment cannot be negative');
          return false;
        }
        return true;
      case 7:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      toast.error('Please complete all required fields');
      return;
    }
    
    const vehicleToUse = selectedVehicle || {
      id: generateId(),
      name: `${vehicleSelection.brand} ${vehicleSelection.model}`,
      type: 'Sedan',
      brand: vehicleSelection.brand,
      model: vehicleSelection.model,
      year: vehicleSelection.year,
      color: vehicleSelection.color,
      logo: vehicleSelection.logo,
      image: vehicleImage || '',
      hourlyRate: 500,
      dailyRate: smartPricing.perDayPrice || 3000,
      weeklyRate: (smartPricing.perDayPrice || 3000) * 7,
      monthlyRate: (smartPricing.perDayPrice || 3000) * 30,
    };

    setSubmitting(true);

    const vehicleWithImage = {
      ...vehicleToUse,
      image: vehicleImage || vehicleToUse.image,
    };

    const rentalData = {
      agreementNumber: agreementNumber || undefined,
      client: { ...client, id: client.id || generateId() },
      vehicle: vehicleWithImage,
      witness,
      deliveryDate: rentalDetails.deliveryDate,
      deliveryTime: rentalDetails.deliveryTime,
      returnDate: rentalDetails.returnDate,
      returnTime: rentalDetails.returnTime,
      rentType: rentalDetails.rentType,
      customDays: rentalDetails.customDays,
      totalAmount: payment.totalAmount,
      advancePayment: payment.advancePayment,
      balance: payment.balance,
      paymentStatus: payment.paymentStatus,
      createdAt: new Date().toISOString(),
      notes: payment.notes,
      accessories,
      vehicleCondition,
      dentsScratches,
      clientSignature,
      ownerSignature,
      smartPricing,
    };

    try {
      // Upload images to R2 first
      if (rentalData.client.photo) rentalData.client.photo = await uploadToR2(rentalData.client.photo, `clients/${rentalData.client.id}_photo.png`);
      if (rentalData.client.cnicFrontImage) rentalData.client.cnicFrontImage = await uploadToR2(rentalData.client.cnicFrontImage, `clients/${rentalData.client.id}_cnic_front.png`);
      if (rentalData.client.cnicBackImage) rentalData.client.cnicBackImage = await uploadToR2(rentalData.client.cnicBackImage, `clients/${rentalData.client.id}_cnic_back.png`);
      if (rentalData.vehicle.image) rentalData.vehicle.image = await uploadToR2(rentalData.vehicle.image, `vehicles/${rentalData.vehicle.id}.png`);
      if (rentalData.clientSignature) rentalData.clientSignature = await uploadToR2(rentalData.clientSignature, `signatures/${rentalData.client.id}_client.png`);
      if (rentalData.ownerSignature) rentalData.ownerSignature = await uploadToR2(rentalData.ownerSignature, `signatures/${rentalData.client.id}_owner.png`);

      // Save complete rental data to R2
      await saveBookingToR2(rentalData);

      // Also save to Firestore for indexing/listing
      const rentalId = await addRentalToFirestore(rentalData);
      setShowSuccess(true);
      localStorage.setItem('last_rental_id', rentalId);
    } catch (error: any) {
      console.error('Failed to save rental:', error);
      if (error?.code === 'permission-denied') {
        toast.error('Permission denied. Please make sure you are logged in.');
      } else {
        toast.error('Failed to save booking. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = (open: boolean) => {
    setShowSuccess(open);
    if (!open) {
      const lastRentalId = localStorage.getItem('last_rental_id');
      if (lastRentalId) {
        localStorage.removeItem('last_rental_id');
        navigate(`/agreement/${lastRentalId}`);
      }
    }
  };

  const formatCNICInput = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
  };

  const handleTotalAmountChange = (value: string) => {
    const amount = parseInt(value) || 0;
    setIsManualOverride(true);
    setPayment(prev => ({
      ...prev,
      totalAmount: amount,
      balance: amount - prev.advancePayment,
    }));
  };

  const handleAutoCalculate = () => {
    setIsManualOverride(false);
    if (duration.hours > 0) {
      const total = calculateDynamicPrice(rentalDetails.rentType);
      setPayment(prev => ({
        ...prev,
        totalAmount: total,
        balance: total - prev.advancePayment,
      }));
    }
  };

  const getDurationLabel = (): string => {
    const { hours, days, weeks, months } = duration;
    switch (rentalDetails.rentType) {
      case 'hourly': return `${hours} hour${hours !== 1 ? 's' : ''}`;
      case 'daily': return `${days} day${days !== 1 ? 's' : ''}`;
      case 'weekly': return `${weeks} week${weeks !== 1 ? 's' : ''}`;
      case 'monthly': return `${months} month${months !== 1 ? 's' : ''}`;
      case 'custom': return `${rentalDetails.customDays} day${rentalDetails.customDays !== 1 ? 's' : ''}`;
      default: return '';
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">New Booking</h1>
        <p className="text-primary-foreground/80">Create a new rental booking</p>
      </div>

      {/* Progress Steps */}
      <div className="card-elevated overflow-hidden mb-6">
        <div className="bg-primary p-4 text-white">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Booking Progress
          </h2>
        </div>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center min-w-max">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep === step.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : currentStep > step.id 
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 hidden md:block ${
                    currentStep >= step.id ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-4 md:w-8 lg:w-12 h-0.5 mx-1 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-success' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="card-elevated overflow-hidden">
        <div className="bg-primary p-4 text-white">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            {steps.find(s => s.id === currentStep)?.icon && 
              (() => {
                const Icon = steps.find(s => s.id === currentStep)!.icon;
                return <Icon className="w-5 h-5" />;
              })()
            }
            {steps.find(s => s.id === currentStep)?.title} Details
          </h2>
        </div>
        <div className="p-6 md:p-8">
          {/* Step 1: Client Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter client's full name"
                    value={client.fullName}
                    onChange={(e) => setClient({ ...client, fullName: e.target.value })}
                    className="input-styled"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnic">CNIC *</Label>
                  <Input
                    id="cnic"
                    placeholder="12345-1234567-1"
                    value={client.cnic}
                    onChange={(e) => setClient({ ...client, cnic: formatCNICInput(e.target.value) })}
                    maxLength={15}
                    className="input-styled"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="03XX-XXXXXXX"
                    value={client.phone}
                    onChange={(e) => setClient({ ...client, phone: e.target.value })}
                    className="input-styled"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="Enter complete address"
                    value={client.address}
                    onChange={(e) => setClient({ ...client, address: e.target.value })}
                    className="input-styled"
                  />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ImageUploadWithCamera
                  label="CNIC Front"
                  value={client.cnicFrontImage}
                  onChange={(img) => setClient({ ...client, cnicFrontImage: img })}
                />
                <ImageUploadWithCamera
                  label="CNIC Back"
                  value={client.cnicBackImage}
                  onChange={(img) => setClient({ ...client, cnicBackImage: img })}
                />
                <ImageUploadWithCamera
                  label="Client Photo"
                  value={client.photo}
                  onChange={(img) => setClient({ ...client, photo: img })}
                />
                <ImageUploadWithCamera
                  label="Driving License"
                  value={client.drivingLicenseImage}
                  onChange={(img) => setClient({ ...client, drivingLicenseImage: img })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Select Vehicle */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <VehicleSelector 
                value={vehicleSelection}
                onChange={(selection) => {
                  setVehicleSelection(selection);
                  const virtualVehicle: Vehicle = {
                    id: generateId(),
                    name: `${selection.brand} ${selection.model}`,
                    type: 'Sedan',
                    brand: selection.brand,
                    model: selection.model,
                    year: selection.year,
                    color: selection.color,
                    logo: selection.logo,
                    image: '',
                    hourlyRate: 500,
                    dailyRate: 3000,
                    weeklyRate: 15000,
                    monthlyRate: 50000,
                  };
                  setSelectedVehicle(virtualVehicle);
                }}
              />
            </div>
          )}

          {/* Step 3: Vehicle Condition */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-fade-in">
              <AccessoriesChecklist value={accessories} onChange={setAccessories} />
              <div className="border-t border-border pt-8">
                <VehicleConditionChecklist value={vehicleCondition} onChange={setVehicleCondition} />
              </div>
              <div className="border-t border-border pt-8">
                <DentsScratchesReport value={dentsScratches} onChange={setDentsScratches} />
              </div>
              <div className="border-t border-border pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Vehicle Photo</h3>
                    <p className="text-xs text-muted-foreground">Capture or upload vehicle image at handover</p>
                  </div>
                </div>
                <ImageUploadWithCamera label="Vehicle Image" value={vehicleImage} onChange={setVehicleImage} />
              </div>
            </div>
          )}

          {/* Step 4: Rental Period */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-5 border border-emerald-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground">Delivery Details</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Delivery Date</Label>
                    <DateOnlyPicker 
                      date={rentalDetails.deliveryDate ? new Date(rentalDetails.deliveryDate) : undefined} 
                      onDateChange={(date) => {
                        const val = date ? date.toISOString().split('T')[0] : '';
                        setRentalDetails(prev => ({ ...prev, deliveryDate: val }));
                      }} 
                      label="Delivery Date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Time</Label>
                    <TimeOnlyPicker 
                      time={rentalDetails.deliveryTime} 
                      onTimeChange={(val) => {
                        setRentalDetails(prev => ({ ...prev, deliveryTime: val }));
                      }} 
                      label="Delivery Time"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl p-5 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground">Return Details</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Return Date</Label>
                    <DateOnlyPicker 
                      date={rentalDetails.returnDate ? new Date(rentalDetails.returnDate) : undefined} 
                      onDateChange={(date) => {
                        const val = date ? date.toISOString().split('T')[0] : '';
                        setRentalDetails(prev => ({ ...prev, returnDate: val }));
                      }} 
                      label="Return Date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Return Time</Label>
                    <TimeOnlyPicker 
                      time={rentalDetails.returnTime} 
                      onTimeChange={(val) => {
                        setRentalDetails(prev => ({ ...prev, returnTime: val }));
                      }} 
                      label="Return Time"
                    />
                  </div>
                </div>
              </div>

              <SmartPricingCalculator value={smartPricing} onChange={setSmartPricing} />
            </div>
          )}

          {/* Step 5: Witness Details */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="witnessName">Witness Name *</Label>
                  <Input id="witnessName" placeholder="Enter witness name" value={witness.name} onChange={(e) => setWitness({ ...witness, name: e.target.value })} className="input-styled" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="witnessCnic">Witness CNIC *</Label>
                  <Input id="witnessCnic" placeholder="12345-1234567-1" value={witness.cnic} onChange={(e) => setWitness({ ...witness, cnic: formatCNICInput(e.target.value) })} maxLength={15} className="input-styled" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="witnessPhone">Witness Phone *</Label>
                  <Input id="witnessPhone" placeholder="03XX-XXXXXXX" value={witness.phone} onChange={(e) => setWitness({ ...witness, phone: e.target.value })} className="input-styled" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="witnessAddress">Witness Address *</Label>
                  <Input id="witnessAddress" placeholder="Enter complete address" value={witness.address} onChange={(e) => setWitness({ ...witness, address: e.target.value })} className="input-styled" />
                </div>
              </div>
              <div className="max-w-md">
                <ImageUploadWithCamera label="Witness Photo (Optional)" value={witness.image} onChange={(img) => setWitness({ ...witness, image: img })} />
              </div>
            </div>
          )}

          {/* Step 6: Payment */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="agreementNumber" className="text-base font-semibold">Agreement Number</Label>
                    <p className="text-xs text-muted-foreground">Custom agreement/invoice number (optional)</p>
                  </div>
                </div>
                <Input id="agreementNumber" placeholder="e.g., AGR-2024-001" value={agreementNumber} onChange={(e) => setAgreementNumber(e.target.value)} className="input-styled font-medium" />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(payment.totalAmount)}</p>
                </div>
                <div className="bg-success/10 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Advance Payment</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(payment.advancePayment)}</p>
                </div>
                <div className="bg-destructive/10 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Balance Due</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(payment.balance)}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="editTotalAmount">Total Amount (Editable)</Label>
                  <Input id="editTotalAmount" type="number" min="0" value={payment.totalAmount} onChange={(e) => handleTotalAmountChange(e.target.value)} className="input-styled" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advancePayment">Advance Payment Amount</Label>
                  <Input id="advancePayment" type="number" min="0" max={payment.totalAmount} value={payment.advancePayment} onChange={(e) => setPayment({ ...payment, advancePayment: parseInt(e.target.value) || 0 })} className="input-styled" />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Payment Status</Label>
                <div className="flex flex-wrap gap-3">
                  {(['pending', 'partial', 'paid'] as PaymentStatus[]).map((status) => (
                    <button key={status} type="button" onClick={() => setPayment({ ...payment, paymentStatus: status })} className={`px-4 py-2 rounded-lg border capitalize transition-all duration-200 ${payment.paymentStatus === status ? status === 'paid' ? 'border-success bg-success/10 text-success font-medium' : status === 'partial' ? 'border-warning bg-warning/10 text-warning font-medium' : 'border-destructive bg-destructive/10 text-destructive font-medium' : 'border-border hover:border-muted-foreground'}`}>{status}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" placeholder="Any additional notes..." value={payment.notes} onChange={(e) => setPayment({ ...payment, notes: e.target.value })} className="input-styled min-h-24" />
              </div>
            </div>
          )}

          {/* Step 7: Agreement & Signatures */}
          {currentStep === 7 && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6">
                <SignatureCanvas label="Client Signature" urduLabel="کرایہ دار کے دستخط" value={clientSignature} onChange={setClientSignature} />
                <SignatureCanvas label="Owner Signature" urduLabel="مالک کے دستخط" value={ownerSignature} onChange={setOwnerSignature} />
              </div>
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-primary/20">
                <h3 className="font-semibold text-foreground mb-4">Booking Summary</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Client</p><p className="font-medium text-foreground">{client.fullName}</p></div>
                  <div><p className="text-muted-foreground">Vehicle</p><p className="font-medium text-foreground">{vehicleSelection.brand} {vehicleSelection.model}</p></div>
                  <div><p className="text-muted-foreground">Total Amount</p><p className="font-medium text-foreground">{formatCurrency(payment.totalAmount)}</p></div>
                  <div><p className="text-muted-foreground">Balance Due</p><p className="font-medium text-destructive">{formatCurrency(payment.balance)}</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
            {currentStep < 7 ? (
              <Button onClick={handleNext} className="btn-primary-gradient">Next <ArrowRight className="w-4 h-4 ml-2" /></Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="btn-primary-gradient px-8">
                {submitting ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Complete Booking</>}
              </Button>
            )}
          </div>
        </div>
      </div>

      <SuccessDialog open={showSuccess} onOpenChange={handleSuccessClose} />
    </div>
  );
};

export default NewBooking;
