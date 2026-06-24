const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({ from: `"Gigly" <${process.env.EMAIL_USER}>`, to, subject, html });
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

const templates = {
  welcome: (name) => ({
    subject: 'Welcome to Gigly!',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px"><h2 style="color:#7C3AED">Welcome to Gigly, ${name}!</h2><p>Your account has been created successfully. Start exploring top freelance talent today.</p><a href="${process.env.CLIENT_URL}" style="background:#7C3AED;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">Go to Gigly</a></div>`,
  }),
  proposalReceived: (clientName, jobTitle, freelancerName) => ({
    subject: `New Proposal on "${jobTitle}"`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px"><h2 style="color:#7C3AED">New Proposal Received</h2><p>Hi ${clientName}, <strong>${freelancerName}</strong> has submitted a proposal for your job <strong>"${jobTitle}"</strong>.</p><a href="${process.env.CLIENT_URL}/client/jobs" style="background:#7C3AED;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">View Proposal</a></div>`,
  }),
  contractCreated: (name, contractTitle) => ({
    subject: `New Contract: ${contractTitle}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px"><h2 style="color:#7C3AED">Contract Created</h2><p>Hi ${name}, a new contract <strong>"${contractTitle}"</strong> has been created for you. Please review and accept it to get started.</p><a href="${process.env.CLIENT_URL}/freelancer/contracts" style="background:#7C3AED;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">View Contract</a></div>`,
  }),
  paymentReceived: (name, amount, invoiceNo) => ({
    subject: `Payment of ₹${amount} Received`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px"><h2 style="color:#7C3AED">Payment Received!</h2><p>Hi ${name}, payment of <strong>₹${amount}</strong> for invoice <strong>${invoiceNo}</strong> has been successfully processed.</p></div>`,
  }),
  passwordReset: (name, url) => ({
    subject: 'Reset Your Gigly Password',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px"><h2 style="color:#7C3AED">Password Reset Request</h2><p>Hi ${name}, click below to reset your password. Link expires in 1 hour.</p><a href="${url}" style="background:#7C3AED;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">Reset Password</a></div>`,
  }),
};

module.exports = { sendEmail, templates };
