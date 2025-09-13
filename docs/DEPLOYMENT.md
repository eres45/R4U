# Deployment Guide

## Overview

This guide covers deployment strategies for the Movie Review Platform, including both frontend and backend deployment options, environment configuration, and production considerations.

## Prerequisites

Before deploying, ensure you have:

- **Domain name** (optional but recommended)
- **SSL certificate** (for HTTPS)
- **MongoDB Atlas account** or MongoDB server
- **TMDB API key**
- **Environment variables** configured

## Frontend Deployment

### Option 1: Netlify (Recommended)

Netlify provides excellent support for React applications with automatic deployments.

#### Steps:

1. **Build the application:**
```bash
npm run build
```

2. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`

3. **Environment Variables:**
```bash
REACT_APP_TMDB_API_KEY=your_tmdb_api_key
REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api
```

4. **Redirects Configuration:**
Create `public/_redirects` file:
```
/*    /index.html   200
```

### Option 2: Vercel

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Environment Variables:**
Set in Vercel dashboard or via CLI:
```bash
vercel env add REACT_APP_TMDB_API_KEY
vercel env add REACT_APP_API_BASE_URL
```

### Option 3: AWS S3 + CloudFront

1. **Build application:**
```bash
npm run build
```

2. **Create S3 bucket:**
```bash
aws s3 mb s3://your-movie-app-bucket
```

3. **Upload files:**
```bash
aws s3 sync build/ s3://your-movie-app-bucket --delete
```

4. **Configure CloudFront distribution**
5. **Set up custom domain and SSL**

## Backend Deployment

### Option 1: Railway (Recommended)

Railway provides easy deployment for Node.js applications with built-in database support.

#### Steps:

1. **Connect GitHub repository to Railway**

2. **Environment Variables:**
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-review-platform
JWT_SECRET=your-super-secure-jwt-secret-for-production
JWT_EXPIRE=7d
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
CLIENT_URL=https://your-frontend-domain.com
```

3. **Deploy:**
Railway automatically deploys on git push to main branch.

### Option 2: Heroku

1. **Install Heroku CLI**

2. **Create Heroku app:**
```bash
heroku create your-movie-api
```

3. **Set environment variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set TMDB_API_KEY=your_tmdb_api_key
heroku config:set CLIENT_URL=https://your-frontend-domain.com
```

4. **Deploy:**
```bash
git push heroku main
```

5. **Procfile:**
Create `Procfile` in server directory:
```
web: node server.js
```

### Option 3: DigitalOcean Droplet

1. **Create Ubuntu droplet**

2. **Install Node.js and PM2:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

3. **Clone repository:**
```bash
git clone your-repository-url
cd movie-review-platform/server
npm install --production
```

4. **Environment setup:**
```bash
cp .env.example .env
# Edit .env with production values
```

5. **Start with PM2:**
```bash
pm2 start server.js --name "movie-api"
pm2 startup
pm2 save
```

6. **Nginx configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Deployment

### MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas account**

2. **Create cluster:**
   - Choose cloud provider and region
   - Select cluster tier (M0 for free tier)
   - Configure cluster settings

3. **Database setup:**
   - Create database user
   - Configure network access (IP whitelist)
   - Get connection string

4. **Connection string format:**
```
mongodb+srv://username:password@cluster.mongodb.net/movie-review-platform?retryWrites=true&w=majority
```

### Self-hosted MongoDB

1. **Install MongoDB:**
```bash
# Ubuntu
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

2. **Security configuration:**
```bash
# Create admin user
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["userAdminAnyDatabase"]
})
```

3. **Enable authentication in `/etc/mongod.conf`:**
```yaml
security:
  authorization: enabled
```

## Environment Configuration

### Production Environment Variables

#### Frontend (.env.production)
```bash
REACT_APP_TMDB_API_KEY=your_tmdb_api_key
REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api
```

#### Backend (.env)
```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-review-platform

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
JWT_EXPIRE=7d

# External APIs
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3

# CORS
CLIENT_URL=https://your-frontend-domain.com

# Security (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## SSL/HTTPS Setup

### Let's Encrypt (Free SSL)

1. **Install Certbot:**
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. **Obtain certificate:**
```bash
sudo certbot --nginx -d your-domain.com
```

3. **Auto-renewal:**
```bash
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### CloudFlare (Recommended)

1. **Add domain to CloudFlare**
2. **Enable SSL/TLS encryption**
3. **Configure DNS records**
4. **Enable security features**

## Performance Optimization

### Frontend Optimizations

1. **Build optimization:**
```bash
# Enable production build optimizations
npm run build

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

2. **CDN configuration:**
   - Use CloudFront or CloudFlare for static assets
   - Enable gzip compression
   - Set appropriate cache headers

3. **Image optimization:**
   - Use WebP format when possible
   - Implement lazy loading
   - Optimize TMDB image URLs

### Backend Optimizations

1. **Database indexing:**
```javascript
// Ensure proper indexes are created
db.movies.createIndex({ "title": "text" })
db.reviews.createIndex({ "movieId": 1, "createdAt": -1 })
db.users.createIndex({ "email": 1 }, { unique: true })
```

2. **Caching:**
```javascript
// Implement Redis caching for frequent queries
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache movie details for 1 hour
const cacheMovie = async (movieId, movieData) => {
  await client.setex(`movie:${movieId}`, 3600, JSON.stringify(movieData));
};
```

3. **Rate limiting:**
```javascript
// Implement stricter rate limiting for production
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

## Monitoring and Logging

### Application Monitoring

1. **Error tracking:**
```bash
npm install @sentry/node @sentry/react
```

2. **Performance monitoring:**
```javascript
// Backend monitoring
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });

// Frontend monitoring
import * as Sentry from '@sentry/react';
Sentry.init({ dsn: process.env.REACT_APP_SENTRY_DSN });
```

### Server Monitoring

1. **PM2 monitoring:**
```bash
pm2 install pm2-server-monit
```

2. **Log management:**
```bash
# Rotate logs
pm2 install pm2-logrotate
```

3. **Health checks:**
```javascript
// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Security Considerations

### Production Security Checklist

- [ ] **HTTPS enabled** for all communications
- [ ] **Environment variables** properly secured
- [ ] **Database authentication** enabled
- [ ] **Rate limiting** implemented
- [ ] **CORS** properly configured
- [ ] **Helmet.js** security headers enabled
- [ ] **Input validation** on all endpoints
- [ ] **JWT secrets** are strong and unique
- [ ] **Database backups** configured
- [ ] **Error messages** don't expose sensitive information

### Security Headers

```javascript
// Helmet configuration for production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "image.tmdb.org"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "api.themoviedb.org"]
    }
  }
}));
```

## Backup Strategy

### Database Backups

1. **MongoDB Atlas:**
   - Automatic backups enabled by default
   - Point-in-time recovery available
   - Download backups when needed

2. **Self-hosted MongoDB:**
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --host localhost --port 27017 --out /backup/mongodb_$DATE
tar -czf /backup/mongodb_$DATE.tar.gz /backup/mongodb_$DATE
rm -rf /backup/mongodb_$DATE
```

### Application Backups

1. **Code repository:**
   - Ensure all code is in version control
   - Tag releases for easy rollback
   - Maintain deployment scripts

2. **Environment configuration:**
   - Backup environment variables
   - Document configuration changes
   - Maintain infrastructure as code

## Rollback Strategy

### Quick Rollback Steps

1. **Frontend rollback:**
```bash
# Netlify
netlify sites:list
netlify api listSiteDeploys --site-id=SITE_ID
netlify api restoreSiteDeploy --site-id=SITE_ID --deploy-id=DEPLOY_ID
```

2. **Backend rollback:**
```bash
# Railway
railway rollback

# Heroku
heroku releases
heroku rollback v123
```

3. **Database rollback:**
   - Restore from backup if needed
   - Run migration rollback scripts
   - Verify data integrity

## Troubleshooting

### Common Issues

1. **CORS errors:**
   - Verify CLIENT_URL environment variable
   - Check frontend API base URL
   - Ensure proper CORS configuration

2. **Database connection issues:**
   - Verify MongoDB URI format
   - Check network access settings
   - Confirm authentication credentials

3. **Environment variable issues:**
   - Ensure all required variables are set
   - Check variable naming (case-sensitive)
   - Verify deployment platform configuration

4. **Build failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

### Debugging Tools

1. **Frontend debugging:**
```javascript
// Enable debug mode
localStorage.setItem('debug', 'true');

// Network inspection
console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);
```

2. **Backend debugging:**
```javascript
// Enable detailed logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// Database connection debugging
mongoose.set('debug', true);
```

## Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Review error logs
   - Check application performance
   - Monitor database size and performance

2. **Monthly:**
   - Update dependencies
   - Review security patches
   - Analyze usage metrics

3. **Quarterly:**
   - Security audit
   - Performance optimization review
   - Backup strategy validation

### Update Strategy

1. **Dependency updates:**
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test thoroughly before deploying
npm test
```

2. **Security updates:**
```bash
# Check for security vulnerabilities
npm audit

# Fix automatically when possible
npm audit fix
```

This deployment guide provides comprehensive coverage for deploying your Movie Review Platform to production. Choose the deployment options that best fit your needs and budget, and always test thoroughly in a staging environment before deploying to production.
