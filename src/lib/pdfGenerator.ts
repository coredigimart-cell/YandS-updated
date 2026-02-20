import { Rental } from '@/types/rental';
import { formatCurrency, formatDate } from '@/lib/storage';
import { URDU_TERMS_LIST, TERMS_TITLE } from '@/lib/termsAndConditions';
import { getCompanyInfo } from '@/components/CompanySettings';

// Brand Colors
const BRAND_ORANGE = '#F47C2C';
const BRAND_RED = '#D8432E';
const BRAND_GRAY_800 = '#1F2933';
const BRAND_GRAY_500 = '#6B7280';
const BRAND_GRAY_200 = '#E5E7EB';
const BRAND_GRAY_100 = '#F3F4F6';
const BRAND_GRAY_50 = '#F9FAFB';

// Helper to format time to 12-hour format
const formatTime = (time: string): string => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const generateInvoicePDF = (rental: Rental): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate PDF');
    return;
  }

  const displayAgreementNumber = rental.agreementNumber || rental.id.toUpperCase();

  // Collect client images
  const clientImages = [];
  if (rental.client.photo) {
    clientImages.push({ label: 'Client Photo', src: rental.client.photo });
  }
  if (rental.client.cnicFrontImage) {
    clientImages.push({ label: 'CNIC Front', src: rental.client.cnicFrontImage });
  }
  if (rental.client.cnicBackImage) {
    clientImages.push({ label: 'CNIC Back', src: rental.client.cnicBackImage });
  }
  if (rental.client.drivingLicenseImage) {
    clientImages.push({ label: 'Driving License', src: rental.client.drivingLicenseImage });
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rental Agreement - ${displayAgreementNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --primary: ${BRAND_ORANGE};
          --primary-dark: ${BRAND_RED};
          --text-main: ${BRAND_GRAY_800};
          --text-muted: ${BRAND_GRAY_500};
          --border: ${BRAND_GRAY_200};
          --bg-light: ${BRAND_GRAY_50};
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', sans-serif; 
          color: var(--text-main);
          line-height: 1.4;
          padding: 30px;
          max-width: 900px;
          margin: 0 auto;
          background: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .header { 
          display: flex; 
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px; 
          margin-bottom: 25px; 
          border-bottom: 5px solid var(--primary);
        }
        .brand-section { display: flex; align-items: center; gap: 20px; }
        .logo-container {
          width: 80px;
          height: 80px;
          background: var(--primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .logo-img { width: 100%; height: 100%; object-fit: contain; padding: 5px; }
        .company-info { text-align: left; }
        .company-name { 
          font-family: 'Playfair Display', serif; 
          font-size: 32px; 
          color: var(--primary);
          margin-bottom: 2px;
        }
        .company-tagline { font-weight: 600; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
        
        .agreement-badge-container { text-align: right; }
        .agreement-badge {
          background: var(--primary);
          color: white;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 20px;
          margin-bottom: 8px;
          display: inline-block;
        }
        .agreement-no { font-size: 16px; font-weight: 700; }
        .agreement-date { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 25px;
        }
        
        .card {
          border: 1.5px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }
        .card-header {
          background: var(--bg-light);
          padding: 10px 15px;
          font-weight: 800;
          font-size: 12px;
          text-transform: uppercase;
          color: var(--primary);
          border-bottom: 1.5px solid var(--border);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .card-body { padding: 15px; }
        
        .data-item { display: flex; margin-bottom: 8px; font-size: 13px; border-bottom: 1px solid var(--bg-light); padding-bottom: 4px; }
        .data-label { color: var(--text-muted); width: 100px; flex-shrink: 0; font-weight: 600; }
        .data-value { font-weight: 700; color: var(--text-main); }
        
        .vehicle-hero {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          border-radius: 15px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 25px;
          margin-bottom: 25px;
          box-shadow: 0 10px 20px rgba(244, 124, 44, 0.15);
        }
        .vehicle-img-wrap {
          width: 180px;
          height: 110px;
          background: white;
          border-radius: 10px;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vehicle-img-large { width: 100%; height: 100%; object-fit: contain; border-radius: 6px; }
        .vehicle-text { flex: 1; }
        .vehicle-title { font-size: 24px; font-weight: 800; margin-bottom: 5px; }
        .vehicle-reg { font-size: 32px; font-weight: 900; letter-spacing: 2px; border: 2px dashed rgba(255,255,255,0.5); padding: 5px 15px; display: inline-block; border-radius: 8px; }
        
        .timeline {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 25px;
        }
        .timeline-box {
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          position: relative;
        }
        .out { background: #f0fdf4; border: 2px solid #bbf7d0; }
        .in { background: #fef2f2; border: 2px solid #fecaca; }
        .timeline-label { font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 5px; }
        .out .timeline-label { color: #16a34a; }
        .in .timeline-label { color: #dc2626; }
        .timeline-val { font-size: 16px; font-weight: 800; }
        
        .check-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .check-pill {
          background: var(--bg-light);
          border: 1px solid var(--border);
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .check-dot { color: var(--primary); font-size: 14px; }
        
        .payment-card {
          background: var(--bg-light);
          border: 2px solid var(--primary);
          border-radius: 12px;
          overflow: hidden;
        }
        .payment-table { width: 100%; border-collapse: collapse; }
        .payment-table td { padding: 12px 20px; font-size: 14px; border-bottom: 1px solid var(--border); }
        .payment-table tr:last-child td { border-bottom: none; }
        .val-col { text-align: right; font-weight: 800; font-size: 16px; }
        .highlight-row { background: var(--primary); color: white; }
        .highlight-row td { border-color: transparent; }
        .highlight-row .val-col { font-size: 22px; }
        
        .urdu-wrapper {
          margin-top: 25px;
          padding: 20px;
          background: #fffcf5;
          border: 2px solid #ffeeba;
          border-radius: 15px;
          direction: rtl;
          font-family: 'Noto Nastaliq Urdu', serif;
        }
        .urdu-title-main { font-size: 20px; font-weight: 700; color: var(--primary-dark); margin-bottom: 10px; text-align: center; border-bottom: 1px solid #ffeeba; padding-bottom: 5px; }
        .urdu-content { font-size: 14px; line-height: 2.2; color: #333; text-align: justify; }
        
        .signatures {
          margin-top: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
        }
        .sig-box { text-align: center; }
        .sig-space { 
          border-bottom: 3px solid var(--text-main); 
          height: 70px; 
          margin-bottom: 10px; 
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .sig-image { max-height: 60px; max-width: 250px; object-fit: contain; }
        .sig-title { font-weight: 800; font-size: 14px; color: var(--primary); text-transform: uppercase; }

        .gallery {
          margin-top: 25px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        .gallery-item {
          border: 1.5px solid var(--border);
          border-radius: 10px;
          padding: 5px;
          background: white;
          text-align: center;
        }
        .gallery-img { width: 100%; height: 80px; object-fit: cover; border-radius: 6px; }
        .gallery-label { font-size: 9px; font-weight: 700; margin-top: 5px; color: var(--text-muted); text-transform: uppercase; }

        @media print {
          body { padding: 0; }
          .no-print { display: none; }
          @page { margin: 0.5cm; size: A4; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand-section">
          <div class="logo-container">
            <img src="https://raw.githubusercontent.com/yousif-sons/assets/main/logo-orange.png" onerror="this.src='/src/assets/brand-logo.png'" class="logo-img" />
          </div>
          <div class="company-info">
            <h1 class="company-name">Yousif & Sons</h1>
            <p class="company-tagline">Rent A Car & Travel Management</p>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px; font-weight: 500;">
              📍 Office #1, Ground Floor, Plaza 101, Blue Area, Islamabad<br>
              📞 +92 300 1234567 | ✉️ bookings@yousifsons.com
            </div>
          </div>
        </div>
        <div class="agreement-badge-container">
          <div class="agreement-badge">AGREEMENT</div>
          <div class="agreement-no">Ref: #${displayAgreementNumber}</div>
          <div class="agreement-date">Issued: ${formatDate(rental.createdAt)}</div>
        </div>
      </div>

      <div class="vehicle-hero">
        <div class="vehicle-img-wrap">
          ${rental.vehicle.image ? `<img src="${rental.vehicle.image}" class="vehicle-img-large" />` : `<div style="font-size:40px; font-weight:900; color:var(--primary);">${rental.vehicle.brand?.charAt(0)}</div>`}
        </div>
        <div class="vehicle-text">
          <div class="vehicle-title">${rental.vehicle.brand} ${rental.vehicle.model} | ${rental.vehicle.year}</div>
          <div class="vehicle-reg">${rental.vehicle.carNumber || 'N/A'}</div>
          <div style="margin-top:10px; font-weight:600; font-size:14px; opacity:0.9;">
            Type: ${rental.vehicle.type} • Color: ${rental.vehicle.color}
          </div>
        </div>
      </div>

      <div class="main-grid">
        <div class="card">
          <div class="card-header">👤 Client Information</div>
          <div class="card-body">
            <div class="data-item"><span class="data-label">Full Name</span><span class="data-value">${rental.client.fullName}</span></div>
            <div class="data-item"><span class="data-label">CNIC No</span><span class="data-value">${rental.client.cnic}</span></div>
            <div class="data-item"><span class="data-label">Phone</span><span class="data-value">${rental.client.phone}</span></div>
            <div class="data-item"><span class="data-label">Address</span><span class="data-value">${rental.client.address}</span></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">👥 Witness Details</div>
          <div class="card-body">
            <div class="data-item"><span class="data-label">Full Name</span><span class="data-value">${rental.witness.name}</span></div>
            <div class="data-item"><span class="data-label">CNIC No</span><span class="data-value">${rental.witness.cnic}</span></div>
            <div class="data-item"><span class="data-label">Phone</span><span class="data-value">${rental.witness.phone}</span></div>
            <div class="data-item"><span class="data-label">Address</span><span class="data-value">${rental.witness.address}</span></div>
          </div>
        </div>
      </div>

      <div class="timeline">
        <div class="timeline-box out">
          <div class="timeline-label">Delivery (Check Out)</div>
          <div class="timeline-val">${formatDate(rental.deliveryDate)} • ${formatTime(rental.deliveryTime)}</div>
        </div>
        <div class="timeline-box in">
          <div class="timeline-label">Return (Check In)</div>
          <div class="timeline-val">${formatDate(rental.returnDate)} • ${formatTime(rental.returnTime)}</div>
        </div>
      </div>

      <div class="main-grid">
        <div class="card">
          <div class="card-header">🔧 Equipment & State</div>
          <div class="card-body">
            <div class="check-grid" style="margin-bottom:15px;">
              ${rental.accessories ? Object.entries(rental.accessories).filter(([_, v]) => v).map(([key]) => `<div class="check-pill"><span class="check-dot">●</span>${key.replace(/([A-Z])/g, ' $1').trim()}</div>`).join('') : 'None'}
            </div>
            <div class="data-item"><span class="data-label">Fuel Level</span><span class="data-value">${rental.vehicleCondition?.fuelLevel || 'N/A'}</span></div>
            <div class="data-item"><span class="data-label">Mileage</span><span class="data-value">${rental.vehicleCondition?.mileage || 'N/A'} KM</span></div>
          </div>
        </div>
        <div class="payment-card">
          <div class="card-header" style="background:transparent; border-bottom:1px solid rgba(0,0,0,0.1);">💰 Payment Summary</div>
          <table class="payment-table">
            <tr><td>Total Amount (${rental.rentType})</td><td class="val-col">${formatCurrency(rental.totalAmount)}</td></tr>
            <tr><td>Advance Payment</td><td class="val-col" style="color:#16a34a;">-${formatCurrency(rental.advancePayment)}</td></tr>
            <tr class="highlight-row"><td><strong>BALANCE DUE</strong></td><td class="val-col">${formatCurrency(rental.balance)}</td></tr>
          </table>
        </div>
      </div>

      ${clientImages.length > 0 ? `
      <div class="gallery">
        ${clientImages.map(img => `
          <div class="gallery-item">
            <img src="${img.src}" class="gallery-img" />
            <div class="gallery-label">${img.label}</div>
          </div>
        `).join('')}
      </div>` : ''}

      <div class="urdu-wrapper">
        <h2 class="urdu-title-main">شرائط و ضوابط (Terms & Conditions)</h2>
        <div class="urdu-content">
          میں اقرار کرتا ہوں کہ میں نے گاڑی درست حالت میں اور تمام لوازمات کے ساتھ وصول کی ہے۔ کرایہ کی مدت کے دوران کسی بھی قسم کے ٹریفک چالان، حادثہ یا فنی خرابی کی صورت میں تمام تر اخراجات اور ذمہ داری مجھ پر ہوگی۔ میں مقررہ وقت پر گاڑی واپس کرنے کا پابند ہوں، بصورت دیگر کمپنی کو اضافی کرایہ وصول کرنے اور قانونی کارروائی کرنے کا مکمل حق حاصل ہے۔
        </div>
      </div>

      <div class="signatures">
        <div class="sig-box">
          <div class="sig-space">
            ${rental.clientSignature ? `<img src="${rental.clientSignature}" class="sig-image" />` : ''}
          </div>
          <div class="sig-title">Client Signature</div>
        </div>
        <div class="sig-box">
          <div class="sig-space">
            ${rental.ownerSignature ? `<img src="${rental.ownerSignature}" class="sig-image" />` : ''}
          </div>
          <div class="sig-title">Authorized Signature</div>
        </div>
      </div>

      <div style="text-align:center; margin-top:40px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border); padding-top:15px;">
        This document is an electronic record generated by Yousif & Sons Management System.<br>
        <strong>Your Ride, Your Way! - Thank you for choosing us.</strong>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const generateAllClientsPDF = (rentals: Rental[]): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate PDF');
    return;
  }

  const clientMap = new Map<string, { client: Rental['client']; rentals: Rental[]; totalSpent: number }>();
  
  rentals.forEach((rental) => {
    const existing = clientMap.get(rental.client.cnic);
    if (existing) {
      existing.rentals.push(rental);
      existing.totalSpent += rental.totalAmount;
    } else {
      clientMap.set(rental.client.cnic, {
        client: rental.client,
        rentals: [rental],
        totalSpent: rental.totalAmount,
      });
    }
  });

  const clients = Array.from(clientMap.values());

  const clientCards = clients.map((c) => {
    const clientImages = [];
    if (c.client.photo) {
      clientImages.push({ label: 'Photo', src: c.client.photo });
    }
    if (c.client.cnicFrontImage) {
      clientImages.push({ label: 'CNIC Front', src: c.client.cnicFrontImage });
    }
    if (c.client.cnicBackImage) {
      clientImages.push({ label: 'CNIC Back', src: c.client.cnicBackImage });
    }
    if (c.client.drivingLicenseImage) {
      clientImages.push({ label: 'License', src: c.client.drivingLicenseImage });
    }

    return `
      <div class="client-card">
        <div class="client-header">
          <div class="client-info">
            <h3 class="client-name">${c.client.fullName}</h3>
            <div class="client-details">
              <p class="client-detail"><strong>CNIC:</strong> ${c.client.cnic}</p>
              <p class="client-detail">📞 ${c.client.phone}</p>
              <p class="client-detail">📍 ${c.client.address}</p>
            </div>
          </div>
          <div class="client-stats">
            <div class="stat">
              <span class="stat-value">${c.rentals.length}</span>
              <span class="stat-label">Rentals</span>
            </div>
            <div class="stat stat-highlight">
              <span class="stat-value">${formatCurrency(c.totalSpent)}</span>
              <span class="stat-label">Total Spent</span>
            </div>
          </div>
        </div>

        <div class="client-docs">
          ${clientImages.map(img => `
            <div class="doc-box">
              <img src="${img.src}" class="doc-img" />
              <span class="doc-label">${img.label}</span>
            </div>
          `).join('')}
        </div>

        <div class="rental-history">
          <h4 class="history-title">Rental History</h4>
          <table class="history-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Reg #</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${c.rentals.map(r => `
                <tr>
                  <td>${r.vehicle.brand} ${r.vehicle.model}</td>
                  <td>${r.vehicle.carNumber}</td>
                  <td>${formatDate(r.deliveryDate)} - ${formatDate(r.returnDate)}</td>
                  <td>${formatCurrency(r.totalAmount)}</td>
                  <td><span class="status-badge status-${r.paymentStatus}">${r.paymentStatus}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Client Directory - Yousif & Sons</title>
      <style>
        body { font-family: 'Inter', sans-serif; color: #1F2933; line-height: 1.4; padding: 30px; }
        .page-header { text-align: center; margin-bottom: 40px; border-bottom: 4px solid ${BRAND_ORANGE}; padding-bottom: 20px; }
        .company-name { font-size: 32px; color: ${BRAND_ORANGE}; margin: 0; }
        .report-title { font-size: 18px; color: #6B7280; text-transform: uppercase; letter-spacing: 2px; }
        
        .client-card { border: 2px solid #E5E7EB; border-radius: 15px; padding: 25px; margin-bottom: 30px; page-break-inside: avoid; }
        .client-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid #E5E7EB; padding-bottom: 15px; }
        .client-name { font-size: 24px; color: #1F2933; margin: 0 0 10px 0; }
        .client-details { display: flex; gap: 20px; font-size: 13px; color: #6B7280; }
        
        .client-stats { display: flex; gap: 15px; }
        .stat { background: #F9FAFB; padding: 10px 15px; border-radius: 10px; text-align: center; min-width: 80px; }
        .stat-highlight { background: ${BRAND_ORANGE}; color: white; }
        .stat-value { display: block; font-size: 18px; font-weight: 800; }
        .stat-label { font-size: 10px; text-transform: uppercase; font-weight: 600; }
        
        .client-docs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .doc-box { border: 1px solid #E5E7EB; padding: 5px; border-radius: 8px; text-align: center; }
        .doc-img { width: 100%; height: 80px; object-fit: cover; border-radius: 4px; }
        .doc-label { font-size: 9px; color: #6B7280; text-transform: uppercase; font-weight: 700; margin-top: 5px; display: block; }
        
        .history-title { font-size: 14px; text-transform: uppercase; color: ${BRAND_ORANGE}; margin-bottom: 10px; }
        .history-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .history-table th { text-align: left; background: #F9FAFB; padding: 8px; border-bottom: 2px solid #E5E7EB; }
        .history-table td { padding: 8px; border-bottom: 1px solid #F3F4F6; }
        
        .status-badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .status-paid { background: #dcfce7; color: #15803d; }
        .status-pending { background: #fee2e2; color: #b91c1c; }
        
        @media print {
          @page { size: A4; margin: 1cm; }
          .client-card { border-color: #000; }
        }
      </style>
    </head>
    <body>
      <div class="page-header">
        <h1 class="company-name">Yousif & Sons Rent A Car</h1>
        <div class="report-title">Client Directory & History Report</div>
        <p style="font-size: 12px; color: #6B7280;">Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
      ${clientCards}
      <script>window.onload = () => window.print();</script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
