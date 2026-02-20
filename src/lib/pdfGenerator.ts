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

  const clientImagesHtml = clientImages.length > 0 ? `
    <div class="section page-break-avoid">
      <div class="section-title">📋 Client Documents</div>
      <div class="documents-grid">
        ${clientImages.map(img => `
          <div class="document-box">
            <p class="document-label">${img.label}</p>
            <img src="${img.src}" alt="${img.label}" class="document-img" onerror="this.style.display='none'">
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  // Generate Urdu terms HTML
  const urduTermsHtml = `
    <div class="section page-break-avoid urdu-section">
      <div class="section-title" style="justify-content: center;">
        <span>📜 ${TERMS_TITLE}</span>
        <span style="font-size: 11px; font-weight: 400; color: ${BRAND_GRAY_500}; margin-right: 8px;">(Terms & Conditions)</span>
      </div>
      <div class="urdu-terms-box" dir="rtl">
        <h4 class="urdu-title">${TERMS_TITLE}</h4>
        <ol class="urdu-list">
          ${URDU_TERMS_LIST.map((term, index) => `
            <li class="urdu-term">${term}</li>
          `).join('')}
        </ol>
      </div>
    </div>
  `;

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
            <div class="data-item"><span class="data-label">Odometer</span><span class="data-value">${rental.vehicleCondition?.odometerReading || 'N/A'} KM</span></div>
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
            ${rental.ownerSignature ? `<img src="${rental.ownerSignature}" class="sig-img" />` : ''}
          </div>
          <div class="sig-title">Authorized Signature</div>
        </div>
      </div>

      <div style="text-align:center; margin-top:40px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border); padding-top:15px;">
        This document is an electronic record generated by Yousif & Sons Management System.<br>
        <strong>Your Ride, Your Way! - Thank you for choosing us.</strong>
      </div>
    </body>
    </html>
  `;

      ${rental.vehicleCondition ? `
        <div class="section page-break-avoid">
          <div class="section-title">📋 Vehicle Condition</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 11px;">
            ${rental.vehicleCondition.fuelLevel ? `<p>⛽ Fuel: <strong>${rental.vehicleCondition.fuelLevel}</strong></p>` : ''}
            ${rental.vehicleCondition.mileage ? `<p>📊 Mileage: <strong>${rental.vehicleCondition.mileage} km</strong></p>` : ''}
          </div>
        </div>
      ` : ''}

      ${rental.dentsScratches?.notes || (rental.dentsScratches?.images?.length || 0) > 0 ? `
        <div class="section page-break-avoid">
          <div class="section-title">⚠️ Dents & Scratches Report</div>
          ${rental.dentsScratches.notes ? `<div class="notes-box">${rental.dentsScratches.notes}</div>` : ''}
          ${rental.dentsScratches.images?.length > 0 ? `
            <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
              ${rental.dentsScratches.images.map((img, i) => `
                <img src="${img}" alt="Damage ${i + 1}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid ${BRAND_GRAY_200};">
              `).join('')}
            </div>
          ` : ''}
        </div>
      ` : ''}

      ${urduTermsHtml}

      <div class="signature-section">
        <div class="signature-box">
          ${rental.clientSignature ? `
            <img src="${rental.clientSignature}" alt="Client Signature" style="height: 50px; margin-bottom: 4px;">
          ` : `<div class="signature-line"></div>`}
          <div class="signature-label">Client Signature</div>
          <div class="signature-urdu">کرایہ دار کے دستخط</div>
        </div>
        <div class="signature-box">
          ${rental.ownerSignature ? `
            <img src="${rental.ownerSignature}" alt="Owner Signature" style="height: 50px; margin-bottom: 4px;">
          ` : `<div class="signature-line"></div>`}
          <div class="signature-label">Owner Signature</div>
          <div class="signature-urdu">مالک کے دستخط</div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-brand">Yousif & Sons Rent A Car</div>
        <div class="footer-tagline">Your Ride, Your Way!</div>
        <p class="footer-thanks">Thank you for choosing us! For any queries, please contact us.</p>
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

// Export all clients data to PDF
export const generateAllClientsPDF = (rentals: Rental[]): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate PDF');
    return;
  }

  // Group rentals by client CNIC
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
              <span class="stat-value">Rs ${c.totalSpent.toLocaleString()}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
        </div>
        ${clientImages.length > 0 ? `
          <div class="client-documents">
            ${clientImages.map(img => `
              <div class="mini-doc">
                <p class="mini-doc-label">${img.label}</p>
                <img src="${img.src}" alt="${img.label}" class="mini-doc-img" onerror="this.style.display='none'">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>All Clients - Yousif & Sons</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', sans-serif; 
          color: ${BRAND_GRAY_800};
          line-height: 1.6;
          padding: 32px;
          background: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .header { 
          text-align: center;
          padding-bottom: 24px; 
          margin-bottom: 24px; 
          border-bottom: 4px solid;
          border-image: linear-gradient(90deg, ${BRAND_ORANGE} 0%, ${BRAND_RED} 100%) 1;
        }
        .company-name { 
          font-family: 'Playfair Display', serif; 
          font-size: 28px; 
          font-weight: 700; 
          color: ${BRAND_GRAY_800};
        }
        .tagline { font-size: 13px; color: ${BRAND_ORANGE}; font-style: italic; margin-top: 6px; }
        .report-title { font-size: 20px; font-weight: 600; color: ${BRAND_GRAY_800}; margin-top: 16px; }
        .report-date { color: ${BRAND_GRAY_500}; font-size: 13px; margin-top: 6px; }
        
        .summary {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin: 24px 0;
          padding: 20px;
          background: ${BRAND_GRAY_50};
          border-radius: 14px;
          border: 2px solid ${BRAND_GRAY_200};
        }
        .summary-item { text-align: center; padding: 12px 20px; }
        .summary-value { font-size: 26px; font-weight: 700; color: ${BRAND_ORANGE}; }
        .summary-label {
          font-size: 12px;
          color: ${BRAND_GRAY_500};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }
        
        .clients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 16px;
        }
        
        .client-card {
          background: white;
          border: 2px solid ${BRAND_GRAY_200};
          border-radius: 14px;
          padding: 16px;
          page-break-inside: avoid;
        }
        .client-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .client-info { flex: 1; }
        .client-name {
          font-weight: 700;
          font-size: 16px;
          color: ${BRAND_GRAY_800};
          margin-bottom: 6px;
          padding-bottom: 6px;
          border-bottom: 1px solid ${BRAND_GRAY_200};
        }
        .client-details { margin-top: 8px; }
        .client-detail { font-size: 12px; color: ${BRAND_GRAY_500}; margin-bottom: 3px; }
        .client-stats { display: flex; flex-direction: column; gap: 8px; }
        .stat {
          text-align: center;
          padding: 10px 14px;
          background: ${BRAND_GRAY_50};
          border-radius: 10px;
          border: 1px solid ${BRAND_GRAY_200};
        }
        .stat-highlight { background: linear-gradient(90deg, ${BRAND_ORANGE} 0%, ${BRAND_RED} 100%); }
        .stat-highlight .stat-value, .stat-highlight .stat-label { color: white; }
        .stat-value { display: block; font-weight: 700; font-size: 14px; color: ${BRAND_ORANGE}; }
        .stat-label {
          display: block;
          font-size: 10px;
          color: ${BRAND_GRAY_500};
          text-transform: uppercase;
          margin-top: 2px;
        }
        
        .client-documents {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid ${BRAND_GRAY_200};
        }
        .mini-doc { flex: 1; text-align: center; }
        .mini-doc-label {
          font-size: 9px;
          font-weight: 600;
          color: ${BRAND_ORANGE};
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .mini-doc-img {
          width: 100%;
          max-height: 70px;
          object-fit: contain;
          border-radius: 6px;
          border: 1px solid ${BRAND_GRAY_200};
        }
        
        .footer { 
          text-align: center;
          margin-top: 32px;
          padding-top: 16px;
          border-top: 2px solid ${BRAND_GRAY_200};
          color: ${BRAND_GRAY_500};
          font-size: 11px;
        }
        
        @media print {
          body { padding: 16px; }
          @page { margin: 0.4in; size: A4; }
          .client-card { page-break-inside: avoid; }
          .summary, .stat-highlight {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${window.location.origin}/src/assets/brand-logo.png" alt="Yousif & Sons Rent A Car" style="height: 80px; width: auto; object-fit: contain; margin-bottom: 12px;" onerror="this.style.display='none'" />
        <div class="report-title">📋 All Clients Report</div>
        <div class="report-date">Generated on ${new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</div>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${clients.length}</div>
          <div class="summary-label">Total Clients</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${rentals.length}</div>
          <div class="summary-label">Total Rentals</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">Rs ${rentals.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}</div>
          <div class="summary-label">Total Revenue</div>
        </div>
      </div>

      <div class="clients-grid">
        ${clientCards}
      </div>

      <div class="footer">
        <p>Yousif & Sons Rent A Car – Your Ride, Your Way!</p>
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
