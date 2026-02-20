🚀 Installation

Install dependencies:

npm install
▶️ Run the Development Server

Start the server:

npm run dev

The API runs at:

http://localhost:4000
📤 Upload a CSV File

CSV files are located in the examples/ folder.

Example upload:

curl -X POST http://localhost:4000/upload \
  -F "file=@examples/allValid.csv"
Expected Response
{
  "uploadId": "generated-uuid",
  "message": "File uploaded successfully. Processing started."
}

Save the uploadId — you’ll need it to check status.

📊 Check Upload Status

Replace <uploadId> with the ID returned from the upload step:

curl http://localhost:4000/status/<uploadId>

⏳ While Processing

{
  "uploadId": "generated-uuid",
  "state": "processing",
  "progress": "60%"
}

✅ When Processing Is Complete

{
  "uploadId": "generated-uuid",
  "state": "done",
  "totalRecords": 2,
  "processedRecords": 1,
  "failedRecords": 1,
  "details": [
    {
      "name": "Jane Smith",
      "email": "invalid-email",
      "error": "Invalid email format"
    }
  ]
}
