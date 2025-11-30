// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { registerNewItem, loadMarketplaceItems, getSingleItem } = require('../controllers/productController');

// simple local storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'src/uploads/'); },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET /products - public
router.get('/', loadMarketplaceItems);

// GET /products/:id - public
router.get('/:id', getSingleItem);

// POST /products - protected, single or multiple images
router.post('/', authenticateUser, upload.array('itemGallery', 5), registerNewItem);

module.exports = router;
