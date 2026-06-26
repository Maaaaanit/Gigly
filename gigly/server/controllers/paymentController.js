const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Contract = require('../models/Contract');
const FreelancerProfile = require('../models/FreelancerProfile');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');
const { notify } = require('../utils/notificationHelper');
const { sendEmail, templates } = require('../utils/emailSender');

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null; // mock mode
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

exports.createOrder = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.body.invoiceId);
    if (!invoice) return error(res, 'Invoice not found', 404);
    if (invoice.clientId.toString() !== req.user._id.toString()) return error(res, 'Forbidden', 403);
    if (invoice.status === 'paid') return error(res, 'Invoice already paid', 400);

    const order = await getRazorpay().orders.create({
      amount: Math.round(invoice.totalAmount * 100),
      currency: 'INR',
      receipt: invoice.invoiceNumber,
      notes: { invoiceId: invoice._id.toString(), clientId: req.user._id.toString() },
    });

    invoice.razorpayOrderId = order.id;
    await invoice.save();

    const payment = await Payment.create({
      invoiceId: invoice._id,
      contractId: invoice.contractId,
      freelancerId: invoice.freelancerId,
      clientId: req.user._id,
      amount: invoice.totalAmount,
      razorpayOrderId: order.id,
      status: 'created',
    });

    return success(res, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    }, 'Order created');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) return error(res, 'Payment verification failed', 400);

    const payment = await Payment.findByIdAndUpdate(paymentId, {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'captured',
      paymentDate: new Date(),
    }, { new: true });

    const invoice = await Invoice.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'paid', razorpayPaymentId: razorpay_payment_id, paidAt: new Date() },
      { new: true }
    );

    const contract = await Contract.findByIdAndUpdate(
      invoice.contractId,
      { $inc: { amountPaid: invoice.subtotal } },
      { new: true }
    );

    await FreelancerProfile.findOneAndUpdate(
      { userId: invoice.freelancerId },
      { $inc: { totalEarnings: invoice.subtotal } }
    );

    const freelancer = await User.findById(invoice.freelancerId);
    const t = templates.paymentReceived(freelancer.name, invoice.subtotal, invoice.invoiceNumber);
    sendEmail({ to: freelancer.email, ...t });

    await notify({
      userId: invoice.freelancerId,
      title: 'Payment Received!',
      message: `₹${invoice.subtotal} received for invoice ${invoice.invoiceNumber}`,
      type: 'payment',
      link: `/freelancer/invoices`,
    });

    return success(res, { payment, invoice }, 'Payment verified and captured');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.mockPay = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.body.invoiceId);
    if (!invoice) return error(res, 'Invoice not found', 404);
    if (invoice.clientId.toString() !== req.user._id.toString()) return error(res, 'Forbidden', 403);
    if (invoice.status === 'paid') return error(res, 'Invoice already paid', 400);

    const payment = await Payment.create({
      invoiceId: invoice._id,
      contractId: invoice.contractId,
      freelancerId: invoice.freelancerId,
      clientId: req.user._id,
      amount: invoice.totalAmount,
      razorpayOrderId: `mock_${Date.now()}`,
      razorpayPaymentId: `mock_pay_${Date.now()}`,
      razorpaySignature: 'mock',
      status: 'captured',
      paymentDate: new Date(),
    });

    invoice.status = 'paid';
    invoice.paidAt = new Date();
    invoice.razorpayPaymentId = payment.razorpayPaymentId;
    await invoice.save();

    await Contract.findByIdAndUpdate(invoice.contractId, { $inc: { amountPaid: invoice.subtotal } });
    await FreelancerProfile.findOneAndUpdate({ userId: invoice.freelancerId }, { $inc: { totalEarnings: invoice.subtotal } });

    const freelancer = await User.findById(invoice.freelancerId);
    if (freelancer) {
      await notify({
        userId: invoice.freelancerId,
        title: 'Payment Received!',
        message: `₹${invoice.subtotal} received for invoice ${invoice.invoiceNumber}`,
        type: 'payment',
        link: `/freelancer/invoices`,
      });
    }

    return success(res, { payment, invoice }, 'Payment successful');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'client') filter.clientId = req.user._id;
    else if (req.user.role === 'freelancer') filter.freelancerId = req.user._id;

    const payments = await Payment.find(filter)
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .populate('freelancerId', 'name avatar')
      .populate('clientId', 'name avatar')
      .sort({ createdAt: -1 });

    return success(res, { payments }, 'Payments fetched');
  } catch (err) {
    return error(res, err.message);
  }
};
