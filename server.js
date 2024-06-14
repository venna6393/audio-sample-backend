const express = require("express");
const multer = require("multer");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database");
});

app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  const sql = "INSERT INTO music_files (file_name, file_data) VALUES (?, ?)";
  db.query(sql, [file.originalname, file.buffer], (err, result) => {
    if (err) throw err;
    res.send("File uploaded successfully.");
  });
});

app.get("/files", (req, res) => {
  const sql = "SELECT id, file_name FROM music_files";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get("/files/:id", (req, res) => {
  const sql = "SELECT file_data FROM music_files WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.status(404).send("File not found");
    }
    res.set("Content-Type", "audio/mpeg");
    res.send(result[0].file_data);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
