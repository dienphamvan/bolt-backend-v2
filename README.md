---

# Bolt Car Rental – Backend

This is the backend service for the Bolt Car Rental application. It is built with [NestJS](https://nestjs.com/) and [Prisma ORM](https://www.prisma.io/), providing APIs to manage car availability, bookings, and customer data.

---

## Deployment link: https://carental.dienphamvan.site/

## 🚗 Features

* Check car availability within a date range
* View detailed car info and pricing
* Book a car for a customer
* Support seasonal pricing
* Input validation and error handling

---

## 🛠 Tech Stack

* Node.js
* TypeScript
* NestJS
* Prisma ORM
* PostgreSQL

---

## ⚙️ Getting Started

### Prerequisites

* Node.js (v18 or newer)
* A running PostgreSQL database

---

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone git@github.com:dienphamvan/bolt-backend.git
   cd bolt-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example environment file and update the `DATABASE_URL`:

   ```bash
   cp .env.example .env
   ```

4. **Run database migrations**

   ```bash
   npx prisma migrate deploy
   ```

5. **Generate Prisma client**

   *(Note: This step is often handled automatically during migration, but you can run it manually if needed)*

   ```bash
   npx prisma generate
   ```

6. **Seed the database**

   ```bash
   npm run seed
   ```

7. **Start the development server**

   ```bash
   npm run start:dev
   ```

   The server will be running at [http://localhost:8000](http://localhost:8000) by default.

---

## 📦 Available Scripts

| Command             | Description                         |
| ------------------- | ----------------------------------- |
| `npm run build`     | Build the project                   |
| `npm run start:dev` | Start the app in development mode   |
| `npm run test`      | Run unit tests                      |
| `npm run test:cov`  | Run tests with coverage report      |
| `npm run seed`      | Seed initial data into the database |
| `npm run gen`       | Generate Prisma client              |

---

## 📘 API Endpoints

### Car

* **GET** `/car/availability?startDate=YYYY-MM-DDThh:mm:ssZ&endDate=YYYY-MM-DDThh:mm:ssZ`
  Get all available cars in the specified date range.

* **GET** `/car/:id?startDate=YYYY-MM-DDThh:mm:ssZ&endDate=YYYY-MM-DDThh:mm:ssZ`
  Get details and pricing for a specific car.

### Customer

* **POST** `/customer/booking`
  Create a new booking.

  **Request Body**:

  ```json
  {
    "email": "test1@yopmail.com",
    "name": "test1",
    "licenseNumber": "test1-123",
    "licenseValidUntil": "2025-06-24",
    "startDate": "2025-06-16T17:00:00.000Z",
    "endDate": "2025-06-17T16:59:59.999Z",
    "carId": "804af3fd-e99f-49ff-8075-367dba058aac"
  }
  ```

---

## 🧪 Testing

To run all tests:

```bash
npm run test
```

---
