import express from "express";
import cors from "cors";
import routers from "./routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_, res) => res.json({ status: "OK" }))

app.use("/", routers);

// app.use((_, res) => {
//     res.status(404).json({ message: "API Not Found" })
// })

export default app;