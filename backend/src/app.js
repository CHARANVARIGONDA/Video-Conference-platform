import express from "express";
import { createServer } from "node:http";
import dns from "node:dns";

// Fix for Windows Node.js querySrv ECONNREFUSED on MongoDB Atlas
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
    console.log("DNS setServers warning:", e.message);
}

import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
    app.set("mongo_user");
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb+srv://imdigitalashish:imdigitalashish@cluster0.cujabk4.mongodb.net/";
        const connectionDb = await mongoose.connect(mongoUri);
        console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);
    } catch (err) {
        console.error("MongoDB connection error (check network/credentials):", err.message);
        console.log("Starting server for Socket.io & Video Calling anyway...");
    }

    server.listen(app.get("port"), () => {
        console.log("LISTENIN ON PORT 8000");
    });
};

start();