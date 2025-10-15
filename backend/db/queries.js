const pool = require("./pool");
const bcrypt = require("bcryptjs"); 

// exports.getAllTransaction = async () => {
//   const { rows } = await pool.query(`SELECT quantity, p.* FROM transactions t 
//     INNER JOIN transactionitems ti ON ti.transactionid = t.transactionid
//     INNER JOIN product p ON p.productid = ti.productid;`);
//   return rows;
// };
// Cannot update old transaction. Only add new ones
exports.createNewTransaction = async (customerID) => {
  try {
    const result = await pool.query(
      `INSERT INTO transactions (customerID)
       VALUES ($1)
       RETURNING transactionID`,
      [customerID]
    );
    console.log(`Created transaction ID for user: ${customerID}`); 
    const transactionID = result.rows[0].transactionid; 
    return transactionID; 
  } catch (err) {
    console.log("Create transaction fail for user: ${customerID} ")
    throw err; 
  }

};

exports.addProductToTransaction = async (customerID, product) => {
  console.log(`Adding product ${product.productid}  for ${customerID}`); 
  try {
    await pool.query("BEGIN");
    let transactionID; 

    let currentTransaction = await pool.query(
      `SELECT * FROM transactions WHERE transactions.customerID = ($1)`, [customerID]);
    if (currentTransaction.rowCount === 0) {
      transactionID = await exports.createNewTransaction(customerID);
    }
     else {
      transactionID = currentTransaction.rows[0].transactionid; 
    }
    console.log("Current transactionID: " + transactionID); 

    const existingItem = await pool.query(
      `SELECT * FROM transactionItems 
       WHERE transactionID = $1 AND productID = $2`,
      [transactionID, product.productid]
    );
    if (existingItem.rowCount > 0) {
      await pool.query(`UPDATE transactionItems SET quantity = quantity + 1
        WHERE transactionID = $1 AND productID = $2`, [transactionID, product.productid]);
        console.log("Increment quantity for item: " + product.productid);  
    } else {
      await pool.query(
        `INSERT INTO transactionItems (transactionID, productID, quantity)
          VALUES ($1, $2, $3)`,
        [transactionID, product.productid, 1]
      );
      console.log("Added new item into basket"); 
    }



    // await pool.query(
    //   `UPDATE product SET stock = stock - 1 WHERE productID = $1`,
    //   [product.productid]
    // );
    
    await pool.query("COMMIT");
    return { transactionID };
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

/**
 * this function return an array of items that the current customer have
 * @param {*} customerID 
 * @returns 
 */
exports.getAllTransaction = async (customerID) => {
  try {
     const result = await pool.query(`
      SELECT quantity, c.name AS categoryname, p.* FROM transactions t INNER JOIN transactionItems ti
      ON t.transactionID = ti.transactionID
      INNER JOIN product p ON p.productid = ti.productid 
      INNER JOIN category c ON p.categoryid = c.categoryid
      AND t.customerID = $1;`, [customerID]); 
      return result.rows; 
  } catch (err) {
    throw err; 
  }
}

exports.getProductListByID = async (cartIDs) => {
  if (!cartIDs || cartIDs.length === 0) return [];

  const productCount = {}; 
  cartIDs.forEach(cartID => {
    if (productCount[cartID]) {
      productCount[cartID]++; 
    } else {
      productCount[cartID] = 1; 
    }
  });

  const placeholders = cartIDs.map((_, i) => `$${i + 1}`).join(",");
  const query = `SELECT product.*, category.name AS categoryName, supplier.name AS supplierName
  FROM product
  INNER JOIN category ON product.categoryID = category.categoryID 
  INNER JOIN supplier ON product.supplierID = supplier.supplierID 
  WHERE productID IN (${placeholders})`;

  const { rows } = await pool.query(query, cartIDs);
  console.log(rows); 

  rows.forEach(row => {
    row.itemcount = productCount[row.productid]; 
  });
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

exports.addUser = async (req, res, next) => {
    try {
    // const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await pool.query("INSERT INTO customer (username, password, email, phoneNum, address) VALUES ($1, $2, $3, $4, $5)", [
        req.body.username,
        req.body.password,
        req.body.email, 
        req.body.phoneNum,
        req.body.address,
    ]);
    res.status(201).json({ message: "User created successfully" });
    } catch(err) {
        next(err);
    }
}

