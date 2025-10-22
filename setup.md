# 🚲 Bicycle Shop Setup Guide

## ✅ Setup Completed Successfully!

Your bicycle shop management system is now configured and ready to use with npm.

## 🚀 Quick Start

### 1. **Both servers together** (Recommended)
```bash
npm run dev
```
This will start:
- Backend on `http://localhost:3001`
- Frontend on `http://localhost:5173`

### 2. **Individual servers**
```bash
# Backend only
npm run dev:server

# Frontend only  
npm run dev:client
```

### 3. **Database seeding** (Optional)
```bash
npm run seed
```

## 🔧 What's Configured

- ✅ **Dependencies**: All npm packages installed
- ✅ **Database**: MongoDB connection ready
- ✅ **Sample Data**: Database seeded with sample parties, inventory, and invoices
- ✅ **Environment**: Development environment configured
- ✅ **Proxy**: Frontend proxy configured to backend API

## 📱 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Example API**: http://localhost:3001/api/parties

## 🛠️ Troubleshooting

### If MongoDB connection fails:
1. Make sure MongoDB is running locally:
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or manually
   mongod
   ```

### If ports are in use:
- Backend uses port 3001
- Frontend uses port 5173
- Kill any conflicting processes or update ports in config files

### If dependency issues:
```bash
npm install --legacy-peer-deps
```

## 📊 Features Ready to Use

1. **Dashboard** - Sales overview and analytics
2. **Party Management** - Suppliers and customers
3. **Inventory** - Stock tracking and management
4. **Invoices** - Purchase and sales invoices
5. **Stock History** - Complete audit trail

## 🎯 Next Steps

1. Start the development servers: `npm run dev`
2. Open http://localhost:5173 in your browser
3. Explore the bicycle shop management features
4. Customize as needed for your business requirements

Happy coding! 🚴‍♂️