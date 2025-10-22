# Deployment Guide for Render

This guide will help you deploy the Bicycle Shop Management System to Render.

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- GitHub account with this repository pushed
- Render account (sign up at https://render.com)
- MongoDB Atlas database (free tier available)

### 2. Setup MongoDB Atlas (If you haven't already)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Render
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)

### 3. Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. **Create New Web Service on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` file

3. **Set Environment Variables**
   Click "Environment" and add:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: production (should be auto-set)
   - `PORT`: 10000 (should be auto-set)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (~5-10 minutes)

#### Option B: Manual Setup

1. **Create New Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - **Name**: vishal-cycle-store (or your choice)
   - **Region**: Oregon (or closest to you)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```

3. **Set Environment Variables**
   Add these in the "Environment" section:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `your-mongodb-connection-string`
   - `PORT` = `10000` (Render will provide this)

4. **Advanced Settings**
   - **Plan**: Free
   - **Auto-Deploy**: Yes (deploys on git push)

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait for deployment to complete

## 📝 Environment Variables Explained

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Tells the app it's in production mode |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `PORT` | `10000` | Port for the server (Render provides this) |

## 🔧 Troubleshooting

### Build Fails

**Error: "Cannot find module 'lefthook'"**
- ✅ Fixed! The `postinstall` script now only runs in production

**Error: "npm ERR! missing script: build"**
- Make sure you pushed the latest code with updated `package.json`

**Error: "ENOENT: no such file or directory"**
- The build process installs dependencies for both root and server
- Check the build logs to see which step failed

### Database Connection Issues

**Error: "MongoServerError: bad auth"**
- Check your MongoDB username and password in the connection string
- Make sure you created a database user in MongoDB Atlas

**Error: "MongooseServerSelectionError"**
- Make sure you whitelisted 0.0.0.0/0 in MongoDB Atlas Network Access
- Check if your connection string is correct

### App Loads but Shows Errors

**404 on API calls**
- Check if the server is properly serving the API routes
- Look at the deployment logs in Render dashboard

**Blank page on load**
- Check the browser console for errors
- Make sure the build completed successfully

## 📊 Monitoring Your Deployment

### View Logs
- Go to Render Dashboard
- Click on your service
- Click "Logs" tab
- You'll see real-time logs of your application

### Check Status
- Green dot = Running
- Red dot = Failed
- Yellow dot = Deploying

### Redeploy
- Go to "Manual Deploy" section
- Click "Clear build cache & deploy"
- Use this if something goes wrong

## 🔄 Updating Your Deployment

Every time you push to GitHub:
1. Render automatically detects the push
2. Runs the build command
3. Deploys the new version
4. Your app is updated!

Manual redeploy:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

## 💡 Important Notes

### Free Tier Limitations
- Your app will spin down after 15 minutes of inactivity
- First request after spin down takes ~30 seconds
- 750 hours/month of runtime (plenty for most use cases)

### Performance
- Use a paid plan ($7/month) to:
  - Keep your app always running
  - Get better performance
  - Access more resources

### Database
- MongoDB Atlas free tier:
  - 512 MB storage
  - Shared RAM and CPU
  - Good for development and small projects

## 📱 Access Your App

Once deployed, your app will be available at:
```
https://vishal-cycle-store.onrender.com
```
(or your custom URL)

## 🛠️ Local Testing Before Deploy

Test the production build locally:

```bash
# Build the app
npm run build

# Start in production mode
NODE_ENV=production npm start
```

Then visit http://localhost:3002

## 🔐 Security Checklist

Before deploying:
- ✅ Never commit `.env` files (already in `.gitignore`)
- ✅ Set strong MongoDB passwords
- ✅ Restrict MongoDB network access after initial setup
- ✅ Keep dependencies updated
- ✅ Monitor your app logs regularly

## 📞 Support

If you encounter issues:
1. Check the Render logs first
2. Read the error messages carefully
3. Check MongoDB Atlas for connection issues
4. Review this guide again
5. Contact Render support (they're very helpful!)

---

**Happy Deploying! 🚀**
