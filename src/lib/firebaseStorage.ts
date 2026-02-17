import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload an image to Firebase Storage
 * @param file - File or Blob to upload
 * @param path - Storage path (e.g., 'vehicles/vehicle-id.jpg')
 * @returns Download URL of the uploaded image
 */
export const uploadImage = async (file: File | Blob, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Upload a base64 image to Firebase Storage
 * @param base64String - Base64 encoded image string (data:image/...)
 * @param path - Storage path (e.g., 'vehicles/vehicle-id.jpg')
 * @returns Download URL of the uploaded image
 */
export const uploadBase64Image = async (base64String: string, path: string): Promise<string> => {
  try {
    // If it's already a URL, return it
    if (base64String.startsWith('http')) return base64String;

    // Extract the base64 data (remove data:image/xxx;base64, prefix if it exists)
    let contentType = 'image/jpeg';
    let base64Data = base64String;

    if (base64String.includes(';base64,')) {
      const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        contentType = matches[1];
        base64Data = matches[2];
      }
    }
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    
    // Upload the blob
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    throw error;
  }
};

/**
 * Delete an image from Firebase Storage
 * @param path - Storage path of the image to delete
 */
export const deleteImage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - file might not exist
  }
};

/**
 * Generate a unique storage path for vehicle images
 * @param vehicleId - Vehicle ID
 * @param fileName - Original file name or extension
 * @returns Storage path
 */
export const getVehicleImagePath = (vehicleId: string, fileName: string = 'image.jpg'): string => {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop() || 'jpg';
  return `vehicles/${vehicleId}_${timestamp}.${extension}`;
};

/**
 * Generate a unique storage path for rental/booking images
 * @param rentalId - Rental ID
 * @param imageType - Type of image (cnic-front, cnic-back, client-photo, etc.)
 * @returns Storage path
 */
export const getRentalImagePath = (rentalId: string, imageType: string): string => {
  const timestamp = Date.now();
  return `rentals/${rentalId}/${imageType}_${timestamp}.jpg`;
};
