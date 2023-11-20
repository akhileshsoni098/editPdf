const express = require('express');
const path = require('path');
const multer = require('multer');
const pdfmeGenerator = require('@pdfme/generator');
const fs = require('fs');

const app = express();

// Configure view engine and static files
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Setup multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
  res.render('upload');
});

app.post('/upload', upload.single('pdfFile'), async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    res.status(400).send('No file uploaded.');
    return;
  }

  // Load the uploaded PDF file
  const pdfFile = fs.readFileSync(uploadedFile.path);

  // Edit the PDF with signature and watermark
  const editedPdf = await pdfmeGenerator.editPdf(pdfFile, {
    signature: 'Your Signature',
    watermark: 'Watermark Text',
  });

  // Send the edited PDF as a downloadable file
  res.setHeader('Content-Disposition', `attachment; filename=edited.pdf`);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(editedPdf);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
