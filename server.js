const express = require("express");
const { spawn } = require("child_process");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = "mongodb://localhost:27017/drawmotion"; 
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB Connection Error:", err));

const JWT_SECRET = "your_secret_key"; 

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const User = mongoose.model("user", userSchema);

let pythonProcess;
function startPythonProcess() {
    pythonProcess = spawn("python", ["hand_tracking.py"]);

    pythonProcess.stdout.on("data", (data) => {
        console.log(`Python Output: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`Python Error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
        console.log(`Python process exited with code ${code}`);
        startPythonProcess();
    });
}
startPythonProcess();

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.json({ success: true, message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Registration failed" });
    }
});

// User Login API
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        return res.status(400).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, user: { username, token } });
});

// Serve static frontend files
app.use(express.static("public"));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// WebSocket Server for Finger Tracking
const wss = new WebSocket.Server({ port: 3001 });

wss.on("connection", (ws) => {
    console.log("WebSocket connected");

    ws.on("message", (message) => {
        const fingerData = JSON.parse(message);

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(fingerData));
            }
        });
    });

    ws.on("close", () => {
        console.log("WebSocket disconnected");
    });
});
