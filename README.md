# Project Task Management

This README provides instructions for setting up and running the project task management system locally or using Docker Compose.

## Running the Project Locally

Before you begin, make sure you have PostgreSQL installed and running. Update the environment variables accordingly.

1. Copy the environment file:

   ```
   cp .env.development .env
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Run database migrations:

   ```
   npm run migrate:up
   ```

4. Seed the database:

   ```
   npm run seed:up
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## Running the Project Using Docker Compose

Ensure that there is no existing PostgreSQL database using port 5432 before proceeding.

1. Build and start the containers:
   ```
   docker-compose up --build
   ```

## Documentation

API documentation is available via Swagger at:

[http://localhost:3000/api/docs](http://localhost:3000/api/docs)
