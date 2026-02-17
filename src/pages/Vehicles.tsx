import { useState, useEffect } from 'react';
import { 
  Car, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  Camera,
  Upload,
  Palette,
  Calendar as CalendarIcon,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ImageUploadWithCamera } from '@/components/ImageUploadWithCamera';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/storage';
import { 
  subscribeToVehicles, 
  addVehicleToFirestore, 
  updateVehicleInFirestore, 
  deleteVehicleFromFirestore 
} from '@/lib/firestoreService';
import { Vehicle } from '@/types/rental';

const carBrands = [
  { name: 'Toyota', logo: 'https://www.carlogos.org/car-logos/toyota-logo.png' },
  { name: 'Honda', logo: 'https://www.carlogos.org/car-logos/honda-logo.png' },
  { name: 'Suzuki', logo: 'https://www.carlogos.org/car-logos/suzuki-logo.png' },
  { name: 'Hyundai', logo: 'https://www.carlogos.org/car-logos/hyundai-logo.png' },
  { name: 'Kia', logo: 'https://www.carlogos.org/car-logos/kia-logo.png' },
  { name: 'Mercedes', logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
  { name: 'BMW', logo: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
  { name: 'Audi', logo: 'https://www.carlogos.org/car-logos/audi-logo.png' },
];

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    color: '',
    logo: '',
    image: '',
    dailyRate: 3000,
    hourlyRate: 300,
    weeklyRate: 18000,
    monthlyRate: 60000,
  });

  useEffect(() => {
    // Subscribe to real-time vehicles from Firestore
    const unsubscribe = subscribeToVehicles((data) => {
      setVehicles(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      year: '',
      color: '',
      logo: '',
      image: '',
      dailyRate: 3000,
      hourlyRate: 300,
      weeklyRate: 18000,
      monthlyRate: 60000,
    });
    setEditingVehicle(null);
  };

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        color: vehicle.color || '',
        logo: vehicle.logo || '',
        image: vehicle.image || '',
        dailyRate: vehicle.dailyRate || 3000,
        hourlyRate: vehicle.hourlyRate || 300,
        weeklyRate: vehicle.weeklyRate || 18000,
        monthlyRate: vehicle.monthlyRate || 60000,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleBrandSelect = (brand: typeof carBrands[0]) => {
    setFormData(prev => ({
      ...prev,
      brand: brand.name,
      logo: brand.logo,
    }));
  };

  const handleSave = async () => {
    if (!formData.brand || !formData.model) {
      toast.error('Please enter brand and model');
      return;
    }

    setSaving(true);

    try {
      let imageUrl = formData.image;
      
      // If image is a base64 string, upload to Firebase Storage
      if (formData.image && formData.image.startsWith('data:image')) {
        const tempId = editingVehicle?.id || `new_${Date.now()}`;
        const imagePath = getVehicleImagePath(tempId);
        imageUrl = await uploadBase64Image(formData.image, imagePath);
      }

      const vehicleData = {
        name: `${formData.brand} ${formData.model} ${formData.year}`.trim(),
        type: 'Sedan',
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        logo: formData.logo,
        image: imageUrl,
        dailyRate: formData.dailyRate,
        hourlyRate: formData.hourlyRate,
        weeklyRate: formData.weeklyRate,
        monthlyRate: formData.monthlyRate,
      };

      if (editingVehicle) {
        await updateVehicleInFirestore(editingVehicle.id, vehicleData);
        toast.success('Vehicle updated successfully');
      } else {
        await addVehicleToFirestore(vehicleData);
        toast.success('Vehicle added successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      if (error?.code === 'permission-denied') {
        toast.error('Permission denied. Please check Firebase Storage rules.');
      } else {
        toast.error('Failed to save vehicle');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVehicleFromFirestore(id);
      toast.success('Vehicle deleted');
    } catch (error) {
      toast.error('Failed to delete vehicle');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Vehicles</h1>
            <p className="text-primary-foreground/80">Manage your fleet</p>
          </div>
          <Button 
            onClick={() => handleOpenDialog()}
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="card-elevated overflow-hidden text-center">
          <div className="bg-primary p-4 text-white">
            <h3 className="text-xl font-semibold">No Vehicles Added</h3>
          </div>
          <div className="p-12">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Car className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-6">Start by adding your first vehicle to the fleet</p>
            <Button onClick={() => handleOpenDialog()} className="btn-primary-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Vehicle
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div 
              key={vehicle.id}
              className="card-elevated overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              {/* Vehicle Image */}
              <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50">
                {vehicle.image ? (
                  <img 
                    src={vehicle.image} 
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-16 h-16 text-muted-foreground/50" />
                  </div>
                )}
                
                {/* Brand Logo */}
                {vehicle.logo && (
                  <div className="absolute top-3 left-3 w-12 h-12 bg-white rounded-xl shadow-lg p-2 flex items-center justify-center">
                    <img 
                      src={vehicle.logo} 
                      alt={vehicle.brand}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button 
                    size="sm"
                    onClick={() => handleOpenDialog(vehicle)}
                    className="bg-white text-foreground hover:bg-white/90"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{vehicle.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  {vehicle.color && (
                    <span className="flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      {vehicle.color}
                    </span>
                  )}
                  {vehicle.year && (
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {vehicle.year}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Daily Rate</span>
                  <span className="font-bold text-primary">{formatCurrency(vehicle.dailyRate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="bg-gradient-to-r from-primary to-accent p-4 text-white sticky top-0 z-10">
            <DialogTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm">
              {editingVehicle ? 'Update vehicle details and pricing' : 'Add a new vehicle to your fleet'}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Brand Selection */}
            <div className="space-y-3">
              <Label>Select Brand</Label>
              <div className="grid grid-cols-4 gap-3">
                {carBrands.map((brand) => (
                  <button
                    key={brand.name}
                    type="button"
                    onClick={() => handleBrandSelect(brand)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      formData.brand === brand.name
                        ? 'border-primary bg-primary/10 shadow-lg scale-105'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-xs font-medium">{brand.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Model & Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Brand Name</Label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="e.g. Toyota"
                />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="e.g. Corolla"
                />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="e.g. 2024"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="e.g. White"
                />
              </div>
            </div>

            {/* Vehicle Photo */}
            <div className="space-y-3">
              <Label>Vehicle Photo</Label>
              <ImageUploadWithCamera
                label="Vehicle Image"
                value={formData.image}
                onChange={(img) => setFormData(prev => ({ ...prev, image: img }))}
              />
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing (PKR)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">Hourly Rate</span>
                  <Input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">Daily Rate</span>
                  <Input
                    type="number"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">Weekly Rate</span>
                  <Input
                    type="number"
                    value={formData.weeklyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, weeklyRate: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">Monthly Rate</span>
                  <Input
                    type="number"
                    value={formData.monthlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyRate: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 btn-primary-gradient"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : editingVehicle ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vehicles;
