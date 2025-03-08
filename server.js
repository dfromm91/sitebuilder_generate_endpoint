const express = require("express");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const generateHtmlDoc = require("./generateHtml");

const app = express();
const PORT = 3000;

app.use(express.json());

// 🟢 Endpoint to generate an HTML document and save it as a file
app.post("/generate", (req, res) => {
  try {
    const html = generateHtmlDoc(req.body);
    const id = uuidv4();
    const filePath = path.join(__dirname, `${id}.html`);

    // Write the HTML to a file
    fs.writeFileSync(filePath, html);

    res.json({ success: true, file: `${id}.html`, path: filePath });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
