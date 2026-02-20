import csv from "csv-parser";
import { Readable } from "node:stream";

export interface CsvRow {
  name: string;
  email: string;
}

export default function parseCSV(buffer: Buffer): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const results: CsvRow[] = [];
    const stream = Readable.from(buffer);

    stream
      .pipe(csv())
      .on("data", (data: CsvRow) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}
