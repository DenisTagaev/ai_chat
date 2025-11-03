import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded( { extended: false}));

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`App is running on port ${PORT}`));

