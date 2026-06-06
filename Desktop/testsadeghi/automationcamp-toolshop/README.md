# AutomationCamp Toolshop - Practice Test Automation

A full-stack e-commerce application for test automation practice, built with:
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: JSON file (lowdb) — inspectable at `backend/db.json` 

(a lighter version of the [Toolshop](https://github.com/testsmith-io/practice-software-testing) app originally created by TestSmith)

## Quick Start

```bash
# 1. Install all dependencies
npm run setup

# 2. Start the application
npm start
```

The app will start:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Status**: http://localhost:3001/api/status

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@automationcamp.org | welcome01 |
| Customer | customer@automationcamp.org | welcome01 |
| Customer 2 | customer2@automationcamp.org | welcome01 |
| Customer 3 | customer3@automationcamp.org | pass123 |

## Features

### Storefront
- Product catalog with search, filtering (category, brand, price range)
- Product detail with specifications, related products, CO₂ rating
- Rental products
- Shopping cart (persistent via localStorage)
- Multi-step checkout (cart → address → payment → confirmation)
- Guest checkout supported
- Contact form

### Payment Methods
- Credit Card (with validation)
- Bank Transfer
- Gift Card
- Buy Now Pay Later (3/6/12 months)
- Cash on Delivery

### Customer Account
- Registration & Login
- Profile management
- Order history & details
- Favorites
- Support messages

### Admin Panel (`/admin`)
- Dashboard with stats and recent orders
- Full CRUD: Products, Categories, Brands, Users
- Order management with status updates
- Customer message management with replies
- Reports & analytics (sales, products, customers)

## API Endpoints

### Public
- `GET /api/status` — Health check
- `GET /api/products` — Product listing (supports `?q=`, `?category_id=`, `?brand_id=`, `?is_rental=`, `?min_price=`, `?max_price=`, `?_page=`, `?_limit=`, `?_sort=`, `?_order=`)
- `GET /api/products/:id` — Product detail
- `GET /api/products/:id/related` — Related products
- `GET /api/brands` — All brands
- `GET /api/categories` — All categories
- `GET /api/categories/tree` — Category tree
- `POST /api/carts` — Create cart
- `GET /api/carts/:id` — Get cart
- `POST /api/carts/:id` — Add item to cart
- `PUT /api/carts/:id/product/quantity` — Update quantity
- `DELETE /api/carts/:id/product/:productId` — Remove item
- `POST /api/messages` — Send contact message
- `POST /api/payment/check` — Validate payment
- `POST /api/invoices/guest` — Guest checkout
- `POST /api/users/login` — Login
- `POST /api/users/register` — Register
- `POST /api/users/forgot-password` — Password reset

### Authenticated
- `GET /api/users/me` — Current user
- `GET /api/invoices` — User's orders
- `POST /api/invoices` — Place order
- `GET /api/favorites` — User's favorites
- `POST /api/favorites` — Add favorite
- `GET /api/messages` — User's messages

### Admin Only
- `GET /api/users` — All users
- `GET /api/reports/*` — Analytics
- `PUT /api/invoices/:id/status` — Update order status
- CRUD for brands, categories, products, users

## Data Reset

To reset the database to the original seed data, run:

```bash
npm run reset-db
```

Then restart the app with `npm start`. The server will auto-hash passwords on startup.

You can also reset the database and start the app with a single command:

```bash
npm run reset-and-start
```

The seed data lives in `backend/db.seed.json` — this file is the source of truth and is never modified by the app.

## Testing Data

The application comes pre-seeded with:
- 4 users (1 admin, 3 customers)
- 5 brands
- 16 categories (4 top-level, 12 sub-categories)
- 25 products across all categories
- 5 sample orders in various states
- Sample favorites and contact messages
