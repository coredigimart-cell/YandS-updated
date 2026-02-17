import { FileText, UserCheck, Car, Clock, CreditCard, AlertTriangle, Settings, XCircle, RefreshCw, Scale } from 'lucide-react';

const TermsConditions = () => {
  const sections = [
    {
      icon: UserCheck,
      title: 'Rental Eligibility',
      content: [
        'The renter must provide valid identification and required documents',
        'The company reserves the right to approve or reject any rental request'
      ]
    },
    {
      icon: Car,
      title: 'Vehicle Usage',
      content: [
        'Vehicles must be used responsibly and for lawful purposes only',
        'Sub-renting or unauthorized use of the vehicle is strictly prohibited',
        'Any damage caused during the rental period will be the renter\'s responsibility'
      ]
    },
    {
      icon: Clock,
      title: 'Rental Period & Returns',
      content: [
        'Vehicles must be returned on the agreed date and time',
        'Late returns may result in additional charges or penalties',
        'Condition of the vehicle will be checked at return'
      ]
    },
    {
      icon: CreditCard,
      title: 'Payments & Records',
      content: [
        'Advance payment may be required before vehicle delivery',
        'All rental records are maintained digitally for transparency',
        'Any outstanding balance must be cleared at the time of return'
      ]
    },
    {
      icon: AlertTriangle,
      title: 'Liability Disclaimer',
      content: [
        'We are not responsible for personal belongings left inside the vehicle',
        'We are not liable for delays caused by traffic, weather, or unforeseen circumstances',
        'The service does not provide legal or insurance advice'
      ]
    },
    {
      icon: FileText,
      title: 'Data Accuracy',
      content: [
        'Customers are responsible for ensuring that all provided information is accurate. Incorrect information may lead to booking cancellation without notice.'
      ]
    },
    {
      icon: Settings,
      title: 'Service Availability',
      content: [
        'Modify or discontinue services without prior notice',
        'Update vehicle availability, terms, or operational rules'
      ],
      prefix: 'We reserve the right to:'
    },
    {
      icon: XCircle,
      title: 'Termination of Service',
      content: [
        'Terms are violated',
        'False information is provided',
        'Misuse of vehicles is detected'
      ],
      prefix: 'We may suspend or terminate service access if:'
    },
    {
      icon: RefreshCw,
      title: 'Changes to Terms',
      content: [
        'These Terms & Conditions may be updated periodically. Continued use of the service means acceptance of the revised terms.'
      ]
    },
    {
      icon: Scale,
      title: 'Governing Principles',
      content: [
        'These terms are governed by general commercial and service principles without restriction to a specific jurisdiction.'
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
            <FileText className="w-10 h-10 text-white" />
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white">
              Terms & Conditions
            </h1>
          </div>
          <p className="text-orange-100 text-lg md:text-xl max-w-2xl mx-auto">
            Please read these terms carefully before using our services
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="card-elevated p-6 md:p-8 mb-8 border-l-4 border-primary">
          <p className="text-muted-foreground leading-relaxed">
            By using our Rent A Car services, you agree to the following Terms & Conditions. These terms establish the rules and guidelines for using our vehicle rental services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="card-elevated p-6 hover:shadow-lg transition-shadow">
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

export default TermsConditions;
