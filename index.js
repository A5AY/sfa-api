const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "sfa",
});

// 全顧客取得
app.get("/customers", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM customers ORDER BY id DESC");
    res.json(rows);
});

// 新規顧客作成
app.post("/customers", async (req, res) => {
    const { name, company, address, email, phone, industry } = req.body;

    const [result] = await db.query(
        "INSERT INTO customers (name, company, address, email, phone, industry) VALUES (?, ?, ?, ?, ?, ?)",
        [name, company, address, email, phone, industry]
    );

    res.json({
        id: result.insertId,
        name,
        company,
        address,
        email,
        phone,
        industry,
    });
});

// 顧客更新
app.put("/customers/:id", async (req, res) => {
    const id = req.params.id;
    const { name, company, address, email, phone, industry } = req.body;

    await db.query(
        "UPDATE customers SET name=?, company=?, address=?, email=?, phone=?, industry=? WHERE id=?",
        [name, company, address, email, phone, industry, id]
    );

    res.json({ id, name, company, address, email, phone, industry });
});

// 顧客削除
app.delete("/customers/:id", async (req, res) => {
    const id = req.params.id;
    await db.query("DELETE FROM customers WHERE id=?", [id]);
    res.json({ success: true });
});


// 全リスト取得
app.get("/lists", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM customer_lists");
    res.json(rows);
});

// 新規リスト作成
app.post("/lists", async (req, res) => {
    const { name } = req.body;
    const [result] = await db.query(
        "INSERT INTO customer_lists (name) VALUES (?)",
        [name]
    );
    res.json({ id: result.insertId, name });
});

// 既存リストに顧客追加
app.post("/lists/:id/add", async (req, res) => {
    const listId = req.params.id;
    const { customerIds } = req.body;

    for (const cid of customerIds) {
        await db.query(
            "INSERT IGNORE INTO customer_list_items (list_id, customer_id) VALUES (?, ?)", [listId, cid]
        );
    }

    res.json({ success: true });
});

app.listen(3001, () => console.log("API running on port 3001"));
