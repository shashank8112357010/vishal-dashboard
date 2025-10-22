# 🚲 Bicycle Shop Management System

A full-stack monorepo application for managing bicycle shop operations including inventory, parties (suppliers/customers), invoices, and sales tracking.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Ant Design
- **Backend**: Express + TypeScript + MongoDB + Mongoose
- **State Management**: Zustand + React Query
- **Monorepo**: npm with separate server directory

## 📦 Project Structure

```
bicycle-shop-monorepo/
├── src/                       # Frontend React application
│   ├── components/
│   │   ├── Party/             # Party management components
│   │   ├── Inventory/         # Inventory management components
│   │   ├── Invoice/           # Invoice management components
│   │   └── Dashboard/         # Dashboard widgets
│   ├── services/              # API services (React Query)
│   ├── store/                 # Zustand stores
│   ├── types/                 # TypeScript type definitions
│   └── pages/                 # Page components
├── server/                    # Backend Express application
│   ├── src/
│   │   ├── models/            # Mongoose models
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── config/            # Database configuration
│   │   └── utils/             # Utilities and seed data
├── package.json               # Root package.json with all dependencies
└── vite.config.ts             # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 8+
- MongoDB (local or cloud)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd bicycle-shop-monorepo
   npm run install:all
   ```

2. **Setup environment variables**
   
   **Server (.env)**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/bicycle-shop
   NODE_ENV=development
   ```

   **Frontend (.env)**
   ```bash
   cd vishal-dashboard
   cp .env.example .env
   # Edit .env
   VITE_APP_API_BASE_URL=http://localhost:5000/api
   ```

3. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

5. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:server  # Backend on http://localhost:5000
   npm run dev:client  # Frontend on http://localhost:5173
   ```

## 🎯 Features

### 📊 Dashboard
- Sales overview with profit/loss tracking
- Inventory status and low stock alerts
- Recent transactions
- Key performance indicators

### 👥 Party Management
- Manage suppliers (creditors) and customers (debtors)
- Track balance amounts
- GST number validation
- Contact information management

### 📦 Inventory Management
- Track bicycles and spare parts
- Multiple unit types (piece, set, pair, dozen, packet)
- Stock adjustments with audit trail
- Purchase and selling price tracking
- Low stock alerts

### 🧾 Invoice Management
- Create purchase and sales invoices
- Automatic stock updates
- Party balance calculations
- Payment status tracking
- Invoice numbering system

### 📈 Stock History
- Complete audit trail of stock movements
- Automatic tracking on invoice operations
- Manual adjustment logging
- Reason tracking for all changes

## 🔧 API Endpoints

### Parties
- `GET /api/parties` - Get all parties
- `POST /api/parties` - Create party
- `PUT /api/parties/:id` - Update party
- `DELETE /api/parties/:id` - Delete party

### Inventory
- `GET /api/inventory` - Get all items
- `POST /api/inventory` - Create item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item
- `POST /api/inventory/adjust` - Adjust stock

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice (auto-updates stock & balances)
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice (reverses changes)

## 💻 Development

### Backend Development
```bash
npm run dev:server  # Start with hot reload
npm run build:server  # Build for production
npm run start       # Start production server
```

### Frontend Development
```bash
npm run dev:client  # Start development server
npm run build:client  # Build for production
npm run preview     # Preview production build
```

### Database Management
```bash
npm run seed    # Populate with sample data
```

## 🏗️ Data Models

### Party
```typescript
{
  partyName: string;
  partyType: 'creditor' | 'debtor';
  phoneNumber: string;
  state: string;
  city: string;
  gstNumber?: string;
  address: string;
  balanceAmount: number;
  transactions: ObjectId[];
}
```

### Inventory
```typescript
{
  itemName: string;
  category: 'bicycle' | 'spare_part';
  unitType: 'piece' | 'set' | 'pair' | 'dozen' | 'packet';
  bundleCount: number;
  quantityAvailable: number;
  stockType: 'loose' | 'fitted';
  purchasePrice: number;
  sellingPrice: number;
  lastBorrowedDate?: Date;
  partyId?: ObjectId;
}
```

### Invoice
```typescript
{
  invoiceNumber: string;
  date: Date;
  partyId: ObjectId;
  items: Array<{
    itemId: ObjectId;
    quantity: number;
    pricePerUnit: number;
    totalAmount: number;
  }>;
  invoiceType: 'purchase' | 'sale';
  paymentStatus: 'pending' | 'partial' | 'paid';
  totalAmount: number;
  balanceAmount: number;
  notes?: string;
}
```

## 🔄 Business Logic

### Invoice Creation
1. Validates item availability for sales
2. Updates inventory quantities
3. Creates stock history entries
4. Updates party balance amounts
5. Links transactions to parties

### Stock Management
- Purchase invoices: Add to stock
- Sales invoices: Subtract from stock (with validation)
- Manual adjustments: Track with reasons
- Complete audit trail maintained

### Party Balance Tracking
- Automatic updates on invoice operations
- Creditor balances for purchases
- Debtor balances for sales
- Payment status affects balance calculations

## 🚀 Deployment

### Backend Deployment
```bash
npm run build:server
npm run start
```

### Frontend Deployment
```bash
npm run build:client
# Deploy dist/ folder to your hosting service
```

### Environment Variables for Production
- Set `MONGO_URI` to your production MongoDB
- Set `NODE_ENV=production`
- Configure CORS origins for security
- Set proper `VITE_APP_API_BASE_URL` in frontend

## 🔧 Customization

The application is built with modularity in mind:

- **Add new entity types**: Create models, controllers, and services
- **Extend inventory**: Add new categories or unit types
- **Custom reporting**: Build new dashboard widgets
- **Authentication**: Add JWT middleware to routes
- **File uploads**: Extend for invoice attachments
- **Notifications**: Add real-time updates with Socket.io

## 📝 License

MIT License - feel free to use for commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

For issues and questions:
- Check existing GitHub issues
- Create new issue with detailed description
- Include environment details and error logs