# atuda-app-server

## 🚀 Overview

This project is the server part of the Full Stack application that allows reserves to submit requests

## 💻 Technologies Used

-   **Backend:** NestJS
-   **Frontend:** Vue3
-   **DB:** Postgresql


## 🔧 Installation

Please follow these steps to install and configure the project on your local machine:

1. Create .env file in root folder:

```bash
DB_CONNECTION=pgsql
DB_HOST=database
DB_PORT=5432
DB_DATABASE=database
DB_USERNAME=
DB_PASSWORD=
```

2. Run devcontainer

3. Install dependencies and run

```bash
# Install Dependencies
npm install

# Run migrations
npx prisma migrate dev

# Run seeds
npx prisma db seed 

# Start process
npm run start:dev
```  

Your server will be accessible at http://localhost:3000.
