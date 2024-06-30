const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/url');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb://localhost:27017/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});