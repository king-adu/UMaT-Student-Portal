# UMaT Student Portal - Project Blueprint

## Project Overview
A comprehensive student portal for University of Mines & Technology (UMaT) with role-based authentication, course registration, departmental news, and payment tracking.

## Tech Stack
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Frontend**: React + Context API + React Router
- **Authentication**: JWT with role-based access
- **Payments**: Paystack integration
- **Testing**: Jest (backend) + React Testing Library (frontend)
- **Deployment**: Render
- **Documentation**: Swagger/OpenAPI

## File Structure

```
umat-student-portal/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   ├── jwt.js
│   │   └── paystack.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── courseController.js
│   │   ├── newsController.js
│   │   ├── paymentController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── roleCheck.js
│   │   ├── upload.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── News.js
│   │   ├── Comment.js
│   │   ├── Reaction.js
│   │   ├── Payment.js
│   │   └── Program.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── courses.js
│   │   ├── news.js
│   │   ├── payments.js
│   │   └── admin.js
│   ├── services/
│   │   ├── paystackService.js
│   │   ├── emailService.js
│   │   └── notificationService.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── helpers.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── courses.test.js
│   │   └── news.test.js
│   ├── docs/
│   │   └── swagger.json
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Signup.js
│   │   │   ├── dashboard/
│   │   │   │   ├── StudentDashboard.js
│   │   │   │   ├── AdminDashboard.js
│   │   │   │   ├── CourseRegistration.js
│   │   │   │   ├── DepartmentalNews.js
│   │   │   │   └── AccountMenu.js
│   │   │   ├── admin/
│   │   │   │   ├── NewsManagement.js
│   │   │   │   ├── UserManagement.js
│   │   │   │   ├── PaymentStats.js
│   │   │   │   └── CourseManagement.js
│   │   │   ├── common/
│   │   │   │   ├── Header.js
│   │   │   │   ├── Sidebar.js
│   │   │   │   ├── Loading.js
│   │   │   │   └── ErrorBoundary.js
│   │   │   └── news/
│   │   │       ├── NewsCard.js
│   │   │       ├── CommentSection.js
│   │   │       └── ReactionButtons.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── NewsContext.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useApi.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── styles/
│   │   │   ├── components/
│   │   │   └── index.css
│   │   ├── tests/
│   │   │   ├── Login.test.js
│   │   │   └── Dashboard.test.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── README.md
├── postman/
│   └── UMaT-Student-Portal.postman_collection.json
├── docs/
│   ├── API_DOCUMENTATION.md
│   └── DEPLOYMENT.md
├── .gitignore
├── README.md
└── package.json
```

## Database Schemas (Mongoose)

### User Schema
```javascript
{
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  referenceNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  department: { type: String, required: true },
  program: { type: String, required: true },
  level: { type: Number, required: true },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Course Schema
```javascript
{
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  credits: { type: Number, required: true },
  semester: { type: String, enum: ['First', 'Second'], required: true },
  program: { type: String, required: true },
  level: { type: Number, required: true },
  department: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}
```

### Course Registration Schema
```javascript
{
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: String, enum: ['First', 'Second'], required: true },
  academicYear: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }
}
```

### News Schema
```javascript
{
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, required: true },
  image: { type: String },
  allowComments: { type: Boolean, default: true },
  allowReactions: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Comment Schema
```javascript
{
  news: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}
```

### Reaction Schema
```javascript
{
  news: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'], required: true },
  createdAt: { type: Date, default: Date.now }
}
```

### Payment Schema
```javascript
{
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'GHS' },
  paystackReference: { type: String, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  description: { type: String },
  department: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}
```

## API Routes

### Authentication Routes
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `PUT /api/auth/change-password` - Change password

