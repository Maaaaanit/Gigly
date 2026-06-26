# Gigly — Freelance Marketplace Platform

A full-stack freelance marketplace web application built with the MERN stack. Gigly connects clients who need work done with skilled freelancers, handling everything from job posting and proposals through contracts, milestones, payments, and reviews.

---

## Features

### For Clients
- Post jobs with detailed requirements, budget, and deadlines
- Browse freelancer profiles and portfolios
- Review and accept/reject proposals
- Manage active contracts with milestone tracking
- Release payments on milestone completion
- Download PDF invoices
- Leave reviews for completed work
- Raise disputes if needed

### For Freelancers
- Build a public profile with skills, experience, and portfolio
- Browse and apply to job listings with custom proposals
- Track active contracts and submit milestone deliverables
- Log timesheets for hourly contracts
- Generate and send invoices to clients
- Real-time messaging with clients per contract

### For Admins
- Dashboard with platform-wide analytics
- Manage all users, jobs, and contracts
- Handle disputes between clients and freelancers
- View contact messages from the public

### Platform-wide
- JWT-based authentication with role separation (client / freelancer / admin)
- Real-time chat and typing indicators via Socket.io
- Email notifications via Nodemailer
- Razorpay payment gateway integration
- File uploads for profile photos and deliverables

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| State / Forms | React Hook Form, Zod, React Context |
| Charts | Recharts |
| Real-time | Socket.io-client |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| Real-time | Socket.io |
| Payments | Razorpay |
| Email | Nodemailer (SMTP) |
| File Uploads | Multer |
| PDF Generation | PDFKit |
| Security | Helmet, CORS, express-validator |
| Testing (client) | Vitest, React Testing Library, MSW |
| Testing (server) | Jest, Supertest, mongodb-memory-server |

---

## Project Structure

```
Gigly/
├── gigly/
│   ├── client/                  # React frontend
│   │   ├── src/
│   │   │   ├── api/             # Axios instance & API calls
│   │   │   ├── components/      # Reusable UI components & layouts
│   │   │   ├── context/         # Auth & Toast context providers
│   │   │   ├── pages/           # Page components by role
│   │   │   │   ├── admin/
│   │   │   │   ├── auth/
│   │   │   │   ├── client/
│   │   │   │   ├── freelancer/
│   │   │   │   └── public/
│   │   │   └── utils/
│   │   ├── vite.config.js
│   │   └── tailwind.config.js
│   │
│   └── server/                  # Express backend
│       ├── config/              # DB connection, Multer config
│       ├── controllers/         # Route handlers (16 modules)
│       ├── middlewares/         # Auth, error handler, validation
│       ├── models/              # Mongoose models (14 schemas)
│       ├── routes/              # Express routers (16 modules)
│       ├── scripts/             # DB seed & migration scripts
│       ├── utils/               # Email, PDF, notifications, API response
│       ├── uploads/             # User-uploaded files (gitignored)
│       ├── __tests__/           # Jest test suites
│       └── server.js            # Entry point with Socket.io
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account and cluster
- A [Razorpay](https://razorpay.com) account (test keys are fine for development)
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) for email

### 1. Clone the repository

```bash
git clone https://github.com/Maaaaanit/Gigly.git
cd Gigly
```

### 2. Set up the server

```bash
cd gigly/server
npm install
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/gigly
JWT_SECRET=your_strong_random_secret
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173

```

### 3. Set up the client

```bash
cd gigly/client
npm install
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

```

### 4. Seed the admin user

```bash
cd gigly/server
npm run seed:admin
```

This creates the default admin account. Check `scripts/seedAdmin.js` for the credentials and change them before going to production.

### 5. Run in development

Open two terminals:

```bash
# Terminal 1 — backend
cd gigly/server
npm run dev

# Terminal 2 — frontend
cd gigly/client
npm run dev
```

The app will be available at `http://localhost:5173`. The API runs on `http://localhost:5000`.

---

## API Reference

All endpoints are prefixed with `/api`.

| Prefix | Description |
|---|---|
| `/api/auth` | Register, login, profile |
| `/api/freelancers` | Freelancer profiles, search, browse |
| `/api/jobs` | Job CRUD, search, filtering |
| `/api/proposals` | Submit, accept, reject proposals |
| `/api/contracts` | Contract lifecycle management |
| `/api/milestones` | Milestone creation, submission, approval |
| `/api/timesheets` | Hourly timesheet logging |
| `/api/invoices` | Invoice generation and PDF download |
| `/api/payments` | Razorpay order creation and verification |
| `/api/reviews` | Post and fetch reviews |
| `/api/messages` | Contract-scoped messaging |
| `/api/notifications` | User notifications |
| `/api/analytics` | Platform and user analytics |
| `/api/disputes` | Raise and manage disputes |
| `/api/contact` | Public contact form |
| `/api/admin` | Admin-only management endpoints |
| `/api/health` | Health check |

---

## Environment Variables

### Server (`gigly/server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default: 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `7d`) |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | SMTP sender email |
| `EMAIL_PASS` | SMTP password / Gmail App Password |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |


### Client (`gigly/client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_SOCKET_URL` | Socket.io server URL |


---

## Testing

### Server tests (Jest + Supertest)

```bash
cd gigly/server
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Client tests (Vitest + React Testing Library)

```bash
cd gigly/client
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

---

## Scripts

| Command | Location | Description |
|---|---|---|
| `npm run dev` | server | Start backend with nodemon |
| `npm start` | server | Start backend in production mode |
| `npm run seed:admin` | server | Create the default admin user |
| `npm run dev` | client | Start Vite dev server |
| `npm run build` | client | Build for production |
| `npm run preview` | client | Preview production build locally |

---

## License

MIT
