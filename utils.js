// utils.js
const Tesseract = require("tesseract.js");
const validator = require("validator");

async function extractTextAndLabels(imagePath) {
  const result = {
    raw_text: '',
    email: null,
    phone: [],
    name_guess: null,
    other_lines: [],
  };

  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
    result.raw_text = text;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    for (const line of lines) {
      // Email
      if (!result.email && validator.isEmail(line)) {
        result.email = line;
        continue;
      }

      // Phone (basic)
      const phones = line.match(/\+?\d[\d\s\-().]{9,}/g);
      if (phones) {
        result.phone.push(...phones.map(p => p.replace(/[^\d+]/g, '')));
      }

      result.other_lines.push(line);
    }

    // Guess name
    for (const line of lines) {
      if (!/\d|@/.test(line) && line.split(' ').length <= 4) {
        result.name_guess = line;
        break;
      }
    }

    result.phone = [...new Set(result.phone)]; // Remove duplicates
    return result;
  } catch (err) {
    throw new Error("OCR failed: " + err.message);
  }
}

module.exports = { extractTextAndLabels };
