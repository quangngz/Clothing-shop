const pool = require("./pool");

exports.getAllTransaction = async () => {
  const { rows } = await pool.query("SELECT * FROM transactions");
  return rows;
};
// Cannot update old transaction. Only add new ones
exports.createNewTransaction = async (customerID, items) => {
  /**
   * customerID: number
   * items: array of { productID, quantity }
   */

  try {
    await pool.query("BEGIN");

    // Insert new transaction
    const result = await pool.query(
      `INSERT INTO transactions (customerID)
       VALUES ($1)
       RETURNING transactionID`,
      [customerID]
    );

    const transactionID = result.rows[0].transactionid;

    // Insert each item into transactionItems
    for (const item of items) {
      await pool.query(
        `INSERT INTO transactionItems (transactionID, productID, quantity)
         VALUES ($1, $2, $3)`,
        [transactionID, item.productID, item.quantity]
      );

      // Optional: decrease stock
      await pool.query(
        `UPDATE product SET stock = stock - $1 WHERE productID = $2`,
        [item.quantity, item.productID]
      );
    }

    await pool.query("COMMIT");
    return { transactionID };
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
};


exports.getProductListByID = async (cartIDs) => {
  if (!cartIDs || cartIDs.length === 0) return [];

  // Keep only valid integers
  const validIDs = cartIDs
    .map(id => parseInt(id))
    .filter(id => !isNaN(id));

  if (validIDs.length === 0) return [];

  const placeholders = validIDs.map((_, i) => `$${i + 1}`).join(",");
  const query = `SELECT * FROM product WHERE productID IN (${placeholders})`;

  const { rows } = await pool.query(query, validIDs);
  return rows;
};
exports.getCategoricalProduct = async (categoryName) => {
  const { rows } = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM product p
     INNER JOIN category c ON p.categoryID = c.categoryID
     WHERE c.name = $1`,
    [categoryName]
  );
  return rows;
};

exports.getAllProduct = async () => {
  const { rows } = await pool.query(`SELECT p.*, c.name AS "categoryName", 
    s.name AS "supplierName"
      FROM product p
      JOIN category c ON p.categoryID = c.categoryID
      JOIN supplier s ON p.supplierID = s.supplierID
      ORDER BY p.name ASC;
      `);
  return rows;
};

// Search products by name or brand (case-insensitive, partial match)
exports.searchProducts = async (q) => {
  let products;

  if (q && q.trim() !== "") {
    const queryText = `
      SELECT p.*, c.name AS "categoryName", s.name AS "supplierName"
      FROM product p
      JOIN category c ON p.categoryid = c.categoryid
      JOIN supplier s ON p.supplierid = s.supplierid
      WHERE LOWER(p.name) LIKE LOWER($1)
          OR LOWER(p.brand) LIKE LOWER($1)
          OR LOWER(c.name) LIKE LOWER($1)
          OR LOWER(s.name) LIKE LOWER($1)
      ORDER BY p.name ASC;
    `;
    products = (await pool.query(queryText, [`%${q}%`])).rows;
    return products; 
  } else {
    // No search term → show all products
    const queryText = `
      SELECT p.*, c.name AS "categoryName", s.name AS "supplierName"
      FROM product p
      JOIN category c ON p.categoryID = c.categoryID
      JOIN supplier s ON p.supplierID = s.supplierID
      ORDER BY p.name ASC;
    `;
    products = (await pool.query(queryText)).rows;
    return products; 
  }
};

exports.deleteProduct = async (productName) => {
  const { rowCount } = await pool.query(
    `DELETE FROM product WHERE name = $1`,
    [productName]
  );
  return rowCount > 0 ? "Product deleted" : "Product not found";
};

// Can add products or if product already exist, then update the new stock
exports.addProduct = async (product) => {
  /**
   * product = {
   *   categoryName,
   *   supplierName,
   *   name,
   *   brand,
   *   price,
   *   stock,
   *   size
   * }
   */

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ensure category exists (or get existing)
    const categoryRes = await client.query(
      `INSERT INTO category (name)
       VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING categoryID`,
      [product.categoryName]
    );
    const categoryID = categoryRes.rows[0].categoryid || categoryRes.rows[0].categoryID;

    // Ensure supplier exists (or get existing)
    const supplierRes = await client.query(
      `INSERT INTO supplier (name)
       VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING supplierID`,
      [product.supplierName]
    );
    const supplierID = supplierRes.rows[0].supplierid || supplierRes.rows[0].supplierID;

    // Check if product already exists
    const productRes = await client.query(
      `SELECT * FROM product WHERE name = $1 AND brand = $2`,
      [product.name, product.brand]
    );

    let result;
    if (productRes.rows.length > 0) {
      result = await client.query(
        `UPDATE product
         SET stock = stock + $1, price = $2, size = $3, categoryID = $4, supplierID = $5
         WHERE name = $6 AND brand = $7
         RETURNING *`,
        [
          product.stock,
          product.price,
          product.size,
          categoryID,
          supplierID,
          product.name,
          product.brand,
        ]
      );
    } else {
      result = await client.query(
        `INSERT INTO product (categoryID, supplierID, name, brand, price, stock, size)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          categoryID,
          supplierID,
          product.name,
          product.brand,
          product.price,
          product.stock,
          product.size,
        ]
      );
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
