import dotenv from "dotenv";

const envPath = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envPath });