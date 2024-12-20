﻿## Getting Started

Follow these steps to set up and run the project:

### 1. Clone the repository

```sh
git clone https://github.com/AeroLoka/Backend.git
cd aeroloka

```

### 2. Install dependencies

```sh
npm install
```

### 3. Setup enviroment variables

Create a .env file in the root directory using the .env.example file as a template:

### 4. Setup the database

#### a. Create and apply migrations

```sh
npx prisma migrate dev --name init
```

#### b. Seed the database

```sh
npx prisma db seed
```

#### c. Generate Prisma Client

```sh
npx prisma generate
```

### 5. Start the server

```sh
npm start
```
