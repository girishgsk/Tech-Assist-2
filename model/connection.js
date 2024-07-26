const mysql = require("mysql");

const db = mysql.createPool({
  host: "database-1.czwiqmeycd6j.eu-north-1.rds.amazonaws.com",
  user: "admin",
  password: "Admin#1450",
  database: "registration",
});

module.exports = db;
