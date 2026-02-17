export interface Client {
  id: string;
  fullName: string;
  cnic: string;
  phone: string;
  address: string;
  cnicFrontImage?: string;
  cnicBackImage?: string;
  photo?: string;
  drivingLicenseImage?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  year?: string;
  color?: string;
  logo?: string;
  image: string;
  dailyRate: number;
  hourlyRate: number;
  weeklyRate: number;
  monthlyRate: number;
}

export interface Witness {
  name: string;
  cnic: string;
  phone: string;
  address: string;
  image?: string;
}

export type RentType = 'daily' | 'hourly' | 'weekly' | 'monthly' | 'custom';
export type PaymentStatus = 'paid' | 'pending' | 'partial';

// Accessories Checklist
export interface AccessoriesData {
  engineOil: boolean;
  battery: boolean;
  carCharger: boolean;
  petrol: boolean;
  brakeOil: boolean;
  tapLcd: boolean;
  spareWheel: boolean;
  wheelCap: boolean;
  lights: boolean;
  jackPana: boolean;
  shades: boolean;
}

// Vehicle Condition
export interface VehicleConditionData {
  tyresCondition: 'good' | 'bad' | '';
  tyrePressure: 'good' | 'bad' | '';
  scratchesDents: 'yes' | 'no' | '';
  frontBumper: 'good' | 'bad' | '';
  backBumper: 'good' | 'bad' | '';
  sideMirrors: 'good' | 'bad' | '';
  windowsGlass: 'good' | 'bad' | '';
  acWorking: 'yes' | 'no' | '';
  heaterWorking: 'yes' | 'no' | '';
  horn: 'good' | 'bad' | '';
  wipers: 'good' | 'bad' | '';
  seatCondition: 'good' | 'bad' | '';
  seatBelts: 'good' | 'bad' | '';
  fuelLevel: 'empty' | 'half' | 'full' | '';
  mileage: string;
  radiator: 'good' | 'bad' | '';
}

// Dents & Scratches Report
export interface DentsScratchesData {
  notes: string;
  images: string[];
}

// Smart Pricing
export interface SmartPricingData {
  perDayPrice: number;
  customDays: number;
  savedPrices: number[];
}

export interface Rental {
  id: string;
  agreementNumber?: string;
  client: Client;
  vehicle: Vehicle;
  witness: Witness;
  deliveryDate: string;
  deliveryTime: string;
  returnDate: string;
  returnTime: string;
  rentType: RentType;
  customDays?: number;
  totalAmount: number;
  advancePayment: number;
  balance: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  notes?: string;
  // New fields
  accessories?: AccessoriesData;
  vehicleCondition?: VehicleConditionData;
  dentsScratches?: DentsScratchesData;
  clientSignature?: string;
  ownerSignature?: string;
  smartPricing?: SmartPricingData;
}

export interface DashboardStats {
  totalIncome: number;
  pendingPayments: number;
  activeRentals: number;
  totalClients: number;
}