### User Routes
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/online` - Get online users (admin only)
- `GET /api/users/by-department/:department` - Get users by department (admin only)

### Course Routes
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `GET /api/courses/program/:program/level/:level` - Get courses by program and level
- `POST /api/courses/register` - Register for courses
- `GET /api/courses/registrations` - Get user's course registrations
- `PUT /api/courses/registrations/:id` - Update registration status (admin only)

### News Routes
- `GET /api/news` - Get all news
- `GET /api/news/department/:department` - Get news by department
- `POST /api/news` - Create news (admin only)
- `PUT /api/news/:id` - Update news (admin only)
- `DELETE /api/news/:id` - Delete news (admin only)
- `POST /api/news/:id/comments` - Add comment to news
- `DELETE /api/news/:id/comments/:commentId` - Delete comment
- `POST /api/news/:id/reactions` - Add reaction to news
- `DELETE /api/news/:id/reactions` - Remove reaction from news

### Payment Routes
- `POST /api/payments/initialize` - Initialize Paystack payment
- `POST /api/payments/verify` - Verify Paystack payment
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/stats` - Get payment statistics (admin only)

### Admin Routes
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/users/stats` - Get user statistics
- `GET /api/admin/payments/stats` - Get payment statistics
- `POST /api/admin/courses` - Create course (admin only)
- `PUT /api/admin/courses/:id` - Update course (admin only)
- `DELETE /api/admin/courses/:id` - Delete course (admin only)

## React Screen Structure

### Public Pages
- Login Page
- Student Registration Page

### Student Dashboard
- Dashboard Overview
- Course Registration Page
- Departmental News Page
- Account Management Page

### Admin Dashboard
- Admin Overview with Real-time Stats
- News Management Page
- User Management Page
- Course Management Page
- Payment Statistics Page

## Authentication Flow

1. **Student Registration**:
   - User fills registration form (email, firstName, lastName, phoneNumber, referenceNumber, password)
   - Backend validates data and creates user account
   - User receives confirmation email
   - User can login with email/password

2. **Admin Login**:
   - Admin uses predefined credentials
   - System validates admin role
   - Redirects to admin dashboard

3. **JWT Authentication**:
   - Login returns JWT token
   - Token stored in localStorage
   - Protected routes check token validity
   - Token refresh mechanism

4. **Role-based Routing**:
   - Students redirected to student dashboard
   - Admins redirected to admin dashboard
   - Route guards prevent unauthorized access

## Plan

### Phase 1: Project Setup & Backend Foundation
1. Initialize project structure
2. Set up Express server with middleware
3. Configure MongoDB connection
4. Create basic user authentication
5. Set up JWT middleware
6. Create basic user models

### Phase 2: Core Backend Features
1. Implement course registration system
2. Create news posting and interaction system
3. Set up Paystack payment integration
4. Implement admin dashboard statistics
5. Add file upload functionality for news images

### Phase 3: Frontend Foundation
1. Set up React app with routing
2. Create authentication context
3. Build login and registration pages
4. Implement protected routes
5. Create basic dashboard layouts

### Phase 4: Student Features
1. Build course registration interface
2. Create departmental news page with interactions
3. Implement account management features
4. Add mobile-responsive design

### Phase 5: Admin Features
1. Build admin dashboard with real-time stats
2. Create news management interface
3. Implement user management
4. Add payment tracking features

### Phase 6: Testing & Deployment
1. Write unit tests for backend
2. Write component tests for frontend
3. Set up Render deployment
4. Create API documentation
5. Performance optimization

### Phase 7: Final Polish
1. Add error handling and validation
2. Implement real-time features (WebSocket)
3. Add search and filtering
4. Security hardening
5. Documentation completion

## Key Features Implementation

### Course Registration System
- Radio buttons for semester selection
- Dropdown for program and level selection
- Backend grouping by program and level
- Payment integration for course fees

### Departmental News System
- Department-based news filtering
- Like and comment functionality
- Admin controls for interaction permissions
- Image upload support

### Admin Dashboard
- Real-time user statistics
- Department-wise grouping
- Payment tracking by department
- News management with image uploads

### Mobile-First Design
- Responsive UI components
- Touch-friendly interactions
- Progressive Web App features
- Offline capability for basic features

This blueprint provides a comprehensive foundation for building the UMaT Student Portal with all the requested features. The modular structure ensures scalability and maintainability while the detailed schemas and routes provide clear implementation guidelines. 