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
      <title>Agreement - ${displayAgreementNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', sans-serif; 
          color: ${BRAND_GRAY_800};
          line-height: 1.6;
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
          background: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        /* Header Section */
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          padding-bottom: 20px; 
          margin-bottom: 20px; 
          border-bottom: 4px solid;
          border-image: linear-gradient(90deg, ${BRAND_ORANGE} 0%, ${BRAND_RED} 100%) 1;
        }
        .logo-section { display: flex; align-items: center; gap: 12px; }
        .logo-img { 
          width: 64px; 
          height: 64px; 
          object-fit: contain;
        }
        .company-name { 
          font-family: 'Playfair Display', serif; 
          font-size: 22px; 
          font-weight: 700; 
          color: ${BRAND_GRAY_800};
        }
        .company-sub { color: ${BRAND_GRAY_500}; font-size: 12px; margin-top: 2px; }
        .tagline { font-size: 10px; color: ${BRAND_ORANGE}; font-style: italic; margin-top: 2px; }
        .agreement-info { text-align: right; }
        .agreement-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: ${BRAND_GRAY_500};
          margin-bottom: 2px;
        }
        .agreement-title { 
          font-size: 24px; 
          font-weight: 700; 
          background: linear-gradient(90deg, ${BRAND_ORANGE} 0%, ${BRAND_RED} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .agreement-number { font-size: 14px; font-weight: 600; color: ${BRAND_GRAY_800}; margin-top: 2px; }
        .agreement-date { color: ${BRAND_GRAY_500}; font-size: 11px; margin-top: 2px; }
        
        /* Section Styles */
        .section { margin-bottom: 16px; }
        .section-title { 
          font-weight: 600; 
          font-size: 12px;
          color: ${BRAND_GRAY_800}; 
          margin-bottom: 10px; 
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding-bottom: 6px;
          border-bottom: 2px solid ${BRAND_GRAY_200};
        }
        
        /* Two Column Layout */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        
        /* Info Box */
        .info-box { 
          background: ${BRAND_GRAY_50};
          border-radius: 10px; 
          padding: 14px;
          border: 1px solid ${BRAND_GRAY_200};
        }
        .info-box p { margin-bottom: 3px; }
        .info-box-title {
          font-weight: 700;
          font-size: 13px;
          color: ${BRAND_GRAY_800};
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid ${BRAND_GRAY_200};
        }
        .info-label { color: ${BRAND_GRAY_500}; font-size: 11px; }
        .info-value { font-weight: 600; font-size: 12px; color: ${BRAND_GRAY_800}; }
        
        /* Vehicle Box */
        .vehicle-box { 
          background: ${BRAND_GRAY_50};
          border: 2px solid ${BRAND_GRAY_200};
          border-radius: 12px; 
          padding: 14px; 
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .vehicle-logo {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: linear-gradient(90deg, ${BRAND_ORANGE} 0%, ${BRAND_RED} 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          flex-shrink: 0;
        }
        .vehicle-image {
          width: 80px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
          border: 2px solid ${BRAND_GRAY_200};
        }
        .vehicle-info { flex: 1; }
        .vehicle-brand {
          display: inline-block;
          padding: 2px 10px;
          background: linear-gradient(90deg, ${BRAND_ORANGE} 0%, ${BRAND_RED} 100%);
          color: white;
          border-radius: 14px;
          font-size: 10px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .vehicle-name { font-weight: 700; font-size: 14px; color: ${BRAND_GRAY_800}; }
        .vehicle-badges { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
        .vehicle-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
        }
        .badge-year { background: #e0f2fe; border: 1px solid #7dd3fc; color: #0369a1; }
        .badge-color { background: #fae8ff; border: 1px solid #e879f9; color: #a21caf; }
        .badge-type { background: #dcfce7; border: 1px solid #86efac; color: #15803d; }
        
        /* Rental Period */
        .period-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .period-box {
          border-radius: 10px;
          padding: 12px;
          text-align: center;
        }
        .period-delivery {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 2px solid #6ee7b7;
        }
        .period-return {
          background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
          border: 2px solid #fca5a5;
        }
        .period-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .period-delivery .period-icon { background: #10b981; color: white; }
        .period-return .period-icon { background: ${BRAND_RED}; color: white; }
        .period-label {
          font-size: 10px;
          color: ${BRAND_GRAY_500};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .period-date { font-weight: 700; font-size: 12px; color: ${BRAND_GRAY_800}; }
        .period-time { font-weight: 600; font-size: 11px; margin-top: 2px; }
        .period-delivery .period-time { color: #059669; }
        .period-return .period-time { color: ${BRAND_RED}; }
        .rent-type-badge { 
          display: inline-block;
          padding: 4px 14px;
          background: linear-gradient(90deg, ${BRAND_ORANGE}20 0%, ${BRAND_RED}20 100%);
          color: ${BRAND_GRAY_800}; 
          border-radius: 18px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 10px;
          border: 1px solid ${BRAND_ORANGE}40;
        }
        
        /* Documents Grid */
        .documents-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .document-box {
          background: ${BRAND_GRAY_50};
          border: 1px solid ${BRAND_GRAY_200};
          border-radius: 10px;
          padding: 8px;
          text-align: center;
        }
        .document-label {
          font-weight: 600;
          font-size: 9px;
          color: ${BRAND_ORANGE};
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .document-img {
          width: 100%;
          max-height: 80px;
          object-fit: contain;
          border-radius: 6px;
          background: white;
        }
        
        /* Payment Section */
        .payment-section {
          background: ${BRAND_GRAY_50};
          border-radius: 10px;
          padding: 12px;
          border: 2px solid ${BRAND_GRAY_200};
        }
        .payment-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid ${BRAND_GRAY_200};
        }
        .payment-row:last-child { border-bottom: none; }
        .payment-row.total {
          background: linear-gradient(90deg, ${BRAND_ORANGE} 0%, ${BRAND_RED} 100%);
          color: white;
          margin: 10px -12px -12px -12px;
          padding: 12px;
          border-radius: 0 0 8px 8px;
        }
        .payment-label { color: ${BRAND_GRAY_500}; font-size: 12px; }
        .payment-value { font-weight: 600; font-size: 13px; color: ${BRAND_GRAY_800}; }
        .payment-value.success { color: #16a34a; }
        .payment-value.danger { color: ${BRAND_RED}; }
        .payment-row.total .payment-label,
        .payment-row.total .payment-value { color: white; }
        
        /* Status Badges */
        .status-badge { 
          display: inline-block;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-paid { background: #16a34a; color: white; }
        .status-pending { background: ${BRAND_RED}; color: white; }
        .status-partial { background: ${BRAND_ORANGE}; color: white; }
        
        /* Notes */
        .notes-box { 
          background: ${BRAND_GRAY_50};
          padding: 12px; 
          border-radius: 8px;
          color: ${BRAND_GRAY_500};
          border-left: 4px solid ${BRAND_ORANGE};
          font-size: 12px;
          line-height: 1.5;
        }

        /* Urdu Terms Section */
        .urdu-section { margin-top: 20px; }
        .urdu-terms-box {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border: 2px solid ${BRAND_ORANGE};
          border-radius: 12px;
          padding: 16px;
          font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif;
        }
        .urdu-title {
          font-size: 16px;
          font-weight: 700;
          color: ${BRAND_RED};
          text-align: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid ${BRAND_ORANGE};
        }
        .urdu-list {
          list-style-type: decimal;
          padding-right: 24px;
          padding-left: 0;
        }
        .urdu-term {
          font-size: 12px;
          color: ${BRAND_GRAY_800};
          line-height: 2.2;
          margin-bottom: 6px;
          text-align: right;
        }

        /* Signature Section */
        .signature-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-top: 24px;
          padding-top: 16px;
        }
        .signature-box {
          text-align: center;
        }
        .signature-line {
          border-bottom: 2px dashed ${BRAND_GRAY_500};
          height: 50px;
          margin-bottom: 8px;
        }
        .signature-label {
          font-size: 11px;
          font-weight: 500;
          color: ${BRAND_GRAY_500};
        }
        .signature-urdu {
          font-size: 10px;
          color: ${BRAND_GRAY_500};
          font-family: 'Noto Nastaliq Urdu', serif;
          direction: rtl;
        }
        
        /* Footer */
        .footer { 
          border-top: 2px solid ${BRAND_GRAY_200}; 
          padding-top: 16px; 
          margin-top: 20px; 
          text-align: center;
        }
        .footer-brand {
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-weight: 600;
          color: ${BRAND_GRAY_800};
          margin-bottom: 2px;
        }
        .footer-tagline {
          font-size: 11px;
          color: ${BRAND_ORANGE};
          font-style: italic;
        }
        .footer-thanks {
          margin-top: 10px;
          font-size: 10px;
          color: ${BRAND_GRAY_500};
        }
        
        /* Print Styles */
        .page-break-avoid { page-break-inside: avoid; }
        
        @media print {
          body { padding: 12px; }
          @page { margin: 0.3in; size: A4; }
          .header, .logo, .payment-row.total, .status-badge, .vehicle-brand, .rent-type-badge, .urdu-terms-box {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .documents-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .document-img {
            max-height: 100px;
          }
        }
      </style>
    </head>
    <body>
      ${(() => {
        const company = getCompanyInfo();
        return `
      <div class="header" style="flex-direction: column; align-items: center; text-align: center;">
        <img src="${window.location.origin}/src/assets/brand-logo.png" alt="Yousif & Sons Rent A Car" style="height: 80px; width: auto; object-fit: contain; margin-bottom: 12px;" onerror="this.style.display='none'" />
        ${company.phone ? `<div style="font-size: 11px; color: ${BRAND_GRAY_500}; margin-top: 4px;">📞 ${company.phone}${company.phone2 ? ` | ${company.phone2}` : ''}</div>` : ''}
        ${company.address ? `<div style="font-size: 10px; color: ${BRAND_GRAY_500};">📍 ${company.address}</div>` : ''}
        <div style="margin-top: 12px;">
          <div class="agreement-label">Rental Agreement</div>
          <div class="agreement-title">AGREEMENT</div>
          <div class="agreement-number">#${displayAgreementNumber}</div>
          <div class="agreement-date">${formatDate(rental.createdAt)}</div>
        </div>
      </div>`;
      })()}

      <div class="two-col section">
        <div class="info-box">
          <div class="info-box-title">👤 Client Details</div>
          <p class="info-value" style="font-size: 14px; margin-bottom: 6px;">${rental.client.fullName}</p>
          <p class="info-label">CNIC: <span class="info-value">${rental.client.cnic}</span></p>
          <p class="info-label">📞 <span class="info-value">${rental.client.phone}</span></p>
          <p class="info-label">📍 <span class="info-value" style="font-size: 11px;">${rental.client.address}</span></p>
        </div>
        <div class="info-box">
          <div class="info-box-title">👥 Witness Details</div>
          <p class="info-value" style="font-size: 14px; margin-bottom: 6px;">${rental.witness.name}</p>
          <p class="info-label">CNIC: <span class="info-value">${rental.witness.cnic}</span></p>
          <p class="info-label">📞 <span class="info-value">${rental.witness.phone}</span></p>
          <p class="info-label">📍 <span class="info-value" style="font-size: 11px;">${rental.witness.address}</span></p>
        </div>
      </div>

      <div class="section page-break-avoid">
        <div class="section-title">🚗 Vehicle Details</div>
        <div class="vehicle-box">
          ${rental.vehicle.image ? `
            <img src="${rental.vehicle.image}" alt="${rental.vehicle.name}" class="vehicle-image" onerror="this.style.display='none'">
          ` : `
            <div class="vehicle-logo">${rental.vehicle.brand?.charAt(0) || 'V'}</div>
          `}
          <div class="vehicle-info">
            <span class="vehicle-brand">${rental.vehicle.brand || 'Vehicle'}</span>
            <p class="vehicle-name">${rental.vehicle.brand} ${rental.vehicle.model}</p>
            <div class="vehicle-badges">
              ${rental.vehicle.year ? `<span class="vehicle-badge badge-year">📅 ${rental.vehicle.year}</span>` : ''}
              ${rental.vehicle.color ? `<span class="vehicle-badge badge-color">🎨 ${rental.vehicle.color}</span>` : ''}
              ${rental.vehicle.type ? `<span class="vehicle-badge badge-type">🚗 ${rental.vehicle.type}</span>` : ''}
            </div>
          </div>
        </div>
      </div>

      <div class="section page-break-avoid">
        <div class="section-title">📅 Rental Period</div>
        <div class="period-grid">
          <div class="period-box period-delivery">
            <div class="period-icon">📦</div>
            <div class="period-label">Delivery</div>
            <div class="period-date">📅 ${formatDate(rental.deliveryDate)}</div>
            <div class="period-time">⏰ ${formatTime(rental.deliveryTime)}</div>
          </div>
          <div class="period-box period-return">
            <div class="period-icon">📥</div>
            <div class="period-label">Return</div>
            <div class="period-date">📅 ${formatDate(rental.returnDate)}</div>
            <div class="period-time">⏰ ${formatTime(rental.returnTime)}</div>
          </div>
        </div>
        <div style="text-align: center;">
          <span class="rent-type-badge">${rental.rentType.toUpperCase()} RENTAL</span>
        </div>
      </div>

      ${clientImagesHtml}

      <div class="section page-break-avoid">
        <div class="section-title">💳 Payment Details</div>
        <div class="payment-section">
          <div class="payment-row">
            <span class="payment-label">Total Rental Amount</span>
            <span class="payment-value">${formatCurrency(rental.totalAmount)}</span>
          </div>
          <div class="payment-row">
            <span class="payment-label">Advance Payment Received</span>
            <span class="payment-value success">${formatCurrency(rental.advancePayment)}</span>
          </div>
          <div class="payment-row">
            <span class="payment-label">Balance Due</span>
            <span class="payment-value danger">${formatCurrency(rental.balance)}</span>
          </div>
          <div class="payment-row total">
            <span class="payment-label"><strong>Payment Status</strong></span>
            <span class="status-badge status-${rental.paymentStatus}">${rental.paymentStatus.toUpperCase()}</span>
          </div>
        </div>
      </div>

      ${rental.notes ? `
        <div class="section page-break-avoid">
          <div class="section-title">📝 Additional Notes</div>
          <div class="notes-box">${rental.notes}</div>
        </div>
      ` : ''}

      ${rental.accessories ? `
        <div class="section page-break-avoid">
          <div class="section-title">🔧 Accessories Checklist</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${Object.entries(rental.accessories).filter(([_, v]) => v).map(([key]) => `
              <span style="padding: 4px 12px; background: #dcfce7; border: 1px solid #86efac; border-radius: 16px; font-size: 11px; color: #166534;">✓ ${key.replace(/([A-Z])/g, ' $1').trim()}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}

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
