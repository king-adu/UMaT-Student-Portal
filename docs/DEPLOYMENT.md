# UMaT Student Portal - Deployment Guide

This guide covers deploying the UMaT Student Portal to Render.

## Prerequisites

- GitHub account with the repository cloned
- Render account
- MongoDB Atlas account (for production database)
- Paystack account (for payment integration)

## Backend Deployment (Render)

### 1. Connect Repository to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository: `king-adu/UMaT-Student-Portal`
4. Configure the service:
   - **Name**: `umat-portal-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node 18`

### 2. Environment Variables

Add these environment variables in Render dashboard:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/umat-portal
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### 3. Database Setup

1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Replace `your-username`, `your-password`, and `your-cluster` in the MONGODB_URI
4. Add the connection string to Render environment variables

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically deploy your backend
3. Note the service URL (e.g., `https://umat-portal-backend.onrender.com`)

## Frontend Deployment (Render)

### 1. Create Static Site

1. Go to Render Dashboard
2. Click "New +" and select "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `umat-portal-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

### 2. Environment Variables

Add these environment variables:

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
```

### 3. Deploy

1. Click "Create Static Site"
2. Render will build and deploy your frontend
3. Note the site URL (e.g., `https://umat-portal-frontend.onrender.com`)

## Paystack Configuration

### 1. Create Paystack Account

1. Go to [Paystack](https://paystack.com)
2. Create an account and verify your business
3. Get your API keys from the dashboard

### 2. Update Environment Variables

Replace the Paystack keys in both backend and frontend environment variables.

## Domain Configuration (Optional)

### 1. Custom Domain

1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your domain (e.g., `portal.umat.edu.gh`)
4. Configure DNS records as instructed

### 2. SSL Certificate

Render automatically provides SSL certificates for custom domains.

## Monitoring and Logs

### 1. View Logs

- Go to your service in Render dashboard
- Click "Logs" tab
- Monitor for errors and performance

### 2. Health Checks

- Backend health check: `https://your-backend-url.onrender.com/health`
- API docs: `https://your-backend-url.onrender.com/api-docs`

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Render
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has correct permissions

3. **CORS Errors**
   - Verify FRONTEND_URL in backend environment variables
   - Check CORS configuration in server.js

4. **Payment Integration Issues**
   - Verify Paystack API keys
   - Check webhook configurations
   - Test with Paystack test mode first

### Performance Optimization

1. **Enable Auto-Deploy**
   - Connect GitHub repository
   - Enable automatic deployments on push

2. **Environment Variables**
   - Use Render's environment variable management
   - Keep sensitive data secure

3. **Database Optimization**
   - Use MongoDB Atlas for production
   - Configure proper indexes
   - Monitor query performance

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to Git
   - Use Render's environment variable management
   - Rotate keys regularly

2. **HTTPS**
   - Render provides automatic SSL certificates
   - Always use HTTPS in production

3. **API Security**
   - Implement rate limiting
   - Use JWT tokens properly
   - Validate all inputs

## Backup Strategy

1. **Database Backups**
   - MongoDB Atlas provides automatic backups
   - Configure backup frequency and retention

2. **Code Backups**
   - GitHub provides version control
   - Use feature branches for development

## Maintenance

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Test updates in staging environment

2. **Performance Monitoring**
   - Monitor Render service metrics
   - Set up alerts for downtime
   - Track API response times

## Support

For deployment issues:

1. Check Render documentation
2. Review application logs
3. Test locally before deploying
4. Contact support if needed

---

**Remember**: Always test thoroughly in a staging environment before deploying to production! 