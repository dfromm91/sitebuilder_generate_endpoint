const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("./db");
const generateHtmlDoc = require("./generateHtml");

const app = express();
const PORT = 3000;

app.use(express.json()); // Parse JSON requests

// 🟢 Endpoint to generate an HTML document and store it in SQLite
app.post("/generate", (req, res) => {
  try {
    const html = generateHtmlDoc(req.body);
    const id = uuidv4(); // Generate a unique ID

    db.run("INSERT INTO pages (id, html) VALUES (?, ?)", [id, html], (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Database error: " + err.message });
      }
      res.json({ success: true, id });
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🟢 Endpoint to retrieve and serve an HTML document by ID
app.get("/view/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT html FROM pages WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.send(row.html); // Serve the stored HTML
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
