const helmet = require("helmet");

const { connectSrcUrls, scriptSrcUrls, styleSrcUrls, fontSrcUrls } = {
  scriptSrcUrls: ["https://unpkg.com/", "https://tile.openstreetmap.org"],
  styleSrcUrls: [
    "https://unpkg.com/",
    "https://tile.openstreetmap.org",
    "https://fonts.googleapis.com/",
  ],
  connectSrcUrls: ["https://unpkg.com/", "https://tile.openstreetmap.org"],
  fontSrcUrls: ["fonts.googleapis.com", "fonts.gstatic.com"],
};

module.exports = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'", ...connectSrcUrls],
    scriptSrc: ["'self'", ...scriptSrcUrls],
    styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
    workerSrc: ["'self'", "blob:"],
    objectSrc: [],
    imgSrc: ["'self'", "blob:", "data:", "https:"],
    fontSrc: ["'self'", ...fontSrcUrls],
  },
});
