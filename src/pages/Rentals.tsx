import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Trash2, Car } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/storage';
import { subscribeToRentals, deleteRentalFromFirestore } from '@/lib/firestoreService';
import { Rental } from '@/types/rental';
import { AgreementPreviewDialog } from '@/components/AgreementPreviewDialog';
import { toast } from 'sonner';

const Rentals = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [previewRental, setPreviewRental] = useState<Rental | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time rentals from Firestore
    const unsubscribe = subscribeToRentals((data) => {
      setRentals(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = rentals;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.client?.fullName?.toLowerCase().includes(query) ||
        r.client?.cnic?.includes(query) ||
        r.vehicle?.name?.toLowerCase().includes(query) ||
        r.id?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.paymentStatus === statusFilter);
    }

    // Sort by date (newest first)
    filtered = [...filtered].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredRentals(filtered);
  }, [searchQuery, statusFilter, rentals]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this rental?')) {
      try {
        await deleteRentalFromFirestore(id);
        toast.success('Rental deleted successfully');
      } catch (error) {
        toast.error('Failed to delete rental');
      }
    }
  };

  const handleViewAgreement = (rental: Rental) => {
    setPreviewRental(rental);
    setShowPreview(true);
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
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">All Rentals</h1>
        <p className="text-primary-foreground/80">View and manage all rental records</p>
      </div>

      {/* Filters */}
      <div className="card-elevated overflow-hidden mb-6">
        <div className="bg-primary p-4 text-white">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </h2>
        </div>
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, CNIC, vehicle, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-styled"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredRentals.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">No rentals found</h3>
          <p className="text-muted-foreground mb-6">
            {rentals.length === 0 
              ? "You haven't created any rentals yet." 
              : "No rentals match your search criteria."}
          </p>
          <Link to="/new-booking">
            <Button className="btn-accent-gradient">Create New Booking</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-6 py-4 text-left">Client</th>
                    <th className="px-6 py-4 text-left">Vehicle</th>
                    <th className="px-6 py-4 text-left">Rental Period</th>
                    <th className="px-6 py-4 text-left">Amount</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRentals.map((rental) => (
                    <tr key={rental.id} className="hover:bg-muted/30 transition-colors animate-fade-in">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{rental.client.fullName}</p>
                          <p className="text-sm text-muted-foreground">{rental.client.cnic}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <Car className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{rental.vehicle.name}</p>
                            <p className="text-sm text-muted-foreground">{rental.vehicle.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">{formatDate(rental.deliveryDate)}</p>
                        <p className="text-sm text-muted-foreground">to {formatDate(rental.returnDate)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{formatCurrency(rental.totalAmount)}</p>
                        <p className="text-sm text-muted-foreground">
                          Balance: {formatCurrency(rental.balance)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${
                          rental.paymentStatus === 'paid' ? 'badge-success' :
                          rental.paymentStatus === 'partial' ? 'badge-warning' : 'badge-pending'
                        } capitalize`}>
                          {rental.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewAgreement(rental)}
                            className="hover:bg-primary/10 hover:text-primary"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(rental.id)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredRentals.map((rental) => (
              <div key={rental.id} className="card-elevated p-4 animate-slide-up">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Car className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{rental.client.fullName}</p>
                    <p className="text-sm text-muted-foreground">{rental.vehicle.name}</p>
                  </div>
                  <span className={`${
                    rental.paymentStatus === 'paid' ? 'badge-success' :
                    rental.paymentStatus === 'partial' ? 'badge-warning' : 'badge-pending'
                  } capitalize text-xs`}>
                    {rental.paymentStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Period</p>
                    <p className="font-medium">{formatDate(rental.deliveryDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">{formatCurrency(rental.totalAmount)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewAgreement(rental)}
                  >
                    <Eye className="w-4 h-4 mr-2" /> View Agreement
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDelete(rental.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 text-center text-muted-foreground">
            Showing {filteredRentals.length} of {rentals.length} rentals
          </div>
        </>
      )}

      {/* Agreement Preview Dialog */}
      <AgreementPreviewDialog 
        rental={previewRental}
        open={showPreview}
        onOpenChange={setShowPreview}
      />
    </div>
  );
};

export default Rentals;
