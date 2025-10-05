const pool = require("./pool");

exports.getAllTransaction = async () => {
  const { rows } = await pool.query("SELECT * FROM transactions");
  return rows;
};

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



exports.getProductInfo = async (productName) => {
  const { rows } = await pool.query(
    `SELECT * FROM product WHERE name = $1`,
    [productName]
  );
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
  const { rows } = await pool.query("SELECT * FROM product");
  return rows;
};

exports.deleteProduct = async (productName) => {
  const { rowCount } = await pool.query(
    `DELETE FROM product WHERE name = $1`,
    [productName]
  );
  return rowCount > 0 ? "Product deleted" : "Product not found";
};

exports.addProduct = async (product) => {
  /**
   * product = {
   *   categoryID,
   *   supplierID,
   *   name,
   *   brand,
   *   price,
   *   stock,
   *   size
   * }
   */

  const query = `
    INSERT INTO product (categoryID, supplierID, name, brand, price, stock, size)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`;

  const values = [
    product.categoryID,
    product.supplierID,
    product.name,
    product.brand,
    product.price,
    product.stock,
    product.size,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};
