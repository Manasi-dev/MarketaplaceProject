// src/controllers/productController.js
const pool = require('../db');
const path = require('path');

async function registerNewItem(req, res) {
  try {
    const ownerUserId = req.authenticatedUser.id;
    const { itemTitle, itemCost, itemDescription } = req.body;

    if (!itemTitle || !itemCost) return res.status(400).json({ message: 'Title and cost required' });

    // handle uploaded files: multer saved files -> req.files
    let gallery = null;
    if (req.files && req.files.length > 0) {
      // store relative paths separated by commas
      const urls = req.files.map(f => `/uploads/${path.basename(f.path)}`);
      gallery = urls.join(',');
    }

    const [result] = await pool.query(
      'INSERT INTO products (owner_user_id, item_title, item_cost, item_gallery, item_description) VALUES (?, ?, ?, ?, ?)',
      [ownerUserId, itemTitle, itemCost, gallery, itemDescription || null]
    );

    res.status(201).json({ message: 'Product registered', productId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while adding product' });
  }
}

async function loadMarketplaceItems(req, res) {
  try {
    // Return all products along with seller info
    const [rows] = await pool.query(
      `SELECT p.id, p.item_title, p.item_cost, p.item_gallery, p.item_description, p.created_at,
              u.id as seller_id, u.full_user_name as seller_name, u.contact_number as seller_phone
       FROM products p
       JOIN users u ON p.owner_user_id = u.id
       ORDER BY p.created_at DESC`
    );

    // map gallery to array
    const formatted = rows.map(r => ({
      id: r.id,
      itemTitle: r.item_title,
      itemCost: r.item_cost,
      itemGallery: r.item_gallery ? r.item_gallery.split(',') : [],
      itemDescription: r.item_description,
      createdAt: r.created_at,
      seller: {
        sellerId: r.seller_id,
        ownerDisplayName: r.seller_name,
        ownerContact: r.seller_phone
      }
    }));

    res.json({ items: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
}

async function getSingleItem(req, res) {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      `SELECT p.id, p.item_title, p.item_cost, p.item_gallery, p.item_description, p.created_at,
              u.id as seller_id, u.full_user_name as seller_name, u.contact_number as seller_phone
       FROM products p
       JOIN users u ON p.owner_user_id = u.id
       WHERE p.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    const r = rows[0];
    res.json({
      id: r.id,
      itemTitle: r.item_title,
      itemCost: r.item_cost,
      itemGallery: r.item_gallery ? r.item_gallery.split(',') : [],
      itemDescription: r.item_description,
      createdAt: r.created_at,
      seller: { sellerId: r.seller_id, ownerDisplayName: r.seller_name, ownerContact: r.seller_phone }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching product' });
  }
}

module.exports = { registerNewItem, loadMarketplaceItems, getSingleItem };
