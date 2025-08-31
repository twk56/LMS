# 🚀 Render Deployment Guide

## 📋 Prerequisites

1. **GitHub Account** - Your code must be on GitHub
2. **Render Account** - Sign up at https://render.com
3. **Laravel LMS Project** - Ready for deployment

## 🔧 Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your repository has these files:
- `render.yaml` - Render configuration
- `composer.json` - PHP dependencies
- `package.json` - Node.js dependencies
- `database/database.sqlite` - SQLite database (will be created automatically)

### 2. Sign Up for Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "Sign Up" and create an account
3. Connect your GitHub account

### 3. Create Web Service

1. Click "New +" button
2. Select "Web Service"
3. Connect your GitHub repository
4. Choose the repository containing your Laravel LMS

### 4. Configure Service Settings

#### Basic Settings:
- **Name**: `lms-app` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: (leave empty)

#### Build & Deploy:
- **Build Command**:
```bash
composer install --no-dev --optimize-autoloader && npm ci && npm run build && php artisan key:generate --force && php artisan migrate --force && php artisan storage:link && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan optimize
```

- **Start Command**:
```bash
php artisan serve --host=0.0.0.0 --port=$PORT
```

#### Advanced Settings:
- **Health Check Path**: `/health`
- **Auto-Deploy**: Yes

### 5. Environment Variables

Add these environment variables in Render dashboard:

| Key | Value | Description |
|-----|-------|-------------|
| `APP_ENV` | `production` | Application environment |
| `APP_DEBUG` | `false` | Debug mode (disable for production) |
| `DB_CONNECTION` | `sqlite` | Database connection type |
| `CACHE_STORE` | `file` | Cache storage |
| `SESSION_DRIVER` | `file` | Session storage |
| `QUEUE_CONNECTION` | `database` | Queue system |
| `LOG_CHANNEL` | `stderr` | Logging channel |

### 6. Deploy

1. Click "Create Web Service"
2. Render will automatically start building and deploying
3. Monitor the build logs for any errors
4. Wait for deployment to complete

## 🔍 Monitoring & Troubleshooting

### Check Deployment Status

1. Go to your service dashboard
2. Check the "Events" tab for build logs
3. Monitor the "Logs" tab for runtime logs

### Common Issues

#### Build Failures:
- Check if all dependencies are in `composer.json` and `package.json`
- Verify PHP and Node.js versions are compatible
- Check for syntax errors in your code

#### Runtime Errors:
- Check environment variables are set correctly
- Verify database migrations run successfully
- Check file permissions for storage and cache directories

### Health Check

Your app includes a health endpoint at `/health` that returns:
```json
{
  "app": "Laravel LMS",
  "version": "12.24.0",
  "status": "healthy",
  "checks": {
    "app": {"status": "ok"},
    "db": {"status": "ok"},
    "redis": {"status": "ok"},
    "queue": {"status": "ok"}
  }
}
```

## 📊 Free Tier Limitations

### Render Free Tier:
- **Sleep after 15 minutes** of inactivity
- **750 hours/month** of runtime
- **Shared infrastructure**
- **No custom domains** (free tier)
- **Limited bandwidth**

### Recommendations:
- **For Development**: Free tier is perfect
- **For Production**: Consider upgrading to paid plan
- **For Testing**: Free tier works well

## 🔄 Continuous Deployment

### Auto-Deploy:
- Render automatically deploys when you push to `main` branch
- You can disable auto-deploy in service settings
- Manual deployments are also available

### Environment Management:
- Use different branches for staging/production
- Set up multiple services for different environments
- Use environment variables for configuration

## 🛠️ Post-Deployment

### 1. Test Your Application
- Visit your app URL: `https://your-app-name.onrender.com`
- Test all major features
- Check health endpoint: `/health`

### 2. Set Up Monitoring
- Monitor logs in Render dashboard
- Set up alerts for failures
- Track performance metrics

### 3. Database Management
- SQLite database is stored in filesystem
- Consider backing up important data
- For production, consider using external database

### 4. File Storage
- Uploaded files are stored in Render's filesystem
- Files may be lost on service restarts
- Consider using external storage (AWS S3, etc.)

## 🚀 Performance Optimization

### For Production:
1. **Enable Caching**:
   - Configuration cache
   - Route cache
   - View cache
   - Application cache

2. **Database Optimization**:
   - Add indexes to frequently queried columns
   - Optimize database queries
   - Consider using Redis for caching

3. **Asset Optimization**:
   - Minify CSS and JavaScript
   - Enable gzip compression
   - Use CDN for static assets

## 📞 Support

### Render Support:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)

### Laravel Support:
- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Community](https://laravel.com/community)

## ✅ Success Checklist

- [ ] Repository is on GitHub
- [ ] Render account created
- [ ] Web service configured
- [ ] Environment variables set
- [ ] Build successful
- [ ] Health check passes
- [ ] Application accessible
- [ ] All features working
- [ ] Monitoring set up

---

**🎉 Congratulations! Your Laravel LMS is now live on Render!**
