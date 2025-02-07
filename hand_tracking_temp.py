import cv2
import mediapipe as mp
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
hands = mp_hands.Hands()
mp_draw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)

ws = None
is_drawing = False  # Flag to track if drawing is allowed

def generate_frames():
    global ws, is_drawing
    prev_x, prev_y = None, None  # Store previous finger position

    while True:
        success, frame = cap.read()
        if not success:
            break

        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        index_finger_x, index_finger_y = None, None
        index_finger_raised, middle_finger_raised = False, False  # Track finger status
        hand_detected = False  # Track if a hand is detected

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                
                # Get finger landmarks
                index_finger_tip = hand_landmarks.landmark[8]  # Index finger tip
                index_finger_mcp = hand_landmarks.landmark[5]  # Index MCP (base joint)
                middle_finger_tip = hand_landmarks.landmark[12]  # Middle finger tip
                middle_finger_mcp = hand_landmarks.landmark[9]  # Middle MCP (base joint)

                # Check if fingers are raised (tip is higher than MCP)
                index_finger_raised = index_finger_tip.y < index_finger_mcp.y
                middle_finger_raised = middle_finger_tip.y < middle_finger_mcp.y

                # Allow drawing **only if index finger is raised and middle finger is NOT raised**
                is_drawing = index_finger_raised and not middle_finger_raised

                # Store index finger position if drawing is allowed
                if is_drawing:
                    index_finger_x, index_finger_y = index_finger_tip.x, index_finger_tip.y
                    hand_detected = True  # Hand is detected

                if ws and is_drawing:
                    try:
                        ws.send(json.dumps({"x": index_finger_x, "y": index_finger_y}))
                    except:
                        pass

        # Check if hand appears or disappears
        if hand_detected:
            if not is_drawing:
                prev_x, prev_y = None, None  # Reset previous stroke
        else:
            is_drawing = False  # Stop drawing when no hand is detected
            prev_x, prev_y = None, None  # Reset previous coordinates

        _, buffer = cv2.imencode('.jpg', frame)
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
