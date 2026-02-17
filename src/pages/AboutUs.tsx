import { Car, Shield, Clock, Users, CheckCircle, Heart } from 'lucide-react';

const AboutUs = () => {
  const values = [
    {
      icon: Car,
      title: 'Well-Maintained Vehicles',
      description: 'All our vehicles are regularly serviced and verified for your safety and comfort.'
    },
    {
      icon: Shield,
      title: 'Secure Information',
      description: 'Your personal data is handled with utmost care and protected securely.'
    },
    {
      icon: Clock,
      title: 'Timely Service',
      description: 'We ensure punctual vehicle delivery and hassle-free return management.'
    },
    {
      icon: Users,
      title: 'Professional Support',
      description: 'Our dedicated team is always ready to assist you with any queries.'
    },
    {
      icon: CheckCircle,
      title: 'Clear Terms',
      description: 'Transparent rental terms with no hidden conditions or surprise charges.'
    },
    {
      icon: Heart,
      title: 'Customer Focused',
      description: 'Your satisfaction and comfort are at the heart of everything we do.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Orange Theme */}
      <div className="relative bg-gradient-to-br from-primary via-accent to-primary py-16 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
            About Us
          </h1>
          <p className="text-orange-100 text-lg md:text-xl max-w-2xl mx-auto">
            Your trusted partner in vehicle rental services
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="card-elevated p-6 md:p-8 mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Who We Are
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We are a customer-focused Rent A Car service committed to providing reliable, comfortable, and well-maintained vehicles for personal and business use. Our goal is to make vehicle rental simple, transparent, and stress-free for our customers.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We offer flexible rental options including daily, weekly, and monthly rentals to suit different needs. Whether you require a vehicle for short-term travel, business purposes, or long-term use, our service is designed to deliver convenience, safety, and peace of mind.
          </p>
        </div>

        {/* What We Stand For */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
            What We Stand For
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((value, index) => (
              <div key={index} className="card-elevated p-5 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Our System */}
        <div className="card-elevated p-6 md:p-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Our Management System
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Our system allows us to manage bookings, rental records, customer details, and payments efficiently to ensure a smooth experience for both customers and our operations team. We leverage modern technology to provide you with the best possible rental experience.
          </p>
        </div>

        {/* Branding */}
        <div className="text-center mt-12 py-8 border-t border-border">
          <h3 className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Yousif & Sons Rent A Car
          </h3>
          <p className="text-muted-foreground italic">
            Driven by Trust. Powered by Comfort.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
