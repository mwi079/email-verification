import csv from "csv-parser";
import fs from "node:fs";
import { Readable } from "node:stream";

export interface CsvRow {
  name: string;
  email: string;
}

export default function parseCSV(input: Buffer | string): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const results: CsvRow[] = [];

    const stream =
      typeof input === "string"
        ? fs.createReadStream(input)
        : Readable.from(input);

    stream
      .pipe(csv())
      .on("data", (data: CsvRow) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}
