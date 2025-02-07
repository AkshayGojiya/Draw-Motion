const express = require("express");
const { spawn } = require("child_process");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());

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

app.use(express.static("public"));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ port: 3001 });

wss.on("connection", (ws) => {
    console.log("WebSocket connected");

    ws.on("message", (message) => {
        const fingerData = JSON.parse(message);
        //console.log("Finger position:", fingerData);

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
