import cv2
import mediapipe as mp
import base64
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
hands = mp_hands.Hands()
mp_draw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)

ws = None

def generate_frames():
    global ws
    while True:
        success, frame = cap.read()
        if not success:
            break
        frame = cv2.flip(frame, 1)
        #cv2.resize(frame,(1000, 500))
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        index_finger_x, index_finger_y = None, None
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                
                index_finger_x = hand_landmarks.landmark[8].x
                index_finger_y = hand_landmarks.landmark[8].y

                if ws:
                    try:
                        ws.send(json.dumps({"x": index_finger_x, "y": index_finger_y}))
                    except:
                        pass

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
