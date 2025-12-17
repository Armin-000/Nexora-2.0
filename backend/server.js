import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ Connected to database!");
  }
});

app.post("/register", async (req, res) => {
  const { username, email, password, device_type } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO chatbot_users (username, email, password, role, device_type) VALUES (?, ?, ?, 'user', ?)";
    db.query(
      sql,
      [username, email, hashedPassword, device_type || "unknown"],
      (err) => {
        if (err) {
          console.error("❌ Error inserting into database:", err.message);
          if (err.code === "ER_DUP_ENTRY") {
            if (err.sqlMessage.includes("username")) {
              return res.status(409).json({ error: "Username already taken." });
            }
            if (err.sqlMessage.includes("email")) {
              return res.status(409).json({ error: "Email already in use." });
            }
          }
          return res.status(500).json({ error: "Registration failed." });
        }
        res.status(201).json({
          message: "Account successfully created! Redirecting to login...",
        });
      }
    );
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", (req, res) => {
  const { email, password, device_type, status } = req.body;

  const sql = "SELECT * FROM chatbot_users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).send("Login failed.");
    if (results.length === 0)
      return res.status(401).send("Invalid credentials");

    const match = await bcrypt.compare(password, results[0].password);
    if (!match) return res.status(401).send("Invalid credentials.");

    const updateDeviceSql =
      "UPDATE chatbot_users SET device_type = ? WHERE id = ?";
    db.query(updateDeviceSql, [device_type || "unknown", results[0].id]);

    const updateStatusSql = "UPDATE chatbot_users SET status = ? WHERE id = ?";
    db.query(updateStatusSql, [status || "active", results[0].id]);

    const user = {
      id: results[0].id,
      email: results[0].email,
      username: results[0].username,
      role: results[0].role,
      device_type: device_type || "unknown",
    };
    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({ token });
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

app.post("/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword, confirmationPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const sql = "SELECT password FROM chatbot_users WHERE id = ?";
    db.query(sql, [userId], async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ error: "User not found" });

      const hashedPassword = results[0].password;

      const match = await bcrypt.compare(currentPassword, hashedPassword);

      const isSame = await bcrypt.compare(newPassword, hashedPassword);
      if (isSame) {
        return res.status(400).json({
          error: "New password cannot be the same as the current password",
        });
      }

      if (confirmationPassword && newPassword !== confirmationPassword) {
        return res
          .status(400)
          .json({ error: "New password and confirmation do not match" });
      }

      if (!match)
        return res.status(401).json({ error: "Current password is incorrect" });

      const newHashed = await bcrypt.hash(newPassword, 10);

      const updateSql =
        "UPDATE chatbot_users SET password = ?, updated_at = NOW() WHERE id = ?";
      db.query(updateSql, [newHashed, userId], (err) => {
        if (err)
          return res.status(500).json({ error: "Failed to update password" });
        return res.json({ message: "Password successfully changed" });
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/delete-account", authenticateToken, async (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;

  if (!password) return res.status(400).json({ error: "Password required" });

  try {
    const sql = "SELECT password FROM chatbot_users WHERE id = ?";
    db.query(sql, [userId], async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error." });
      if (results.length === 0)
        return res.status(404).json({ error: "User not found." });

      const hashedPassword = results[0].password;
      const match = await bcrypt.compare(password, hashedPassword);
      if (!match) return res.status(401).json({ error: "Password incorrect." });

      const deleteSql = "DELETE FROM chatbot_users WHERE id = ?";
      db.query(deleteSql, [userId], (err) => {
        if (err)
          return res.status(500).json({ error: "Failed to delete account." });
        return res.json({ message: "Account successfully deleted." });
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

app.post("/logout", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = "UPDATE chatbot_users SET status = 'not active' WHERE id = ?";
  db.query(sql, [userId], (err) => {
    if (err) return res.status(500).json({ error: "Failed to update status" });
    return res.json({ message: "User logged out and status updated" });
  });
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${process.env.PORT}`)
);
