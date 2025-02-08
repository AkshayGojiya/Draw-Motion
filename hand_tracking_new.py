import cv2
import mediapipe as mp
import numpy as np
import json
import threading
import time
import flask
from flask import Flask, Response
from flask_cors import CORS
import websocket

app = Flask(__name__)
CORS(app)

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_draw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)

ws = None
canvas = None  # Drawing canvas
previous_point = None  # Track previous drawing position
hand_detected = False  # Track if a hand is currently detected

def generate_frames():
    global ws, canvas, previous_point, hand_detected
    while True:
        success, frame = cap.read()
        if not success:
            break

        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape

        if canvas is None:
            canvas = np.zeros((h, w, 3), dtype=np.uint8)  # Initialize canvas

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        index_finger_x, index_finger_y = None, None
        index_finger_raised = False
        middle_finger_raised = False

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

                # Get finger landmarks
                index_tip = hand_landmarks.landmark[8]  # Index finger tip
                index_mcp = hand_landmarks.landmark[5]  # Index MCP
                middle_tip = hand_landmarks.landmark[12]  # Middle finger tip
                middle_mcp = hand_landmarks.landmark[9]  # Middle MCP

                # Check if fingers are raised
                index_finger_raised = index_tip.y < index_mcp.y
                middle_finger_raised = middle_tip.y < middle_mcp.y

                if index_finger_raised and not middle_finger_raised:
                    index_finger_x, index_finger_y = int(index_tip.x * w), int(index_tip.y * h)
                    hand_detected = True

                    # Draw continuous line on canvas
                    if previous_point is not None:
                        cv2.line(canvas, previous_point, (index_finger_x, index_finger_y), (255, 0, 0), 5)
                    previous_point = (index_finger_x, index_finger_y)
                else:
                    previous_point = None  # Stop drawing if both fingers are raised

                if ws and index_finger_raised and not middle_finger_raised:
                    try:
                        ws.send(json.dumps({"x": index_tip.x, "y": index_tip.y}))
                    except:
                        pass

        else:
            hand_detected = False  # No hand detected
            previous_point = None  # Reset drawing continuity

        # Merge the frame with the canvas
        combined = cv2.addWeighted(frame, 0.7, canvas, 0.3, 0)

        _, buffer = cv2.imencode('.jpg', combined)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

def start_flask():
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)

def start_websocket():
    global ws
    ws = websocket.WebSocket()
    ws.connect("ws://localhost:3001") 

if __name__ == "__main__":
    threading.Thread(target=start_flask).start()
    time.sleep(2)
    start_websocket()
