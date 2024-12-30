const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require('fs');
const jwt = require("jsonwebtoken");
const midtransClient = require('midtrans-client'); // Midtrans SDK

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

// Database Connection with MongoDB
mongoose.connect("mongodb+srv://dbecommerce:dbecommerce123@dbecommerce.ndp6c.mongodb.net/dbecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Connected to MongoDB Atlas");
})
.catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
});

// Pastikan folder upload/images ada
const dir = './upload/images';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Image Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir); // Menyimpan file di folder yang benar
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`); // Menambahkan ekstensi file secara otomatis
    }
});

const upload = multer({ storage: storage });
app.use('/images', express.static('upload/images'));

// Midtrans Configuration
// Midtrans Configuration
const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: 'SB-Mid-server-tDBl_6fEZ0aySZAWaDleC8kv',
    clientKey: 'SB-Mid-client-t5NwXOZxs3j9jEis'
  });

const Product = mongoose.model("Product", {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true }
});

const Order = mongoose.model("Order", {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    products: [{ productId: Number, quantity: Number, name: String, price: Number }],
    totalAmount: { type: Number },
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now }
});

const Users = mongoose.model('Users', {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    cartData: { type: Object },
    date: { type: Date, default: Date.now }
});

// Middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Token is missing or invalid" });
    }
    try {
        const data = jwt.verify(token, 'dbecommerce');
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).send({ error: "Invalid Token" });
    }
};

// Routes
app.post('/create-transaction', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        const { cartItems, totalAmount } = req.body;

        const products = await Product.find({});
        const order = new Order({
            userId: user._id,
            products: Object.keys(cartItems)
                .map(key => {
                    const product = products.find(p => p.id === parseInt(key));
                    return product && cartItems[key] > 0 ? {
                        productId: parseInt(key),
                        quantity: cartItems[key],
                        name: product.name,
                        price: product.new_price
                    } : null;
                })
                .filter(item => item !== null),
            totalAmount: totalAmount
        });

        await order.save();

        const transaction = await snap.createTransaction({
            transaction_details: {
                order_id: order._id.toString(),
                gross_amount: totalAmount
            },
            customer_details: {
                first_name: user.name,
                email: user.email
            }
        });

        res.json({
            token: transaction.token,
            orderId: order._id
        });
    } catch (error) {
        res.status(500).json({ error: 'Transaction failed' });
    }
});

// Product Routes
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: 0,
            message: "No file uploaded."
        });
    }
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

app.get('/newcollections', async (req, res) => {
    let products = await Product.find({});
    let newcollections = products.slice(1).slice(-8);
    res.send(newcollections);
});

app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({ category: "women" });
    let popularinwomen = products.slice(0, 4);
    res.send(popularinwomen);
});

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id = products.length > 0 ? products.slice(-1)[0].id + 1 : 1;

    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });

    await product.save();
    res.json({ success: true, name: req.body.name });
});

app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({ success: true, name: req.body.name });
});

app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    res.send(products);
});

// Cart Routes
app.post('/addtocart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("added");
});

app.post('/removefromcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0)
        userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("remove");
});

app.post('/getcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
});

// User Routes
app.post('/signup', async (req, res) => {
    try {
        let check = await Users.findOne({ email: req.body.email });
        if (check) return res.status(400).json({ success: false, errors: "error user" });

        let cart = {};
        for (let i = 0; i < 300; i++) { cart[i] = 0; }

        const user = new Users({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });

        await user.save();

        const data = { user: { id: user.id } };
        const token = jwt.sign(data, 'dbecommerce');
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, errors: "Internal Server Error" });
    }
});

app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = { user: { id: user.id } };
            const token = jwt.sign(data, 'dbecommerce');
            res.json({ success: true, token });
        } else {
            res.json({ success: false, errors: "Wrong Password" });
        }
    } else {
        res.json({ success: false, errors: "Wrong Email" });
    }
});

// Transaction Routes (Midtrans)
app.post('/create-transaction', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        const { cartItems, totalAmount } = req.body;

        const products = await Product.find({});
        const order = new Order({
            userId: user._id,
            products: Object.keys(cartItems)
                .map(key => {
                    const product = products.find(p => p.id === parseInt(key));
                    return product && cartItems[key] > 0 ? {
                        productId: parseInt(key),
                        quantity: cartItems[key],
                        name: product.name,
                        price: product.new_price
                    } : null;
                })
                .filter(item => item !== null),
            totalAmount: totalAmount
        });

        await order.save();

        const transaction = await snap.createTransaction({
            transaction_details: {
                order_id: order._id.toString(),
                gross_amount: totalAmount
            },
            customer_details: {
                first_name: user.name,
                email: user.email
            }
        });

        res.json({
            token: transaction.token,
            orderId: order._id
        });
    } catch (error) {
        res.status(500).json({ error: 'Transaction failed' });
    }
});

// Payment Callback
app.post('/payment-callback', (req, res) => {
    const notification = req.body;
    snap.transaction.notification(notification.transaction_id)
        .then(transactionStatus => {
            const orderId = notification.order_id;
            Order.findByIdAndUpdate(orderId, { status: transactionStatus.transaction_status }, (err, result) => {
                if (err) return res.status(500).send('Error updating order status');
                res.send('Transaction status updated');
            });
        })
        .catch(error => {
            res.status(500).send('Error verifying payment');
        });
});

// Start server
app.listen(port, (error) => {
    if (!error) {
        console.log("Server running on port " + port);
    } else {
        console.log("Error : " + error);
    }
});
