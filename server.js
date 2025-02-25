import("dotenv").then((dotenv) => dotenv.config());
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
// app.use(express.static("public"));

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.json({ limit: "10mb" })); 

// MongoDB connection
mongoose.connect('mongodb+srv://aksgojiya:mNIxTZMwJMgK0hln@drawmotion.tja73.mongodb.net/drawmotionDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      '2f1a7332e23bef48401d2c10a10cc62bd19d9ff356c926e5ac50cd4dc694b9ac151578fb049f7e950168c4609423885fe969a5f6deac414e4c168f0fff77eef3',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      '2f1a7332e23bef48401d2c10a10cc62bd19d9ff356c926e5ac50cd4dc694b9ac151578fb049f7e950168c4609423885fe969a5f6deac414e4c168f0fff77eef3',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Logged in successfully',
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
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

