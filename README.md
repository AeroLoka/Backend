
## Getting Started

Follow these steps to set up and run the project:

### 1. Clone the repository

```sh
git clone https://github.com/your-username/aeroloka.git
cd aeroloka

```

### 2. Install dependencie

``` npm install ```

### 3. Setup enviroment variables 
Create a .env file in the root directory using the .env.example file as a template:

### 4. Setup the database

#### a. Create and apply migrations
```npx prisma migrate dev --name init```

#### b. Seed the database
```npx prisma db seed```

#### c. Generate Prisma Client

```npx prisma generate```

### 5. Start the server 
```npm start```
