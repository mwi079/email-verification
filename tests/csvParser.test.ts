import parseCSV from "../server/utils/csvParser";

describe("parseCSV", () => {
  test("parses valid CSV into rows", async () => {
    const csv = Buffer.from(
      "name,email\nJohn Doe,john@example.com\nJane Smith,jane@example.com\n",
      "utf-8"
    );

    const rows = await parseCSV(csv);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: "John Doe", email: "john@example.com" });
    expect(rows[1]).toEqual({ name: "Jane Smith", email: "jane@example.com" });
  });

  test("handles CSV with missing values (still produces row objects)", async () => {
    const csv = Buffer.from("name,email\nNo Email,\n", "utf-8");

    const rows = await parseCSV(csv);

    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("No Email");
    expect(rows[0].email).toBe("");
  });
});
