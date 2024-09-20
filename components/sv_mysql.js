let instance = null;
require("dotenv").config();
const mysql = require("mysql2");

const crypto = require("crypto");
const iv = process.env.ENCRYPTION_IV;
const key = process.env.ENCRYPTION_KEY;

// function generateCrypto() {
//   console.log("IV" + crypto.randomBytes(16).toString("hex"));
//   console.log("Key " + crypto.randomBytes(32).toString("hex"));
// }

function encrypt(text) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex")
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

if (process.env.DEVELOPMENT_PRINT === "true") {
  const text = "Columns with 'secret_*' are encrypted, as shown";

  const encryptedText = encrypt(text, key, iv);
  console.log("\x1b[32mEncrypted Text:\x1b[0m %s", encryptedText);

  const decryptedText = decrypt(encryptedText, key, iv);
  console.log("\x1b[31mDecrypted Text:\x1b[0m %s", decryptedText);
}

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const connection = pool.promise();

const colors = {
  bad: "\x1b[31m", // red
  good: "\x1b[32m", // green
  sender: "\x1b[36m", // cyan
  default: "\x1b[37m", // white
};

pool.getConnection((err, connection) => {
  if (err) {
    console.log(
      colors.sender + `[${process.env.DEVELOPMENT_SENDER}]`,
      colors.bad,
      err.message,
      colors.default
    );
    return;
  }

  if (process.env.DEVELOPMENT_PRINT === "true") {
    console.log(
      colors.sender + `[${process.env.DEVELOPMENT_SENDER}]`,
      colors.good,
      `MySQL connection pool : ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`,
      colors.default
    );
  }

  connection.release();
});

class DbService {
  static getDbServiceInstance() {
    return instance ? instance : new DbService();
  }

  async defaultInsert(table, data) {
    try {
      const tableExists = await this.checkTableExists(table);
      if (!tableExists) {
        return {
          type: "ERROR",
          msg: "Invalid table",
        };
      }

      const columnsExist = await this.checkColumnsExist(
        table,
        Object.keys(data)
      );
      if (!columnsExist) {
        return {
          type: "ERROR",
          msg: "Invalid column",
        };
      }

      const encryptedData = {};
      for (const column in data) {
        if (column.includes("secret")) {
          encryptedData[column] = encrypt(data[column]);
        } else {
          encryptedData[column] = data[column];
        }
      }

      const columns = Object.keys(encryptedData).join(", ");
      const values = Object.values(encryptedData)
        .map((val) => mysql.escape(val))
        .join(", ");

      const [result] = await connection.query(
        `INSERT INTO ${table} (${columns}) VALUES (${values})`
      );

      if (result.affectedRows === 1) {
        const primaryKey = result.insertId;
        const fetch = await this.defaultFetch(table, data);
        if (fetch.length === 1) {
          return fetch;
        } else {
          return await this.defaultFetch(table, { id: primaryKey });
        }
      } else {
        return {
          type: "ERROR",
          msg: "Failed to insert row",
        };
      }
    } catch (error) {
      console.error("Error:", error);
      return {
        type: "ERROR",
        msg: "An error occurred during insert",
        code: error.code,
      };
    }
  }

  async defaultUpdate(table, data, change) {
    try {
      const tableExists = await this.checkTableExists(table);
      if (!tableExists) {
        return {
          type: "ERROR",
          msg: "Invalid table",
        };
      }

      const columnsExist = await this.checkColumnsExist(
        table,
        Object.keys(data)
      );
      if (!columnsExist) {
        return {
          type: "ERROR",
          msg: "Invalid columns in 'data' object",
        };
      }

      const changeColumnsExist = await this.checkColumnsExist(
        table,
        Object.keys(change)
      );
      if (!changeColumnsExist) {
        return {
          type: "ERROR",
          msg: "Invalid columns in 'change' object",
        };
      }

      const setValues = Object.entries(data)
        .map(([key, value]) => `${key} = ${mysql.escape(value)}`)
        .join(", ");

      const whereClause = Object.entries(change)
        .map(([key, value]) => `${key} = ${mysql.escape(value)}`)
        .join(" AND ");

      const query = `UPDATE ${table} SET ${setValues} WHERE ${whereClause}`;
      const [updateResult] = await connection.query(query);

      if (updateResult.affectedRows === 1) {
        return await this.defaultFetch(table, data);
      } else {
        return {
          type: "ERROR",
          msg: "Failed to update row",
        };
      }
    } catch (error) {
      console.error("Error:", error);
      return {
        type: "ERROR",
        msg: "An error occurred during update",
      };
    }
  }

  async defaultDelete(table, data) {
    try {
      const tableExists = await this.checkTableExists(table);
      if (!tableExists) {
        return {
          type: "ERROR",
          msg: "Invalid table",
        };
      }

      const columnsExist = await this.checkColumnsExist(
        table,
        Object.keys(data)
      );
      if (!columnsExist) {
        return {
          type: "ERROR",
          msg: "Invalid column",
        };
      }

      const whereClause = Object.entries(data)
        .map(([key, value]) => `${key} = ${mysql.escape(value)}`)
        .join(" AND ");

      const affectedRow = await this.defaultFetch(table, data);

      if (!affectedRow || Object.keys(affectedRow).length === 0) {
        return {
          type: "ERROR",
          msg: "Row not found",
        };
      }

      const query = `DELETE FROM ${table} WHERE ${whereClause}`;
      const [deleteResult] = await connection.query(query);

      if (deleteResult.affectedRows === 1) {
        return affectedRow;
      } else {
        return {
          type: "ERROR",
          msg: "Failed to delete row",
        };
      }
    } catch (error) {
      console.error("Error:", error);
      return {
        type: "ERROR",
        msg: "An error occurred during delete",
      };
    }
  }

  async defaultFetch(table, data) {
    try {
      const tableExists = await this.checkTableExists(table);
      if (!tableExists) {
        return {
          type: "ERROR",
          msg: "Invalid table",
        };
      }

      const columnsExist = await this.checkColumnsExist(
        table,
        Object.keys(data)
      );
      if (!columnsExist) {
        return {
          type: "ERROR",
          msg: "Invalid column",
        };
      }

      const whereConditions = Object.entries(data)
        .filter(([column, value]) => !column.includes("secret"))
        .map(([column, value]) => `${column} = ${mysql.escape(value)}`);
      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const selectQuery = `SELECT * FROM ${table} ${whereClause}`;
      const [selectResult] = await connection.query(selectQuery);

      if (selectResult.length > 0) {
        const decryptedData = [];
        for (const row of selectResult) {
          const decryptedRow = {};
          for (const column in row) {
            if (column.includes("secret")) {
              decryptedRow[column] = data.hasOwnProperty(column)
                ? decrypt(row[column]) === data[column]
                : false;
            } else {
              decryptedRow[column] = row[column];
            }
          }
          decryptedData.push(decryptedRow);
        }
        return decryptedData;
      } else {
        return {
          type: "ERROR",
          msg: "Failed to fetch rows",
        };
      }
    } catch (error) {
      console.error("Error:", error);
      return {
        type: "ERROR",
        msg: "An error occurred during fetch",
      };
    }
  }

  async checkTableExists(table) {
    const query = `SHOW TABLES LIKE '${table}'`;
    const [rows] = await connection.query(query);
    return rows.length > 0;
  }

  async checkColumnsExist(table, columns) {
    const query = `DESCRIBE ${table}`;
    const [rows] = await connection.query(query);
    const existingColumns = rows.map((row) => row.Field);
    return columns.every((column) => existingColumns.includes(column));
  }
}

module.exports = DbService;
