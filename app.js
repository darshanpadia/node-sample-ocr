const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { extractTextAndLabels } = require("./utils");

const app = express();
const upload = multer({ dest: "uploads/" });

const PORT = 3000;

// HTML form
app.get("/", (req, res) => {
  res.send(`
    <h2>Upload a Business Card Image</h2>
    <form method="post" action="/upload" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*"/>
        <input type="submit"/>
    </form>
  `);
});

// Upload and process
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await extractTextAndLabels(req.file.path);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    // Clean up
    fs.unlinkSync(req.file.path);
  }
});

// Run local test on sample image
async function runLocalTest() {
  const samplePath = path.join(__dirname, "sample_cards", "sample-card-7.png");

  if (!fs.existsSync(samplePath)) {
    console.log("❌ sample-card-6.png not found!");
    return;
  }

  console.log("🔍 Running local OCR test on sample-card-7.png...\n");

  try {
    const result = await extractTextAndLabels(samplePath);
    console.log("✅ Extracted Business Card Info:");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("OCR failed:", err);
  }
}

app.listen(PORT, () => {
  runLocalTest();
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
});
