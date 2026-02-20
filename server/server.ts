import express, { Request, Response, NextFunction } from "express";
import uploadRoutes from "./routes/upload";
import logger from "./logger";

const app = express();

app.use(express.json());
app.use("/", uploadRoutes);

app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
  logger.error(err.message);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

const PORT = 4000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
