import express from "express";
import "dotenv/config";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./src/inngest/index.js";
import workspaceRouter from "./src/routes/workspaceRoutes.js";
import { protect } from "./src/middlewares/authMiddleware.js";
import projectRouter from "./src/routes/projectRoutes.js";
import taskRouter from "./src/routes/taskRoutes.js";
import commentRouter from "./src/routes/commentRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get("/", (req, res) =>
  res.send(`
    <div style="font-family: Arial, sans-serif; background-color: #8c9aa7; height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="background-color: #ffffff; padding: 30px 40px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
        <h3 style="color: #1a73e8; font-size: 24px; margin-bottom: 12px;">
          TaskTrive Server is Running Fine...
        </h3>
        <p style="color: #555; font-size: 16px; margin-top: 8px;">
          Your backend is live and ready to handle requests 🚀
        </p>
      </div>
    </div>
  `),
);


// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));

//ROUTES
app.use("/api/workspaces", protect, workspaceRouter);
app.use("/api/projects", protect, projectRouter);
app.use("/api/tasks", protect, taskRouter);
app.use("/api/comments", protect, commentRouter);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
