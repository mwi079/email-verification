import request from "supertest";
import app from "../server/server";

jest.mock("../server/utils/csvParser", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import parseCSV from "../server/utils/csvParser";

describe("POST /upload", () => {
  test("400 if no file is provided", async () => {
    const res = await request(app).post("/upload");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "File is required" });
  });

  test("200 if valid CSV is provided", async () => {
    const res = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("foo,bar\n1,2\n"), { filename: "users.csv" });

    expect(res.status).toBe(200);
    expect(res.body.uploadId).toBeTruthy();
    expect(res.body.message).toMatch(/Processing started/i);
  });

  test("400 if CSV parsing fails", async () => {
    (parseCSV as jest.Mock).mockRejectedValueOnce(new Error("parse failed"));

    const res = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("anything"), { filename: "users.csv" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid or malformed CSV file" });
  });

  test("returns uploadId when a CSV file is provided", async () => {
    const csv = "name,email\nJohn Doe,john@example.com\n";
    const res = await request(app)
      .post("/upload")
      .attach("file", Buffer.from(csv), {
        filename: "users.csv",
        contentType: "text/csv",
      });

    expect(res.status).toBe(200);
    expect(res.body.uploadId).toBeTruthy();
    expect(res.body.message).toMatch(/Processing started/i);
  });
});
