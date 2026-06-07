import app from "./app";
import { connectDB } from "./config/connection";
import dotenv from "dotenv";
dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(process.env.PORT, () => {
      console.log(`
            ====================================
             🚀 Server Running
             🌐 Port: ${process.env.PORT}
            ====================================
        `);
    });

    process.on("SIGINT", async () => {
      console.log("🛑 Server Stopped");
      server.close(() => {
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Server Startup Error");
    console.error(error);
    process.exit(1);
  }
};

startServer();
