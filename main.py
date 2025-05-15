import sys
import cv2
import numpy as np
import base64
import mediapipe as mp
import time

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5, static_image_mode=False)
mp_draw = mp.solutions.drawing_utils

FRAME_DELAY = 1 / 25 

for line in sys.stdin:
    start_time = time.time()
    
    data = line.strip()
    image_data = data.split(",")[1]  
    image_bytes = base64.b64decode(image_data)
    np_arr = np.frombuffer(image_bytes, dtype=np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    frame = cv2.resize(frame, (640, 480)) 
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb_frame)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            index_finger = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
            middle_finger = hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP]
            h, w, _ = frame.shape
            index_x, index_y = int(index_finger.x * w), int(index_finger.y * h)
            middle_x, middle_y = int(middle_finger.x * w), int(middle_finger.y * h)
            print(f"{index_x},{index_y},{middle_x},{middle_y}", flush=True)

           

    elapsed_time = time.time() - start_time
    if elapsed_time < FRAME_DELAY:
        time.sleep(FRAME_DELAY - elapsed_time)