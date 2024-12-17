const multer = require("multer");

const upload = multer({
  fileFilter: (req, file, cb) => {
    const allowedType = ["image/jpg", "image/jpeg", "image/png"];

    if (allowedType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error("Hanya untuk format jpg, jpeg, png");
      cb(error, false);
    }
  },
});

module.exports = upload;
