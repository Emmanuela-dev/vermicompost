"""
vermicompost_bridge.py
──────────────────────
Reads sensor data from an Arduino/ESP32 over serial and pushes
the values to Firebase Realtime Database in real time.

Expected serial format from your device (one line per update):
    temperature:26.8,moisture:68,humidity:62,waterLevel:74,ph:7.2,ammonia:18

Setup:
  1. Fill in FIREBASE_CREDENTIALS_PATH and FIREBASE_DATABASE_URL below.
  2. Change SERIAL_PORT to your device's port (e.g. COM3, COM4, /dev/ttyUSB0).
  3. Run: python vermicompost_bridge.py

Dependencies (already installed):
  pip install pyserial firebase-admin
"""

import serial
import time
import json
import re
import sys
import firebase_admin
from firebase_admin import credentials, db as firebase_db

# ── Configuration ──────────────────────────────────────────────────────────────

# Path to your Firebase service account JSON key file.
# Download from: Firebase Console → Project Settings → Service accounts → Generate new private key
FIREBASE_CREDENTIALS_PATH = "serviceAccountKey.json"

# Your Firebase Realtime Database URL (from .env VITE_FIREBASE_DATABASE_URL)
FIREBASE_DATABASE_URL = "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"

# Serial port your Arduino/ESP32 is connected to
SERIAL_PORT = "COM3"   # Windows: COM3, COM4, etc. | Linux/Mac: /dev/ttyUSB0

# Baud rate — must match your Arduino sketch (usually 9600 or 115200)
BAUD_RATE = 9600

# How often to push data even if no new serial line arrives (seconds)
PUSH_INTERVAL = 5

# ── Sensor fields we expect ─────────────────────────────────────────────────────

SENSOR_KEYS = ["temperature", "moisture", "humidity", "waterLevel", "ph", "ammonia"]

# ── Firebase init ───────────────────────────────────────────────────────────────

def init_firebase():
    try:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred, {"databaseURL": FIREBASE_DATABASE_URL})
        print("✅ Firebase connected.")
        return True
    except Exception as e:
        print(f"❌ Firebase init failed: {e}")
        print("   → Make sure serviceAccountKey.json is in the same folder as this script.")
        return False


def push_to_firebase(data: dict):
    """Write sensor readings to /sensors in Firebase Realtime Database."""
    try:
        firebase_db.reference("sensors").update(data)
        print(f"  📡 Pushed → {data}")
    except Exception as e:
        print(f"  ⚠️  Firebase push error: {e}")


# ── Serial parsing ──────────────────────────────────────────────────────────────

def parse_serial_line(line: str) -> dict | None:
    """
    Parse a line like:
        temperature:26.8,moisture:68,humidity:62,waterLevel:74,ph:7.2,ammonia:18
    Returns a dict of floats, or None if parsing fails.
    """
    try:
        # Also accept JSON format: {"temperature": 26.8, ...}
        line = line.strip()
        if line.startswith("{"):
            data = json.loads(line)
            return {k: float(v) for k, v in data.items() if k in SENSOR_KEYS}

        # Key:value,key:value format
        pairs = re.findall(r"(\w+):([\d.]+)", line)
        if not pairs:
            return None
        result = {}
        for key, value in pairs:
            if key in SENSOR_KEYS:
                result[key] = float(value)
        return result if result else None
    except Exception:
        return None


# ── Main loop ──────────────────────────────────────────────────────────────────

def main():
    if not init_firebase():
        sys.exit(1)

    print(f"\n🔌 Connecting to serial port {SERIAL_PORT} at {BAUD_RATE} baud…")

    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=2)
        time.sleep(2)  # Wait for Arduino to reset after connection
        print(f"✅ Serial port open: {SERIAL_PORT}\n")
    except serial.SerialException as e:
        print(f"❌ Could not open serial port {SERIAL_PORT}: {e}")
        print("   → Check the port name and make sure the device is connected.")
        sys.exit(1)

    last_push = 0
    last_data: dict = {}

    print("🌱 Listening for sensor data… (Ctrl+C to stop)\n")

    try:
        while True:
            try:
                raw = ser.readline().decode("utf-8", errors="ignore").strip()
            except serial.SerialException as e:
                print(f"⚠️  Serial read error: {e} — retrying…")
                time.sleep(1)
                continue

            if raw:
                print(f"  ← {raw}")
                parsed = parse_serial_line(raw)
                if parsed:
                    last_data.update(parsed)

            now = time.time()
            if last_data and (now - last_push) >= PUSH_INTERVAL:
                push_to_firebase(last_data)
                last_push = now

    except KeyboardInterrupt:
        print("\n\n⛔ Stopped by user.")
    finally:
        ser.close()
        print("Serial port closed.")


if __name__ == "__main__":
    main()
