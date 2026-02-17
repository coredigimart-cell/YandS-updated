import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  Clock, 
  Car, 
  Users, 
  PlusCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { formatCurrency, formatDate } from '@/lib/storage';
import { subscribeToRentals } from '@/lib/firestoreService';
import { Rental, DashboardStats } from '@/types/rental';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    pendingPayments: 0,
    activeRentals: 0,
    totalClients: 0,
  });
  const [recentRentals, setRecentRentals] = useState<Rental[]>([]);
  const [upcomingReturns, setUpcomingReturns] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Subscribe to real-time rentals from Firestore
    const unsubscribe = subscribeToRentals((rentals) => {
      if (!isMounted) return;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      try {
        // Use a timeout to offload heavy calculations from the main thread if needed
        // but since we are in React, we just want to ensure we don't block.
        // For now, let's optimize the filter/reduce logic.
        
        let totalIncome = 0;
        let pendingPayments = 0;
        const activeRentalsList: Rental[] = [];
        const uniqueClientsSet = new Set<string>();

        const next7Days = new Date();
        next7Days.setDate(next7Days.getDate() + 7);
        const upcomingReturnsList: Rental[] = [];

        for (const r of rentals) {
          totalIncome += (r.advancePayment || 0);
          if (r.paymentStatus !== 'paid') {
            pendingPayments += (r.balance || 0);
          }
          
          if (r.client?.cnic) {
            uniqueClientsSet.add(r.client.cnic);
          }

          if (r.returnDate) {
            const returnDate = new Date(r.returnDate);
            if (returnDate >= today) {
              activeRentalsList.push(r);
              if (returnDate <= next7Days) {
                upcomingReturnsList.push(r);
              }
            }
          }
        }

        setStats({
          totalIncome,
          pendingPayments,
          activeRentals: activeRentalsList.length,
          totalClients: uniqueClientsSet.size,
        });

        setRecentRentals(rentals.slice(0, 5));
        
        upcomingReturnsList.sort((a, b) => 
          new Date(a.returnDate).getTime() - new Date(b.returnDate).getTime()
        );
        setUpcomingReturns(upcomingReturnsList);
      } catch (err) {
        console.error("Dashboard calculation error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section - Professional Brand Orange */}
      <div className="bg-gradient-to-br from-[#F47C2C] to-[#D8432E] rounded-3xl p-8 md:p-12 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">
              Enterprise Fleet Management
            </h1>
            <p className="text-white/80 text-lg">
              Streamline your rental operations with real-time analytics and automated booking management.
            </p>
          </div>
          <Link to="/new-booking">
            <Button className="bg-white text-[#F47C2C] hover:bg-white/90 px-8 h-12 rounded-full font-semibold shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              New Rental
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          title="Total Income"
          value={formatCurrency(stats.totalIncome)}
          icon={DollarSign}
          variant="success"
          trend="From advance payments"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(stats.pendingPayments)}
          icon={Clock}
          variant="warning"
          trend="Balance due"
        />
        <StatCard
          title="Active Rentals"
          value={stats.activeRentals}
          icon={Car}
          variant="accent"
          trend="Currently on rent"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          variant="default"
          trend="Unique customers"
        />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Rentals */}
        <div className="card-elevated overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-primary text-white">
            <h2 className="font-display text-lg font-semibold">Recent Rentals</h2>
            <Link to="/rentals" className="text-sm text-white/90 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="p-6">
            {recentRentals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No rentals yet. Create your first booking!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRentals.map((rental) => (
                  <Link
                    key={rental.id}
                    to={`/invoice/${rental.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <img
                      src={rental.vehicle.image}
                      alt={rental.vehicle.name}
                      className="w-14 h-10 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{rental.client.fullName}</p>
                      <p className="text-sm text-muted-foreground truncate">{rental.vehicle.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatCurrency(rental.totalAmount)}</p>
                      <span className={`text-xs ${
                        rental.paymentStatus === 'paid' ? 'badge-success' :
                        rental.paymentStatus === 'partial' ? 'badge-warning' : 'badge-pending'
                      }`}>
                        {rental.paymentStatus}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Returns */}
        <div className="card-elevated overflow-hidden">
          <div className="flex items-center gap-2 p-4 bg-primary text-white">
            <AlertCircle className="w-5 h-5" />
            <h2 className="font-display text-lg font-semibold">Upcoming Returns</h2>
          </div>
          
          <div className="p-6">
            {upcomingReturns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming returns in the next 7 days</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingReturns.map((rental) => {
                  const returnDate = new Date(rental.returnDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const daysLeft = Math.ceil((returnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Link
                      key={rental.id}
                      to={`/invoice/${rental.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-sm font-medium ${
                        daysLeft <= 1 ? 'bg-destructive/10 text-destructive' :
                        daysLeft <= 3 ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                      }`}>
                        <span className="text-lg font-bold">{daysLeft}</span>
                        <span className="text-xs">days</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{rental.client.fullName}</p>
                        <p className="text-sm text-muted-foreground truncate">{rental.vehicle.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{formatDate(rental.returnDate)}</p>
                        <p className="text-sm text-muted-foreground">{rental.returnTime}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
