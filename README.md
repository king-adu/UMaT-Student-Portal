# UMaT Student Portal

A comprehensive student portal for University of Mines & Technology (UMaT) with role-based authentication, course registration, departmental news, and payment tracking.

## 🚀 Features

### For Students
- **User Registration & Authentication**: Secure signup/login with email and reference number
- **Course Registration**: Register for courses with semester, program, and level selection
- **Departmental News**: View and interact with department-specific news posts
- **Payment Integration**: Paystack integration for course fees and other payments
- **Account Management**: Profile management and password changes

### For Admins
- **Dashboard Analytics**: Real-time statistics on users, payments, and activities
- **News Management**: Create, edit, and manage departmental news with image uploads
- **User Management**: Monitor student activities and manage accounts
- **Course Management**: Add, edit, and manage course offerings
- **Payment Tracking**: Monitor payment statistics by department

## 🛠️ Tech Stack

- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Frontend**: React + Context API + React Router
- **Authentication**: JWT with role-based access control
- **Payments**: Paystack integration
- **Testing**: Jest (backend) + React Testing Library (frontend)
- **Deployment**: Render
- **Documentation**: Swagger/OpenAPI

## 📁 Project Structure

```
umat-student-portal/
├── backend/          # Express.js API server
├── frontend/         # React.js client application
├── docs/            # Documentation
├── postman/         # API testing collections
└── PROJECT_BLUEPRINT.md  # Detailed project blueprint
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/king-adu/UMaT-Student-Portal.git
   cd UMaT-Student-Portal
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   ```bash
   # Backend (.env)
   cd ../backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start Development Servers**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm start
   ```

## 🔧 Configuration

### Backend Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/umat-portal
JWT_SECRET=your-jwt-secret
PAYSTACK_SECRET_KEY=your-paystack-secret
PAYSTACK_PUBLIC_KEY=your-paystack-public
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_PAYSTACK_PUBLIC_KEY=your-paystack-public
```

## 📚 API Documentation

The API documentation is available at `/api-docs` when the server is running, or check the `docs/` directory for detailed API specifications.

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### Frontend Deployment (Render)
1. Build the React app: `npm run build`
2. Deploy the build folder to Render static site

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **King Adu** - Full Stack Developer

## 📞 Support

For support, email support@umat-portal.com or create an issue in this repository.

## 🔗 Links

- [Live Demo](https://umat-portal.onrender.com)
- [API Documentation](https://umat-portal.onrender.com/api-docs)
- [GitHub Repository](https://github.com/king-adu/UMaT-Student-Portal)

---

**Built with ❤️ for University of Mines & Technology (UMaT)** 