import { Shield, Eye, Lock, Database, Users, AlertTriangle } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: Eye,
      title: 'Information We Collect',
      content: [
        'Customer name, contact number, email address',
        'CNIC / ID details (where legally required)',
        'Address and witness details (if applicable)',
        'Rental dates, vehicle details, and booking records',
        'Uploaded documents such as CNIC images or photos (if required for verification)'
      ]
    },
    {
      icon: Database,
      title: 'How We Use Your Information',
      content: [
        'Processing vehicle rentals and bookings',
        'Identity verification and legal compliance',
        'Maintaining rental records',
        'Communication related to bookings and services',
        'Improving service quality and operational efficiency'
      ]
    },
    {
      icon: Lock,
      title: 'Data Protection',
      content: [
        'Customer data is stored securely and accessed only by authorized personnel',
        'We do not sell, trade, or share customer data with unauthorized third parties',
        'Uploaded documents are used strictly for verification purposes'
      ]
    },
    {
      icon: Database,
      title: 'Data Retention',
      content: [
        'Fulfill rental agreements',
        'Comply with legal or regulatory requirements',
        'Resolve disputes or claims'
      ],
      prefix: 'We retain customer data only for as long as necessary to:'
    },
    {
      icon: Users,
      title: 'Third-Party Services',
      content: [
        'If third-party services (such as hosting, storage, or payment processing) are used, they are selected based on standard security practices. We are not responsible for the privacy practices of external platforms.'
      ]
    },
    {
      icon: AlertTriangle,
      title: 'User Responsibility',
      content: [
        'Customers are responsible for providing accurate and valid information. Any incorrect or false data may result in service refusal or cancellation.'
      ]
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-white" />
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-orange-100 text-lg md:text-xl max-w-2xl mx-auto">
            Your privacy is important to us
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="card-elevated p-6 md:p-8 mb-8">
          <p className="text-muted-foreground leading-relaxed">
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our Rent A Car services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {section.title}
                </h2>
              </div>
              {section.prefix && (
                <p className="text-muted-foreground mb-3">{section.prefix}</p>
              )}
              <ul className="space-y-2">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
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

export default PrivacyPolicy;
