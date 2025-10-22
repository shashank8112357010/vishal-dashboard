# Database Seed Data

This directory contains seed scripts to populate the database with dummy data for development and testing.

## Usage

To seed the database with sample data, run:

```bash
npm run seed:data
```

## What Gets Seeded

The seed script (`seedData.ts`) populates the database with:

### 1. **Employees** (4 Sales Staff)
- Rajesh Kumar - Sales Executive
- Priya Sharma - Sales Executive
- Amit Patel - Senior Sales Executive
- Sunita Reddy - Sales Manager

### 2. **Customers** (10 Customers)
- Diverse customer profiles with:
  - Contact information (phone, email, address)
  - Birthdays for engagement tracking
  - Children names for family-oriented marketing
  - Newsletter subscription preferences
  - Custom notes about preferences

### 3. **Parties** (4 Suppliers/Partners)
- **Creditors (Suppliers)**:
  - Hero Cycles Pvt Ltd
  - Atlas Cycles Haryana Ltd
  - BSA Cycles & Accessories
- **Debtors (Partners)**:
  - Decathlon Sports India

### 4. **Inventory Items** (10 Products)
- **Bicycles**:
  - Hero Sprint Pro 29T Mountain Bike
  - Atlas Tornado 26T City Bike
  - BSA Ladybird 24T Kids Bike
  - Hero Lectro C5 Electric Bike

- **Spare Parts**:
  - Kenda Tire 26x2.1 MTB
  - Shimano 21-Speed Gear Set
  - MTB Brake Pad Set
  - LED Bike Light Set
  - Bike Chain KMC Z51
  - Bell Sports Bike Helmet

### 5. **Sales Invoices** (8 Invoices)
- Realistic sales transactions linking customers to products
- Various payment statuses (paid, partial, pending)
- Multiple items per invoice
- Notes about each transaction
- Demonstrates customer purchase history and loyalty

## Customer Analytics Examples

The seeded data creates scenarios for testing customer analytics:

- **VIP Customer**: Ramesh Iyer (2 purchases, ₹49,000 total - Platinum tier)
- **Bulk Buyer**: Suresh Gupta (family purchase, 4 bikes)
- **Repeat Customer**: Vikram Singh (2 purchases, bike + maintenance)
- **First-time Buyers**: Various customers with single purchases

## Features Demonstrated

1. **Customer Loyalty Tiers**:
   - New: < ₹10,000
   - Bronze: ₹10,000 - ₹24,999
   - Silver: ₹25,000 - ₹49,999
   - Gold: ₹50,000 - ₹99,999
   - Platinum: ₹100,000+

2. **Purchase Patterns**:
   - Single item purchases
   - Bulk family purchases
   - Accessories with bikes
   - Maintenance/spare parts

3. **Payment Scenarios**:
   - Full payment
   - Partial payment
   - Pending payment

## Warning

⚠️ **This script clears all existing data before seeding!**

The script will:
1. Delete all existing employees
2. Delete all existing customers
3. Delete all existing inventory items
4. Delete all existing parties
5. Delete all existing invoices

Only run this on development/testing databases!

## Environment

Make sure your `.env` file is configured with the correct MongoDB connection string:

```
MONGODB_URI=mongodb://localhost:27017/bicycle-shop
```

Or your MongoDB Atlas connection string for cloud database.
