const multer = require('multer');
const storage = new multer.memoryStorage();
const upload = multer({
  storage,
});

module.exports = upload;