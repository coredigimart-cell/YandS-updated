import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { db, app } from './firebase';

// Use the singleton instance from firebase.ts
const firestore = db;

import { Rental, Vehicle } from '@/types/rental';

// Collection references
const RENTALS_COLLECTION = 'rentals';
const VEHICLES_COLLECTION = 'vehicles';

// Use the new firestore instance
export const subscribeToRentals = (callback: (rentals: Rental[]) => void) => {
  const q = query(collection(firestore, RENTALS_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const rentals: Rental[] = [];
    snapshot.forEach((doc) => {
      rentals.push({ id: doc.id, ...doc.data() } as Rental);
    });
    callback(rentals);
  }, (error) => {
    console.error('Error fetching rentals:', error);
    callback([]);
  });
};

export const addRentalToFirestore = async (rental: Omit<Rental, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, RENTALS_COLLECTION), {
      ...rental,
      createdAt: rental.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding rental:', error);
    throw error;
  }
};

export const updateRentalInFirestore = async (id: string, rental: Partial<Rental>): Promise<void> => {
  try {
    const docRef = doc(db, RENTALS_COLLECTION, id);
    await updateDoc(docRef, {
      ...rental,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating rental:', error);
    throw error;
  }
};

export const deleteRentalFromFirestore = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, RENTALS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting rental:', error);
    throw error;
  }
};

// ============ VEHICLES ============

export const subscribeToVehicles = (callback: (vehicles: Vehicle[]) => void) => {
  const q = query(collection(db, VEHICLES_COLLECTION));
  
  return onSnapshot(q, (snapshot) => {
    const vehicles: Vehicle[] = [];
    snapshot.forEach((doc) => {
      vehicles.push({ id: doc.id, ...doc.data() } as Vehicle);
    });
    callback(vehicles);
  }, (error) => {
    console.error('Error fetching vehicles:', error);
    callback([]);
  });
};

export const addVehicleToFirestore = async (vehicle: Omit<Vehicle, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), {
      ...vehicle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    throw error;
  }
};

export const updateVehicleInFirestore = async (id: string, vehicle: Partial<Vehicle>): Promise<void> => {
  try {
    const docRef = doc(db, VEHICLES_COLLECTION, id);
    await updateDoc(docRef, {
      ...vehicle,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

export const deleteVehicleFromFirestore = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, VEHICLES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

// ============ FETCH ONCE (for components that don't need real-time) ============

export const getRentalsOnce = async (): Promise<Rental[]> => {
  try {
    const q = query(collection(db, RENTALS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const rentals: Rental[] = [];
    snapshot.forEach((doc) => {
      rentals.push({ id: doc.id, ...doc.data() } as Rental);
    });
    return rentals;
  } catch (error) {
    console.error('Error getting rentals:', error);
    return [];
  }
};

export const getVehiclesOnce = async (): Promise<Vehicle[]> => {
  try {
    const snapshot = await getDocs(collection(db, VEHICLES_COLLECTION));
    const vehicles: Vehicle[] = [];
    snapshot.forEach((doc) => {
      vehicles.push({ id: doc.id, ...doc.data() } as Vehicle);
    });
    return vehicles;
  } catch (error) {
    console.error('Error getting vehicles:', error);
    return [];
  }
};
