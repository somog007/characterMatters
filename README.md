# Character Matters - Video & eBook Platform for Children

A full-stack video streaming and eBook marketplace platform designed for children with engaging animations and interactive features.

## Features

- 🎥 Video streaming with premium/free content
- 📚 eBook marketplace with purchase system
- 👤 User authentication and authorization
- 💳 Stripe payment integration
- 🎨 Child-friendly animated interface
- 📱 Responsive design
- 🔒 Secure file storage with AWS S3

## Tech Stack

### Frontend
- React 18
- TypeScript
- Redux Toolkit
- React Router v6
- Tailwind CSS
- Vite
- Framer Motion (animations)

### Backend
- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Stripe for payments
- AWS S3 for file storage
- SendGrid for emails

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- AWS Account (for S3)
- Stripe Account
- SendGrid Account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd characterMatters
```

2. Install backend dependencies:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the backend server:
```bash
cd backend
npm run dev
```

3. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

## Project Structure

```
characterMatters/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Environment Variables

See `.env.example` files in both `backend` and `frontend` directories for required environment variables.

## Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT License
