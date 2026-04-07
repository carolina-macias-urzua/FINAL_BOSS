const express = require('express');
const cors = require('cors');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/contacts', contactRoutes);

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});