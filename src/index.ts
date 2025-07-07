import express from "express";
import dotenv  from "dotenv";
import cors    from "cors";

import { userRoutes } from "./feature/users/infrastructure/Routes/UserRouter";
import { authRoutes } from "./feature/auth/infrastructure/Routes/AuthRoutes";
import { connectDatabase } from "./core/config/Mysql";

dotenv.config();

async function bootstrap() {
  try {
    await connectDatabase();

    const app = express();

    // ─── Middlewares globales ────────────────────────────────────────────────
    app.use(express.json());

    // Configuración básica (acepta cualquier origen)
    // app.use(cors());

    // ─── Ejemplo con opciones ───────────────────────────────────────────────
    const corsOptions: cors.CorsOptions = {
      origin: process.env.CLIENT_URL ?? "*",     
      methods: ["GET", "POST", "PUT", "DELETE"],  
      credentials: true,                          
      allowedHeaders: ["Content-Type", "Authorization"],
    };
    app.use(cors(corsOptions));
    // ────────────────────────────────────────────────────────────────────────

    app.use("/API/v1/users", userRoutes);
    app.use("/API/v1/auth",  authRoutes);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 API corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar la API:", error);
    process.exit(1);
  }
}

bootstrap();
