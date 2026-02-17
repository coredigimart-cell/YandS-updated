import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Car, Phone, MapPin, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getRentals, formatCurrency } from '@/lib/storage';
import { generateAllClientsPDF } from '@/lib/pdfGenerator';
import { Rental } from '@/types/rental';

interface ClientSummary {
  cnic: string;
  fullName: string;
  phone: string;
  address: string;
  photo?: string;
  totalRentals: number;
  totalSpent: number;
  lastRental: string;
  rentals: Rental[];
}

const Clients = () => {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allRentals, setAllRentals] = useState<Rental[]>([]);

  useEffect(() => {
    const rentals = getRentals();
    setAllRentals(rentals);
    const clientMap = new Map<string, ClientSummary>();

    rentals.forEach((rental) => {
      const existing = clientMap.get(rental.client.cnic);
      if (existing) {
        existing.totalRentals += 1;
        existing.totalSpent += rental.totalAmount;
        if (new Date(rental.createdAt) > new Date(existing.lastRental)) {
          existing.lastRental = rental.createdAt;
        }
        existing.rentals.push(rental);
      } else {
        clientMap.set(rental.client.cnic, {
          cnic: rental.client.cnic,
          fullName: rental.client.fullName,
          phone: rental.client.phone,
          address: rental.client.address,
          photo: rental.client.photo,
          totalRentals: 1,
          totalSpent: rental.totalAmount,
          lastRental: rental.createdAt,
          rentals: [rental],
        });
      }
    });

    const clientList = Array.from(clientMap.values()).sort((a, b) => 
      new Date(b.lastRental).getTime() - new Date(a.lastRental).getTime()
    );

    setClients(clientList);
    setFilteredClients(clientList);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredClients(
        clients.filter(c => 
          c.fullName.toLowerCase().includes(query) ||
          c.cnic.includes(query) ||
          c.phone.includes(query)
        )
      );
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Clients</h1>
          <p className="text-primary-foreground/80">View all your clients and their rental history</p>
        </div>
        {clients.length > 0 && (
          <Button 
            onClick={() => generateAllClientsPDF(allRentals)}
            className="btn-accent-gradient flex items-center gap-2 w-full md:w-auto"
          >
            <Download className="w-4 h-4" />
            Export All Clients PDF
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="card-elevated overflow-hidden mb-6">
        <div className="bg-primary p-4 text-white">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Client
          </h2>
        </div>
        <div className="p-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, CNIC, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-styled"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredClients.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">No clients found</h3>
          <p className="text-muted-foreground mb-6">
            {clients.length === 0 
              ? "You don't have any clients yet. Create your first booking!" 
              : "No clients match your search criteria."}
          </p>
          <Link to="/new-booking">
            <Button className="btn-accent-gradient">Create New Booking</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredClients.map((client) => (
            <div key={client.cnic} className="card-elevated p-6 animate-slide-up">
              <div className="flex items-start gap-4 mb-4">
                {client.photo ? (
                  <img 
                    src={client.photo} 
                    alt={client.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-accent"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground truncate">
                    {client.fullName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{client.cnic}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{client.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Car className="w-4 h-4" />
                    <span className="text-xs">Rentals</span>
                  </div>
                  <p className="font-semibold text-foreground">{client.totalRentals}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
                  <p className="font-semibold text-accent">{formatCurrency(client.totalSpent)}</p>
                </div>
              </div>

              {/* Recent Rentals */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Recent Rentals</p>
                <div className="space-y-2">
                  {client.rentals.slice(0, 2).map((rental) => (
                    <Link
                      key={rental.id}
                      to={`/invoice/${rental.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <img 
                        src={rental.vehicle.image} 
                        alt={rental.vehicle.name}
                        className="w-10 h-7 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {rental.vehicle.name}
                        </p>
                      </div>
                      <span className={`text-xs ${
                        rental.paymentStatus === 'paid' ? 'badge-success' :
                        rental.paymentStatus === 'partial' ? 'badge-warning' : 'badge-pending'
                      }`}>
                        {rental.paymentStatus}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredClients.length > 0 && (
        <div className="mt-6 text-center text-muted-foreground">
          Showing {filteredClients.length} of {clients.length} clients
        </div>
      )}
    </div>
  );
};

export default Clients;
