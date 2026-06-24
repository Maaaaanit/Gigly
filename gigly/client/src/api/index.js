import api from './axios';

export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  getMe: () => api.get('/auth/me'),
  updatePassword: (d) => api.put('/auth/password', d),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (d) => api.post('/auth/reset-password', d),
};

export const freelancerAPI = {
  browse: (p) => api.get('/freelancers/browse', { params: p }),
  getProfile: (userId) => api.get(`/freelancers/${userId}`),
  getMyProfile: () => api.get('/freelancers/me'),
  updateProfile: (userId, d) => api.put(`/freelancers/${userId}`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateAvatar: (d) => api.post('/freelancers/avatar', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getCategories: () => api.get('/freelancers/categories'),
};

export const jobAPI = {
  create: (d) => api.post('/jobs', d),
  getAll: (p) => api.get('/jobs', { params: p }),
  getById: (id) => api.get(`/jobs/${id}`),
  getMyJobs: (p) => api.get('/jobs/my', { params: p }),
  update: (id, d) => api.put(`/jobs/${id}`, d),
  close: (id) => api.put(`/jobs/${id}/close`),
  delete: (id) => api.delete(`/jobs/${id}`),
  getProposals: (id) => api.get(`/jobs/${id}/proposals`),
  submitProposal: (jobId, d) => api.post(`/jobs/${jobId}/proposals`, d),
};

export const proposalAPI = {
  getMyProposals: () => api.get('/proposals/my'),
  withdraw: (id) => api.put(`/proposals/${id}/withdraw`),
  accept: (id, d) => api.put(`/proposals/${id}/accept`, d),
  reject: (id) => api.put(`/proposals/${id}/reject`),
};

export const contractAPI = {
  createDirect: (d) => api.post('/contracts', d),
  getAll: (p) => api.get('/contracts', { params: p }),
  getById: (id) => api.get(`/contracts/${id}`),
  accept: (id) => api.put(`/contracts/${id}/accept`),
  updateStatus: (id, status) => api.put(`/contracts/${id}/status`, { status }),
};

export const milestoneAPI = {
  create: (d) => api.post('/milestones', d),
  getByContract: (contractId) => api.get(`/milestones/contract/${contractId}`),
  submit: (id, d) => api.put(`/milestones/${id}/submit`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  approve: (id) => api.put(`/milestones/${id}/approve`),
  reject: (id, rejectionRemark) => api.put(`/milestones/${id}/reject`, { rejectionRemark }),
};

export const timesheetAPI = {
  submit: (d) => api.post('/timesheets', d),
  getAll: (p) => api.get('/timesheets', { params: p }),
  approve: (id) => api.put(`/timesheets/${id}/approve`),
  reject: (id, rejectionRemark) => api.put(`/timesheets/${id}/reject`, { rejectionRemark }),
};

export const invoiceAPI = {
  getAll: (p) => api.get('/invoices', { params: p }),
  getById: (id) => api.get(`/invoices/${id}`),
  downloadPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};

export const paymentAPI = {
  createOrder: (d) => api.post('/payments/create-order', d),
  verify: (d) => api.post('/payments/verify', d),
  mockPay: (d) => api.post('/payments/mock-pay', d),
  getAll: () => api.get('/payments'),
};

export const reviewAPI = {
  create: (d) => api.post('/reviews', d),
  getFreelancerReviews: (freelancerId) => api.get(`/reviews/freelancer/${freelancerId}`),
};

export const messageAPI = {
  getMessages: (contractId) => api.get(`/messages/${contractId}`),
  sendMessage: (contractId, content) => api.post(`/messages/${contractId}`, { content }),
  getUnreadCount: () => api.get('/messages/unread'),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const analyticsAPI = {
  getFreelancerStats: () => api.get('/analytics/freelancer'),
  getClientStats: () => api.get('/analytics/client'),
  getAdminStats: () => api.get('/analytics/admin'),
};

export const contactAPI = {
  submit: (d) => api.post('/contact', d),
};

export const disputeAPI = {
  create: (d) => api.post('/disputes', d),
  getMine: () => api.get('/disputes/my'),
  getAll: (p) => api.get('/disputes', { params: p }),
  resolve: (id, d) => api.put(`/disputes/${id}/resolve`, d),
};

export const adminAPI = {
  getUsers: (p) => api.get('/admin/users', { params: p }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  getJobs: (p) => api.get('/admin/jobs', { params: p }),
  closeJob: (id) => api.put(`/admin/jobs/${id}/close`),
  getContracts: (p) => api.get('/admin/contracts', { params: p }),
  getContactMessages: (p) => api.get('/admin/contact-messages', { params: p }),
  updateContactMessageStatus: (id, status) => api.put(`/admin/contact-messages/${id}/status`, { status }),
};
