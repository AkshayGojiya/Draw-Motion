import("dotenv").then((dotenv) => dotenv.config());
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import MongoDBStore from 'connect-mongodb-session';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));
app.use(express.json({ limit: "10mb" })); 

app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
}));


const MongoStore = MongoDBStore(session);
const store = new MongoStore({
  uri: "mongodb+srv://aksgojiya:mNIxTZMwJMgK0hln@drawmotion.tja73.mongodb.net/drawmotionDB",
  collection: "sessions",
});

app.use(session({
  secret: '62bd19d9ff356c926e5ac50cd4dc694b9ac151578fb049f7e95016', 
  resave: false,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

mongoose.connect('mongodb+srv://aksgojiya:mNIxTZMwJMgK0hln@drawmotion.tja73.mongodb.net/drawmotionDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Connection Error:", err));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now },
});

const HistorySchema = new mongoose.Schema({
  userId: String, 
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const History = mongoose.model("History", HistorySchema);

app.post("/api/history/save", async (req, res) => {
  try {
    const { userId, imageUrl } = req.body;
    if (!userId) {
      return res.status(400).json({success: false, message: "User ID required." });
    }
    if (!imageUrl) {
      return res.status(400).json({success: false, message: "Image URL are required." });
    }

    const newHistory = new History({ userId, imageUrl });
    await newHistory.save();

    res.status(201).json({ message: "Demo images saved successfully!" });

  } catch (error) {
    console.error("Error saving demo images:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/api/history/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedImage = await History.findByIdAndDelete(id);
    
    if (!deletedImage) {
      return res.status(404).json({ success: false, message: "Image not found." });
    }

    res.json({ success: true, message: "Image deleted successfully!" });

  } catch (error) {
    console.error("Error deleting history image:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/api/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }
    const images = await History.find({ userId }).sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    alert("Error fatching history:", error);
    res.status(500).json({ error: "Error fetching history." });
  }
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      '2f1a7332e23bef48401d2c10a10cc62bd19d9ff356c926e5ac50cd4dc694b9ac151578fb049f7e950168c4609423885fe969a5f6deac414e4c168f0fff77eef3',
      { expiresIn: '24h' }
    );

    req.session.user = { id: user._id, name: user.name, email: user.email };
     
    res.status(201).json({
      message: 'User created successfully',
      user: req.session.user,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user._id },
      '2f1a7332e23bef48401d2c10a10cc62bd19d9ff356c926e5ac50cd4dc694b9ac151578fb049f7e950168c4609423885fe969a5f6deac414e4c168f0fff77eef3',
      { expiresIn: '24h' }
    );

    req.session.user = { id: user._id, name: user.name, email: user.email };

    res.json({
      message: 'Logged in successfully',
      user: req.session.user,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

app.get('/api/auth/session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});


const pythonProcess = spawn("python", ["main.py"]);
let arr="";
pythonProcess.stdout.on("data", (data) => {
   arr=data.toString();
   console.log("Server: " + data.toString())
});
app.post("/frame", (req, res) => {
    if (req.body.image) {
        pythonProcess.stdin.write(req.body.image + "\n");
    }
    res.json({ status: "received" });
});
app.get("/coordinates",(req,res) => {
        res.status(201).json({ data: arr});
})
pythonProcess.stderr.on("data", (data) => console.error("Python Error:", data.toString()));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

