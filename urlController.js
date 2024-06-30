const URL = require('../models/URL');

exports.createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    const url = new URL({ originalUrl });
    await url.save();
    res.status(201).send(url);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.getShortUrl = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const url = await URL.findOne({ shortUrl });
    if (!url) {
      return res.status(404).send({ message: 'URL not found' });
    }
    url.clicks++;
    await url.save();
    res.redirect(url.originalUrl);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.getAllUrls = async (req, res) => {
  try {
    const urls = await URL.find();
    res.send(urls);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.getUrlStats = async (req, res) => {
  try {
    const stats = await URL.aggregate([
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    res.send(stats);
  } catch (err) {
    res.status(500).send(err);
  }
};