import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Rental } from '@/types/rental';
import { formatCurrency, formatDate } from '@/lib/storage';
import { getCompanyInfo } from '@/components/CompanySettings';
import { URDU_TERMS_LIST, TERMS_TITLE } from '@/lib/termsAndConditions';

const formatTime = (time: string): string => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const downloadPDFDirect = async (rental: Rental): Promise<void> => {
  const displayAgreementNumber = rental.agreementNumber || rental.id.toUpperCase();
  const company = getCompanyInfo();
  
  // Create a hidden container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // A4 width at 96 DPI
  container.style.background = 'white';
  document.body.appendChild(container);

  // Client images section
  const clientImages = [];
  if (rental.client.photo) clientImages.push({ label: 'Client Photo', src: rental.client.photo });
  if (rental.client.cnicFrontImage) clientImages.push({ label: 'CNIC Front', src: rental.client.cnicFrontImage });
  if (rental.client.cnicBackImage) clientImages.push({ label: 'CNIC Back', src: rental.client.cnicBackImage });
  if (rental.client.drivingLicenseImage) clientImages.push({ label: 'Driving License', src: rental.client.drivingLicenseImage });

  container.innerHTML = `
    <div id="pdf-content" style="padding: 24px; font-family: Arial, sans-serif; color: #1e1b4b; line-height: 1.6;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 4px solid #7c3aed;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #7c3aed, #3b82f6); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 22px;">🚗</div>
          <div>
            <div style="font-size: 22px; font-weight: 700; color: #7c3aed;">${company.name}</div>
            <div style="color: #6b7280; font-size: 12px;">Rent A Car</div>
            <div style="font-size: 10px; color: #8b5cf6; font-style: italic;">${company.tagline || 'Driven by Trust. Powered by Comfort.'}</div>
            ${company.phone ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">📞 ${company.phone}${company.phone2 ? ` | ${company.phone2}` : ''}</div>` : ''}
            ${company.address ? `<div style="font-size: 10px; color: #6b7280;">📍 ${company.address}</div>` : ''}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Rental Agreement</div>
          <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">AGREEMENT</div>
          <div style="font-size: 14px; font-weight: 600; color: #1e1b4b;">#${displayAgreementNumber}</div>
          <div style="color: #6b7280; font-size: 11px;">${formatDate(rental.createdAt)}</div>
        </div>
      </div>

      <!-- Client Info -->
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase;">👤 Client Information</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="background: linear-gradient(135deg, #f8f7ff, #f0f7ff); border-radius: 10px; padding: 14px; border: 1px solid #e0e7ff;">
            <p style="margin-bottom: 3px;"><span style="color: #6b7280; font-size: 11px;">Full Name:</span> <strong style="font-size: 12px;">${rental.client.fullName}</strong></p>
            <p style="margin-bottom: 3px;"><span style="color: #6b7280; font-size: 11px;">CNIC:</span> <strong style="font-size: 12px;">${rental.client.cnic}</strong></p>
            <p><span style="color: #6b7280; font-size: 11px;">Phone:</span> <strong style="font-size: 12px;">${rental.client.phone}</strong></p>
          </div>
          <div style="background: linear-gradient(135deg, #f8f7ff, #f0f7ff); border-radius: 10px; padding: 14px; border: 1px solid #e0e7ff;">
            <p><span style="color: #6b7280; font-size: 11px;">Address:</span> <strong style="font-size: 12px;">${rental.client.address}</strong></p>
          </div>
        </div>
      </div>

      <!-- Vehicle Info -->
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase;">🚗 Vehicle Details</div>
        <div style="background: linear-gradient(135deg, #f8f7ff, #f0f7ff); border: 2px solid #c7d2fe; border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 14px;">
          ${rental.vehicle.image ? `<img src="${rental.vehicle.image}" alt="Vehicle" style="width: 80px; height: 50px; border-radius: 8px; object-fit: cover; border: 2px solid #c7d2fe;">` : ''}
          <div>
            <span style="display: inline-block; padding: 2px 10px; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; border-radius: 14px; font-size: 10px; font-weight: 600; margin-bottom: 4px;">${rental.vehicle.brand || 'Vehicle'}</span>
            <div style="font-weight: 700; font-size: 14px; color: #1e1b4b;">${rental.vehicle.name}</div>
            <div style="display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
              ${rental.vehicle.year ? `<span style="display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 500; background: #e0f2fe; border: 1px solid #7dd3fc; color: #0369a1;">📅 ${rental.vehicle.year}</span>` : ''}
              ${rental.vehicle.color ? `<span style="display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 500; background: #fae8ff; border: 1px solid #e879f9; color: #a21caf;">🎨 ${rental.vehicle.color}</span>` : ''}
              ${rental.vehicle.type ? `<span style="display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 500; background: #dcfce7; border: 1px solid #86efac; color: #15803d;">🏷️ ${rental.vehicle.type}</span>` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Period -->
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase;">📅 Rental Period</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="border-radius: 10px; padding: 12px; text-align: center; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 2px solid #6ee7b7;">
            <div style="width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 6px; font-size: 14px; background: #10b981; color: white;">🚀</div>
            <div style="font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Delivery</div>
            <div style="font-weight: 700; font-size: 12px; color: #1e1b4b;">📅 ${formatDate(rental.deliveryDate)}</div>
            <div style="font-weight: 600; font-size: 11px; margin-top: 2px; color: #059669;">⏰ ${formatTime(rental.deliveryTime)}</div>
          </div>
          <div style="border-radius: 10px; padding: 12px; text-align: center; background: linear-gradient(135deg, #fef2f2, #fecaca); border: 2px solid #fca5a5;">
            <div style="width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 6px; font-size: 14px; background: #f43f5e; color: white;">🏁</div>
            <div style="font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Return</div>
            <div style="font-weight: 700; font-size: 12px; color: #1e1b4b;">📅 ${formatDate(rental.returnDate)}</div>
            <div style="font-weight: 600; font-size: 11px; margin-top: 2px; color: #e11d48;">⏰ ${formatTime(rental.returnTime)}</div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 10px;">
          <span style="display: inline-block; padding: 4px 14px; background: linear-gradient(135deg, #ddd6fe, #bfdbfe); color: #1e1b4b; border-radius: 18px; font-size: 11px; font-weight: 600; text-transform: uppercase;">${rental.rentType.toUpperCase()} RENTAL</span>
        </div>
      </div>

      ${clientImages.length > 0 ? `
      <!-- Client Documents -->
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase;">📋 Client Documents</div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
          ${clientImages.map(img => `
            <div style="background: #f8f7ff; border: 1px solid #e0e7ff; border-radius: 10px; padding: 8px; text-align: center;">
              <p style="font-weight: 600; font-size: 9px; color: #7c3aed; margin-bottom: 6px; text-transform: uppercase;">${img.label}</p>
              <img src="${img.src}" alt="${img.label}" style="width: 100%; max-height: 80px; object-fit: contain; border-radius: 6px; background: white;">
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Payment -->
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase;">💳 Payment Details</div>
        <div style="background: #f8f7ff; border-radius: 10px; padding: 12px; border: 2px solid #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 12px;">Total Rental Amount</span>
            <span style="font-weight: 600; font-size: 13px; color: #1e1b4b;">${formatCurrency(rental.totalAmount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 12px;">Advance Payment</span>
            <span style="font-weight: 600; font-size: 13px; color: #16a34a;">${formatCurrency(rental.advancePayment)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 12px;">Balance Due</span>
            <span style="font-weight: 600; font-size: 13px; color: #dc2626;">${formatCurrency(rental.balance)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; margin: 10px -12px -12px -12px; padding: 12px; border-radius: 0 0 8px 8px;">
            <span style="font-weight: 600;">Payment Status</span>
            <span style="padding: 4px 12px; border-radius: 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: ${rental.paymentStatus === 'paid' ? '#16a34a' : rental.paymentStatus === 'pending' ? '#dc2626' : '#f59e0b'}; color: white;">${rental.paymentStatus.toUpperCase()}</span>
          </div>
        </div>
      </div>

      ${rental.notes ? `
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 12px; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase;">📝 Notes</div>
        <div style="background: #f8f7ff; padding: 12px; border-radius: 8px; color: #4b5563; border-left: 4px solid #7c3aed; font-size: 12px;">${rental.notes}</div>
      </div>
      ` : ''}

      <!-- Signatures -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 24px; padding-top: 16px;">
        <div style="text-align: center;">
          ${rental.clientSignature ? `<img src="${rental.clientSignature}" alt="Client Signature" style="height: 50px; margin-bottom: 4px;">` : '<div style="border-bottom: 2px dashed #9ca3af; height: 50px; margin-bottom: 8px;"></div>'}
          <div style="font-size: 11px; font-weight: 500; color: #6b7280;">Client Signature</div>
        </div>
        <div style="text-align: center;">
          ${rental.ownerSignature ? `<img src="${rental.ownerSignature}" alt="Owner Signature" style="height: 50px; margin-bottom: 4px;">` : '<div style="border-bottom: 2px dashed #9ca3af; height: 50px; margin-bottom: 8px;"></div>'}
          <div style="font-size: 11px; font-weight: 500; color: #6b7280;">Owner Signature</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top: 2px solid #e5e7eb; padding-top: 16px; margin-top: 20px; text-align: center;">
        <div style="font-size: 14px; font-weight: 600; color: #7c3aed;">${company.name}</div>
        <div style="font-size: 11px; color: #6b7280; font-style: italic;">Driven by Trust. Powered by Comfort.</div>
        <p style="margin-top: 10px; font-size: 10px; color: #9ca3af;">Thank you for choosing us!</p>
      </div>
    </div>
  `;

  try {
    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const element = container.querySelector('#pdf-content') as HTMLElement;
    if (!element) {
      throw new Error('PDF content element not found');
    }
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // Save the PDF
    pdf.save(`Agreement-${displayAgreementNumber}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
    // Fallback to print-based PDF
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(container.innerHTML);
        printWindow.document.close();
        printWindow.print();
      } else {
        alert('Failed to generate PDF. Please allow popups and try again.');
      }
    } catch (fallbackError) {
      alert('Failed to generate PDF. Please try again.');
    }
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};
