
const { Client } = require("pg");
require("dotenv").config(); 
const SQL = `
CREATE TABLE IF NOT EXISTS category (
    categoryID INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000)
);

CREATE TABLE IF NOT EXISTS supplier (
    supplierID INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS product (
    productID INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    categoryID INTEGER,
    supplierID INTEGER,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    price NUMERIC(10, 2),
    stock INTEGER,
    size VARCHAR(10),

    FOREIGN KEY (categoryID) REFERENCES category(categoryID)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (supplierID) REFERENCES supplier(supplierID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS customer (
    customerID INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    address VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS transactions (
    transactionID INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    customerID INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customerID) REFERENCES customer(customerID)
        ON DELETE SET NULL
        ON UPDATE CASACADE
);

CREATE TABLE IF NOT EXISTS transactionItems (
    transactionItemsID INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
    quantity INTEGER NOT NULL, 
    transactionID INTEGER NOT NULL, 
    productID INTEGER NOT NULL,
    FOREIGN KEY (transactionID) REFERENCES transactions(transactionID)
        ON DELETE SET NULL
        ON UPDATE CASCADE, 
    FOREIGN KEY (productID) REFERENCES product(productID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
`;

async function main() {
  console.log("creating db...");
  const client = new Client({
    connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:5432/top_users`,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();