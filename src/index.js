const express = require("express");
const cors = require("cors");
const app = express();
const db = require("../model/connection");
const port = process.env.PORT || 8000;
const bcrypt = require("bcrypt");
app.use(cors());
app.use(express.json());

const saltRounds = 10;

//------------Signup form -----------------------

app.post("/signup", async (req, res) => {
  let status = "error";
  let message = "Someting went wrong , try again";
  let reqStatus = 400;

  const validateUser = [];

  if (!req.body?.name) {
    validateUser.push("Email field is reqired");
  }
  if (!req.body?.email) {
    validateUser.push("Email field is reqired");
  }
  if (!req.body?.password) {
    validateUser.push("Passworg is required");
  }
  if (validateUser.length > 0) {
    res.status(reqStatus);
    return res.status(400).json({ message: validateUser, status });
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    db.getConnection((err, connection) => {
      if (err) {
        return res.status(500).json({ message, status });
      }

      const sql =
        "INSERT INTO login (`name`, `company`, `email`, `password`) VALUES (?)";
      const values = [
        req.body.name,
        req.body.company,
        req.body.email,
        hashedPassword,
      ];

      connection.query(sql, [values], (err, data) => {
        if (err) {
          return res.status(400).json("error");
        }
        if (data) {
          let status = "success";
          let message = "User added successfully";
          let reqStatus = 201;
          return res.status(reqStatus).json({ data, message, status });
        }
      });
    });
  } catch (err) {
    res.status(400).json({ message, status });
  }
});

//-----------------login-------------------------
app.post("/login", (req, res) => {
  let status = "error";
  let message = "Something went wrong, try again";
  let reqStatus = 400;

  const validateUser = [];

  if (!req.body?.email) {
    validateUser.push("Email field is required");
  }
  if (!req.body?.password) {
    validateUser.push("Password is required");
  }
  if (validateUser.length > 0) {
    res.status(reqStatus);
    return res.status(400).json({ message: validateUser, status });
  }

  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ message, status });
    }

    const sql = `SELECT * FROM login WHERE email = ?`;

    connection.query(sql, [req.body.email], async (err, data) => {
      if (err) {
        return res.status(500).json({ message, status });
      }
      if (data.length > 0) {
        const user = data[0];
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
          status = "Success";
          message = "Valid user";
          user["password"] = undefined;
          return res.status(200).json({ status, message, data: user });
        } else {
          return res
            .status(401)
            .json({ status: "error", message: "Invalid credentials" });
        }
      } else {
        return res
          .status(401)
          .json({ status: "error", message: "Invalid credentials" });
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Listen on port no. ${port} `);
});
