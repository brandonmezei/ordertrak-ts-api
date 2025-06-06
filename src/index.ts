// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import userRoutes from './routes/userRoutes';

dotenv.config();
connectDB(); // 🔌 Connect to MongoDB

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
