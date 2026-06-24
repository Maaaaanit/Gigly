const Invoice = require('../models/Invoice');
const { success, error } = require('../utils/apiResponse');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

exports.getInvoices = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === 'freelancer') filter.freelancerId = req.user._id;
    else if (req.user.role === 'client') filter.clientId = req.user._id;

    if (status) filter.status = status;

    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .populate('freelancerId', 'name avatar email')
      .populate('clientId', 'name avatar email')
      .populate('contractId', 'title type')
      .populate('milestoneId', 'title')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return success(res, { invoices, total }, 'Invoices fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('freelancerId', 'name avatar email')
      .populate('clientId', 'name avatar email')
      .populate('contractId', 'title type totalBudget')
      .populate('milestoneId', 'title amount');
    if (!invoice) return error(res, 'Invoice not found', 404);
    return success(res, { invoice }, 'Invoice fetched');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('freelancerId', 'name email')
      .populate('clientId', 'name email');
    if (!invoice) return error(res, 'Invoice not found', 404);

    if (!invoice.pdfUrl) {
      const pdfUrl = await generateInvoicePDF(invoice, invoice.freelancerId, invoice.clientId);
      invoice.pdfUrl = pdfUrl;
      await invoice.save();
    }

    const filePath = path.join(__dirname, '..', invoice.pdfUrl);
    if (!fs.existsSync(filePath)) return error(res, 'PDF not found', 404);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    return error(res, err.message);
  }
};
