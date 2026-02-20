import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import pLimit from "p-limit";
import uploadLimiter from "../middleware/rateLimiter";
import {
  createUpload,
  FailedRecord,
  getUpload,
  updateUpload,
} from "../services/uploadStore";
import parseCSV, { CsvRow } from "../utils/csvParser";
import { validateWithTimeout } from "../services/emailValidator";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  uploadLimiter,
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "File is required" });
      }

      const uploadId = uuidv4();
      createUpload(uploadId);

      res.json({
        uploadId,
        message: "File uploaded successfully. Processing started.",
      });

      let rows: CsvRow[];
      try {
        rows = await parseCSV(req.file.buffer);
      } catch {
        return res.status(400).json({ error: "Invalid or malformed CSV file" });
      }

      const limit = pLimit(5);

      updateUpload(uploadId, { totalRecords: rows.length });

      const failedDetails: FailedRecord[] = [];

      await Promise.all(
        rows.map((row, index) =>
          limit(async () => {
            try {
              const result = await validateWithTimeout(row.email);

              if (!result.valid) {
                failedDetails.push({
                  name: row.name,
                  email: row.email,
                  error: "Invalid email format",
                });
              }

              updateUpload(uploadId, {
                progress: Math.round(((index + 1) / rows.length) * 100),
              });
            } catch (err) {
              failedDetails.push({
                name: row.name,
                email: row.email,
                error: (err as Error).message,
              });
            }
          })
        )
      );

      updateUpload(uploadId, {
        state: "done",
        processedRecords: rows.length - failedDetails.length,
        failedRecords: failedDetails.length,
        details: failedDetails,
        progress: 100,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/status/:uploadId", (req, res) => {
  const upload = getUpload(req.params.uploadId);

  if (!upload) {
    return res.status(404).json({ error: "Upload not found" });
  }

  if (upload.state === "done") {
    return res.json({
      uploadId: req.params.uploadId,
      state: upload.state,
      totalRecords: upload.totalRecords,
      processedRecords: upload.processedRecords,
      failedRecords: upload.failedRecords,
      details: upload.details,
    });
  }

  return res.json({
    uploadId: req.params.uploadId,
    state: upload.state,
    progress: `${upload.progress}%`,
  });
});

export default router;
