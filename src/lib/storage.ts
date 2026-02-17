import { Rental, Vehicle } from '@/types/rental';

const RENTALS_KEY = 'yousif_sons_rentals';
const VEHICLES_KEY = 'yousif_sons_vehicles';

export const defaultVehicles: Vehicle[] = [
  {
    id: '1',
    name: 'Toyota Corolla 2024',
    type: 'Sedan',
    brand: 'Toyota',
    model: 'Corolla',
    image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400&h=300&fit=crop',
    dailyRate: 5000,
    hourlyRate: 500,
    weeklyRate: 30000,
    monthlyRate: 100000,
  },
  {
    id: '2',
    name: 'Honda Civic 2024',
    type: 'Sedan',
    brand: 'Honda',
    model: 'Civic',
    image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400&h=300&fit=crop',
    dailyRate: 5500,
    hourlyRate: 550,
    weeklyRate: 33000,
    monthlyRate: 110000,
  },
  {
    id: '3',
    name: 'Toyota Fortuner 2024',
    type: 'SUV',
    brand: 'Toyota',
    model: 'Fortuner',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop',
    dailyRate: 12000,
    hourlyRate: 1200,
    weeklyRate: 70000,
    monthlyRate: 250000,
  },
  {
    id: '4',
    name: 'Suzuki Cultus 2024',
    type: 'Hatchback',
    brand: 'Suzuki',
    model: 'Cultus',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
    dailyRate: 3000,
    hourlyRate: 300,
    weeklyRate: 18000,
    monthlyRate: 60000,
  },
  {
    id: '5',
    name: 'Toyota Prado 2024',
    type: 'SUV',
    brand: 'Toyota',
    model: 'Prado',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop',
    dailyRate: 15000,
    hourlyRate: 1500,
    weeklyRate: 90000,
    monthlyRate: 320000,
  },
  {
    id: '6',
    name: 'Honda City 2024',
    type: 'Sedan',
    brand: 'Honda',
    model: 'City',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop',
    dailyRate: 4500,
    hourlyRate: 450,
    weeklyRate: 27000,
    monthlyRate: 90000,
  },
];

export const getRentals = (): Rental[] => {
  try {
    const data = localStorage.getItem(RENTALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveRental = (rental: Rental): void => {
  const rentals = getRentals();
  rentals.push(rental);
  localStorage.setItem(RENTALS_KEY, JSON.stringify(rentals));
};

export const updateRental = (rental: Rental): void => {
  const rentals = getRentals();
  const index = rentals.findIndex(r => r.id === rental.id);
  if (index !== -1) {
    rentals[index] = rental;
    localStorage.setItem(RENTALS_KEY, JSON.stringify(rentals));
  }
};

export const deleteRental = (id: string): void => {
  const rentals = getRentals().filter(r => r.id !== id);
  localStorage.setItem(RENTALS_KEY, JSON.stringify(rentals));
};

export const getVehicles = (): Vehicle[] => {
  try {
    const data = localStorage.getItem(VEHICLES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Initialize with default vehicles
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(defaultVehicles));
    return defaultVehicles;
  } catch {
    return defaultVehicles;
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const calculateRentalAmount = (
  vehicle: Vehicle,
  rentType: string,
  deliveryDate: string,
  deliveryTime: string,
  returnDate: string,
  returnTime: string,
  customDays?: number
): number => {
  const delivery = new Date(`${deliveryDate}T${deliveryTime}`);
  const returnD = new Date(`${returnDate}T${returnTime}`);
  const diffMs = returnD.getTime() - delivery.getTime();
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  switch (rentType) {
    case 'hourly':
      return vehicle.hourlyRate * diffHours;
    case 'daily':
      return vehicle.dailyRate * Math.max(1, diffDays);
    case 'weekly':
      return vehicle.weeklyRate * Math.max(1, Math.ceil(diffDays / 7));
    case 'monthly':
      return vehicle.monthlyRate * Math.max(1, Math.ceil(diffDays / 30));
    case 'custom':
      return vehicle.dailyRate * (customDays || 1);
    default:
      return 0;
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
