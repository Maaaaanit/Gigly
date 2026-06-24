const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = (invoice, freelancer, client) => {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, '..', 'uploads', 'invoices');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `invoice-${invoice.invoiceNumber}.pdf`;
    const filepath = path.join(dir, filename);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fillColor('#7C3AED').fontSize(26).font('Helvetica-Bold').text('Gigly', 50, 50);
    doc.fillColor('#6B7280').fontSize(10).font('Helvetica').text('Freelance Marketplace', 50, 82);
    doc.fillColor('#1F2937').fontSize(18).font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right' });
    doc.fillColor('#7C3AED').fontSize(11).font('Helvetica').text(`#${invoice.invoiceNumber}`, 400, 76, { align: 'right' });

    doc.moveTo(50, 108).lineTo(545, 108).strokeColor('#E5E7EB').stroke();

    // Bill from / to
    doc.fillColor('#9CA3AF').fontSize(8).text('FROM', 50, 124);
    doc.fillColor('#1F2937').fontSize(11).font('Helvetica-Bold').text(freelancer.name, 50, 136);
    doc.fillColor('#6B7280').fontSize(9).font('Helvetica').text(freelancer.email, 50, 150);

    doc.fillColor('#9CA3AF').fontSize(8).text('TO', 320, 124);
    doc.fillColor('#1F2937').fontSize(11).font('Helvetica-Bold').text(client.name, 320, 136);
    doc.fillColor('#6B7280').fontSize(9).font('Helvetica').text(client.email, 320, 150);

    doc.fillColor('#9CA3AF').fontSize(8).text('ISSUE DATE', 50, 180);
    doc.fillColor('#1F2937').fontSize(10).text(new Date(invoice.createdAt).toLocaleDateString('en-IN'), 50, 193);
    doc.fillColor('#9CA3AF').fontSize(8).text('DUE DATE', 200, 180);
    doc.fillColor('#1F2937').fontSize(10).text(invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : '—', 200, 193);

    doc.moveTo(50, 218).lineTo(545, 218).strokeColor('#E5E7EB').stroke();

    // Table header
    doc.fillColor('#F9FAFB').rect(50, 221, 495, 22).fill();
    doc.fillColor('#374151').fontSize(8).font('Helvetica-Bold').text('DESCRIPTION', 60, 229);
    doc.text('AMOUNT (₹)', 450, 229, { width: 85, align: 'right' });
    doc.moveTo(50, 243).lineTo(545, 243).strokeColor('#E5E7EB').stroke();

    // Items
    let y = 256;
    doc.font('Helvetica');
    invoice.items.forEach((item) => {
      doc.fillColor('#1F2937').fontSize(10).text(item.description, 60, y, { width: 350 });
      doc.text(`₹${item.amount.toFixed(2)}`, 400, y, { width: 135, align: 'right' });
      y += 22;
      doc.moveTo(50, y).lineTo(545, y).strokeColor('#F3F4F6').stroke();
      y += 4;
    });

    // Totals
    y += 12;
    doc.fillColor('#6B7280').fontSize(10).text('Subtotal:', 360, y);
    doc.fillColor('#1F2937').text(`₹${invoice.subtotal.toFixed(2)}`, 400, y, { width: 135, align: 'right' });
    y += 18;
    doc.fillColor('#6B7280').text('GST (18%):', 360, y);
    doc.fillColor('#1F2937').text(`₹${invoice.gst.toFixed(2)}`, 400, y, { width: 135, align: 'right' });
    y += 18;
    doc.moveTo(360, y).lineTo(545, y).strokeColor('#E5E7EB').stroke();
    y += 10;
    doc.fillColor('#7C3AED').fontSize(13).font('Helvetica-Bold').text('Total:', 360, y);
    doc.text(`₹${invoice.totalAmount.toFixed(2)}`, 400, y, { width: 135, align: 'right' });

    // Footer
    doc.moveTo(50, 700).lineTo(545, 700).strokeColor('#E5E7EB').stroke();
    doc.fillColor('#9CA3AF').fontSize(9).font('Helvetica')
      .text('Thank you for using Gigly. This is a system-generated invoice.', 50, 712, { align: 'center' });

    doc.end();
    stream.on('finish', () => resolve(`/uploads/invoices/${filename}`));
    stream.on('error', reject);
  });
};

module.exports = { generateInvoicePDF };
