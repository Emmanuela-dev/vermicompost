/*
  vermicompost_sensor.ino
  ────────────────────────
  Arduino/ESP32 sketch that reads sensors and sends data
  over Serial in the format expected by vermicompost_bridge.py.

  Output format (one line every 5 seconds):
    temperature:26.8,moisture:68,humidity:62,waterLevel:74,ph:7.2,ammonia:18

  Adjust the pin numbers and sensor libraries to match your hardware.
*/

// ── Pin Definitions ─────────────────────────────────────────────
#define TEMP_PIN       A0   // e.g., LM35 or NTC thermistor
#define MOISTURE_PIN   A1   // Capacitive soil moisture sensor
#define HUMIDITY_PIN   A2   // Analog humidity sensor
#define WATER_PIN      A3   // Water level sensor (analog)
#define PH_PIN         A4   // pH sensor (analog)
#define AMMONIA_PIN    A5   // MQ-137 ammonia gas sensor (analog)

// ── Send interval ────────────────────────────────────────────────
const unsigned long SEND_INTERVAL_MS = 5000;  // 5 seconds
unsigned long lastSend = 0;

void setup() {
  Serial.begin(9600);
  delay(1000);
  Serial.println("Vermicompost Sensor Node Ready");
}

void loop() {
  unsigned long now = millis();
  if (now - lastSend >= SEND_INTERVAL_MS) {
    lastSend = now;

    // ── Read sensors (replace with your actual sensor code) ──────
    float temperature = readTemperature();
    float moisture    = readMoisture();
    float humidity    = readHumidity();
    float waterLevel  = readWaterLevel();
    float ph          = readPH();
    float ammonia     = readAmmonia();

    // ── Send as key:value CSV line ────────────────────────────────
    Serial.print("temperature:"); Serial.print(temperature, 1);
    Serial.print(",moisture:");   Serial.print(moisture, 1);
    Serial.print(",humidity:");   Serial.print(humidity, 1);
    Serial.print(",waterLevel:"); Serial.print(waterLevel, 1);
    Serial.print(",ph:");         Serial.print(ph, 2);
    Serial.print(",ammonia:");    Serial.println(ammonia, 1);
  }
}

// ── Sensor reading functions ─────────────────────────────────────
// Replace these with your actual sensor libraries and formulas.

float readTemperature() {
  int raw = analogRead(TEMP_PIN);
  // Example: LM35 — 10mV/°C, Arduino 5V ref, 10-bit ADC
  return (raw * 5.0 / 1023.0) * 100.0;
}

float readMoisture() {
  int raw = analogRead(MOISTURE_PIN);
  // Map raw ADC to 0–100% (calibrate dry/wet values for your sensor)
  int dryVal = 850;   // ADC reading in dry air
  int wetVal  = 350;  // ADC reading submerged in water
  return constrain(map(raw, dryVal, wetVal, 0, 100), 0, 100);
}

float readHumidity() {
  int raw = analogRead(HUMIDITY_PIN);
  return map(raw, 0, 1023, 0, 100);
}

float readWaterLevel() {
  int raw = analogRead(WATER_PIN);
  return map(raw, 0, 1023, 0, 100);
}

float readPH() {
  int raw = analogRead(PH_PIN);
  // Typical pH sensor: 0V=pH14, 5V=pH0 (check your sensor datasheet)
  float voltage = raw * (5.0 / 1023.0);
  return 7.0 + ((2.5 - voltage) / 0.18);  // Adjust offset/slope for your probe
}

float readAmmonia() {
  int raw = analogRead(AMMONIA_PIN);
  // MQ-137: map ADC to approximate ppm (calibrate with known concentration)
  return map(raw, 0, 1023, 0, 50);
}
