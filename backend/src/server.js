import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/db.js";
import router from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic request logging
if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
}

// Body parsing
app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
}));


// Mount main API router
app.use("/api", router);

// 404 handler for unknown routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);


const startServer = async() =>{
    try {
        await db();
        app.listen(PORT,()=>{
            console.log(`Server Started on PORT ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
} 

startServer();