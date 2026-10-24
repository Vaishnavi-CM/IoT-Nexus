import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  SendChatMessageBody,
  GetChatHistoryQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ─── Knowledge Base ──────────────────────────────────────────────────────────
// Each entry has keyword triggers and a full markdown response.

interface KBEntry {
  triggers: string[];
  title: string;
  response: string;
}

const knowledgeBase: KBEntry[] = [
  {
    triggers: [
      "what is iot",
      "internet of things",
      "iot introduction",
      "iot basics",
      "define iot",
      "explain iot",
    ],
    title: "Introduction to IoT",
    response: `## What is IoT (Internet of Things)?

**IoT** is a network of physical devices — "things" — embedded with sensors, software, and connectivity that allows them to collect and exchange data over the internet **without human-to-human or human-to-computer interaction**.

### Simple analogy:
Think of your home thermostat. A traditional thermostat is dumb — you adjust it manually. A **smart IoT thermostat** (like Nest) reads temperature sensors, learns your schedule, connects to WiFi, and adjusts itself — all automatically.

### IoT Architecture (3 layers):
1. **Perception Layer** → Sensors and actuators (DHT22, PIR, LDR) that collect physical data
2. **Network Layer** → WiFi, Bluetooth, LoRa — transmits data to the cloud
3. **Application Layer** → Cloud platforms, dashboards, apps that display and act on data

### Key IoT facts:
- Over **17 billion** IoT devices connected globally in 2024
- Market expected to reach **$1.1 trillion** by 2026
- Average household has **22 connected devices**
- Term coined by **Kevin Ashton** in 1999 at MIT

### Real-world applications:
- 🏠 **Smart Home** → Alexa, Nest, smart locks
- 🏥 **Healthcare** → Wearable monitors, remote patient tracking
- 🏭 **Industrial IoT (IIoT)** → Predictive maintenance, asset tracking
- 🌾 **Agriculture** → Soil sensors, automated irrigation
- 🚗 **Transportation** → Connected vehicles, fleet management`,
  },
  {
    triggers: [
      "mqtt",
      "message queue",
      "publish subscribe",
      "pub sub",
      "broker",
      "mosquitto",
      "hivemq",
      "mqtt protocol",
    ],
    title: "MQTT Protocol",
    response: `## MQTT Protocol — The Backbone of IoT Communication

**MQTT** (Message Queuing Telemetry Transport) is a lightweight publish-subscribe messaging protocol designed for IoT devices with low bandwidth and high latency connections.

### How it works:
\`\`\`
[Sensor] --publish--> [MQTT Broker] --subscribe--> [Dashboard]
                           |
                    Routes messages
                    by topic name
\`\`\`

### Core concepts:
| Concept | Description |
|---------|-------------|
| **Broker** | Central server (Mosquitto, HiveMQ) that routes messages |
| **Publisher** | Device that sends data (e.g., ESP32 with DHT22) |
| **Subscriber** | Device that receives data (e.g., dashboard, actuator) |
| **Topic** | Message channel like \`home/livingroom/temperature\` |
| **QoS** | Quality of Service — delivery guarantee level |

### QoS Levels:
- **QoS 0** → Fire and forget (no guarantee)
- **QoS 1** → At least once delivery
- **QoS 2** → Exactly once (slowest, most reliable)

### Why MQTT over HTTP?
- HTTP header = **200+ bytes** overhead
- MQTT minimum header = **2 bytes** only!
- Perfect for battery-powered devices sending data every few seconds

### Quick example (Arduino/ESP32):
\`\`\`cpp
#include <PubSubClient.h>
client.connect("ESP32_sensor");
client.publish("home/temp", "24.5");      // send
client.subscribe("home/relay");           // receive
\`\`\`

### Popular MQTT Brokers:
- **Mosquitto** — Free, open-source, runs on Raspberry Pi
- **HiveMQ** — Cloud, free tier available
- **AWS IoT Core** — Enterprise scale
- **ThingSpeak** — Great for students/learning`,
  },
  {
    triggers: [
      "esp32",
      "esp8266",
      "nodemcu",
      "espressif",
      "esp32 pinout",
      "nodemcu pinout",
    ],
    title: "ESP32 / NodeMCU",
    response: `## ESP32 & NodeMCU — The Most Popular IoT Microcontrollers

### ESP32 (Espressif Systems)
The ESP32 is the most widely used IoT chip in the world — powerful, cheap (~$4), and packed with features.

**Specifications:**
- **CPU**: Dual-core Xtensa LX6 @ up to **240 MHz**
- **RAM**: 520 KB SRAM
- **Flash**: 4 MB (typical)
- **WiFi**: 802.11 b/g/n (2.4 GHz)
- **Bluetooth**: Classic BT 4.2 + BLE
- **GPIO**: 36 pins (input/output/PWM/ADC/DAC)
- **ADC**: 12-bit (0–4095 values, 0–3.3V)
- **Price**: ~$3–6 USD

**Built-in peripherals:**
- 2× I2C, 4× SPI, 3× UART
- 2× 8-bit DAC
- 16 PWM channels
- Hall effect sensor, capacitive touch pins
- Temperature sensor (internal)

### NodeMCU (ESP8266-based)
The older, simpler, cheaper version:
- **CPU**: Single-core @ 80/160 MHz
- **RAM**: 80 KB
- **WiFi only** (no Bluetooth)
- **GPIO**: 11 usable pins
- **Price**: ~$2–3 USD

### When to use which:
| Use Case | Choose |
|----------|--------|
| Simple WiFi sensor | NodeMCU (cheaper) |
| Bluetooth + WiFi | ESP32 |
| Multiple sensors | ESP32 (more GPIOs) |
| Battery project | ESP32 (deep sleep ~10µA) |

### Programming:
Both support **Arduino IDE** (C++), **MicroPython**, and **Lua (NodeMCU firmware)**`,
  },
  {
    triggers: [
      "sensor",
      "sensors",
      "dht11",
      "dht22",
      "pir",
      "ultrasonic",
      "ldr",
      "bmp280",
      "mq2",
      "temperature sensor",
      "humidity sensor",
      "motion sensor",
      "light sensor",
    ],
    title: "IoT Sensors",
    response: `## IoT Sensors — Complete Overview

Sensors convert physical parameters (heat, light, motion) into electrical signals a microcontroller can read.

### Most Common IoT Sensors:

#### 🌡️ Temperature & Humidity
| Sensor | Range | Accuracy | Interface |
|--------|-------|----------|-----------|
| **DHT11** | 0–50°C, 20–80% RH | ±2°C, ±5% | 1-Wire digital |
| **DHT22** | -40–80°C, 0–100% RH | ±0.5°C, ±2% | 1-Wire digital |
| **DS18B20** | -55–125°C | ±0.5°C | 1-Wire (waterproof) |
| **BMP280** | -40–85°C + pressure | ±1°C | I2C / SPI |

#### 👁️ Motion & Presence
- **PIR sensor** → Detects infrared radiation from warm bodies. Range: 5–10m, 110° field of view. Output: digital HIGH when motion detected
- **HC-SR04** → Ultrasonic distance (2cm–400cm). Sends 40kHz sound pulse, measures echo return time
- **RCWL-0516** → Microwave Doppler radar — works through walls!

#### ☀️ Light
- **LDR** → Resistance decreases with light. Simple, analog output (use with ADC)
- **BH1750** → Digital lux sensor, I2C interface, direct lux reading
- **TSL2561** → Separate IR + visible channels for accurate lux calculation

#### 💨 Gas & Air Quality
- **MQ-2** → Smoke, LPG, propane. Needs 24–48hr burn-in period
- **MQ-7** → Carbon monoxide (CO) detection
- **MQ-135** → Air quality (CO₂, ammonia, benzene)
- **SGP30** → TVOC + eCO₂, digital I2C, more accurate

### Sensor Interfaces:
- **Analog** → Variable voltage (0–3.3V), needs ADC on microcontroller
- **I2C** → 2 wires (SDA + SCL), multiple sensors on one bus
- **SPI** → 4 wires, faster than I2C
- **1-Wire** → Single data line + power (DS18B20)`,
  },
  {
    triggers: [
      "arduino",
      "arduino uno",
      "arduino nano",
      "arduino ide",
      "arduino programming",
    ],
    title: "Arduino",
    response: `## Arduino — The Most Beginner-Friendly IoT Platform

**Arduino** is an open-source electronics platform combining easy-to-use hardware and software. It's the best starting point for IoT learning.

### Arduino Uno Specs:
- **Microcontroller**: ATmega328P @ 16 MHz
- **Digital I/O**: 14 pins (6 can do PWM)
- **Analog Input**: 6 pins (10-bit ADC, 0–1023)
- **Flash**: 32 KB, **SRAM**: 2 KB, **EEPROM**: 1 KB
- **Operating voltage**: 5V
- **Price**: ~$5–10 USD (official), ~$2 (clone)

### Basic Arduino code structure:
\`\`\`cpp
void setup() {
  // Runs ONCE at startup
  Serial.begin(9600);        // Start serial monitor
  pinMode(13, OUTPUT);       // Set LED pin as output
}

void loop() {
  // Runs FOREVER (infinite loop)
  digitalWrite(13, HIGH);    // LED on
  delay(1000);               // Wait 1 second
  digitalWrite(13, LOW);     // LED off
  delay(1000);
}
\`\`\`

### Reading a DHT22 sensor:
\`\`\`cpp
#include <DHT.h>
DHT dht(4, DHT22);   // sensor on pin 4

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  Serial.print("Temp: "); Serial.print(temp);
  Serial.print("°C  Humidity: "); Serial.println(hum);
  delay(2000);   // DHT22 needs 2s between readings
}
\`\`\`

### Arduino vs ESP32 for IoT:
Arduino Uno has **no WiFi** built-in — you need a separate WiFi shield or use ESP32 which has WiFi + Bluetooth built-in. For real IoT projects, ESP32 is preferred.`,
  },
  {
    triggers: [
      "microcontroller",
      "microprocessor",
      "cpu",
      "mcu",
      "alu",
      "registers",
      "flash memory",
      "sram",
      "eeprom",
      "harvard architecture",
      "von neumann",
      "fetch decode execute",
    ],
    title: "Microcontrollers & Architecture",
    response: `## Microcontrollers vs Microprocessors

### Key Difference:
| Feature | Microprocessor | Microcontroller |
|---------|----------------|-----------------|
| CPU | Yes | Yes (integrated) |
| RAM | External needed | Built-in (SRAM) |
| Storage | External needed | Built-in (Flash) |
| Peripherals | External needed | Built-in (ADC, UART, I2C) |
| Power | High (~65W) | Ultra-low (~0.1–1W) |
| Example | Intel Core i7 | ATmega328P, ESP32 |
| Use case | Laptop, PC | IoT sensors, embedded |

### CPU Architecture:
**Harvard Architecture** (most MCUs like AVR, PIC):
- Separate memory buses for instructions and data
- Can fetch next instruction while executing current → faster
- Used in: Arduino (ATmega328P), ESP32

**Von Neumann Architecture** (general computers):
- Single shared bus for instructions and data
- Simpler design but potential bottleneck
- Used in: x86 PCs, Raspberry Pi

### Fetch-Decode-Execute Cycle:
1. **Fetch** → Program Counter (PC) points to next instruction in Flash memory
2. **Decode** → Instruction Register (IR) decodes the opcode
3. **Execute** → ALU performs operation (add, compare, shift, etc.)
4. **Write-back** → Result stored in register or memory

### Memory in ATmega328P (Arduino Uno):
- **Flash (32 KB)** → Stores your program code (non-volatile, survives power off)
- **SRAM (2 KB)** → Runtime variables (volatile, lost on power off)
- **EEPROM (1 KB)** → Persistent config storage (survives reboot, slow writes)

### ALU Operations:
Arithmetic: ADD, SUB, MUL, DIV
Logical: AND, OR, XOR, NOT
Comparison: Equal, Greater-than, Less-than
Shift: Left shift (×2), Right shift (÷2)`,
  },
  {
    triggers: [
      "raspberry pi",
      "raspberrypi",
      "raspi",
      "rpi",
      "linux iot",
      "single board computer",
    ],
    title: "Raspberry Pi",
    response: `## Raspberry Pi — A Full Linux Computer for IoT

Unlike Arduino/ESP32 (microcontrollers), **Raspberry Pi** is a full **single-board computer** running Linux. It's powerful enough to run Node.js, Python servers, databases, and even a web browser.

### Raspberry Pi 4 Specs:
- **CPU**: ARM Cortex-A72 quad-core @ 1.8 GHz (64-bit)
- **RAM**: 2GB / 4GB / 8GB options
- **Storage**: MicroSD card (8GB+)
- **Connectivity**: WiFi 5 (802.11ac), Bluetooth 5.0, Gigabit Ethernet
- **GPIO**: 40 pins (I2C, SPI, UART, PWM)
- **Video**: 4K HDMI × 2
- **USB**: 2× USB 3.0, 2× USB 2.0
- **Price**: ~$35–75 USD

### Raspberry Pi vs Arduino vs ESP32:
| Feature | RPi 4 | ESP32 | Arduino Uno |
|---------|-------|-------|-------------|
| OS | Linux | FreeRTOS/bare | Bare metal |
| Power | ~3–7W | ~0.5W | ~0.2W |
| Internet | Yes | Yes | No (needs module) |
| Camera | Yes (CSI) | No | No |
| Best for | Gateway, AI edge | Sensors, WiFi | Simple sensors |

### Common IoT uses:
- **MQTT Broker** → Run Mosquitto on Pi to route all your sensor messages
- **Gateway** → Collect data from Arduino/ESP32 devices via Serial/WiFi
- **Edge AI** → Run TensorFlow Lite for local ML inference
- **Web Server** → Host a Node.js dashboard showing sensor data
- **Camera** → Pi Camera module for vision projects`,
  },
  {
    triggers: [
      "edge computing",
      "edge ai",
      "fog computing",
      "tinyml",
      "edge processing",
      "local processing",
    ],
    title: "Edge Computing",
    response: `## Edge Computing in IoT

**Edge computing** means processing data **close to where it's generated** (on the device or nearby gateway) instead of sending everything to a remote cloud server.

### The problem with cloud-only IoT:
\`\`\`
Sensor → Internet → Cloud → Process → Internet → Device
         (50-200ms delay each way)
\`\`\`
For a self-driving car that needs to react in **<1ms**, waiting for cloud response is dangerous!

### Edge computing flow:
\`\`\`
Sensor → Edge Device (local processing) → Only results sent to Cloud
         (<1ms local decision)              (summary/logs only)
\`\`\`

### Benefits of Edge Computing:
| Benefit | Detail |
|---------|--------|
| **Low latency** | <1ms vs 50-200ms for cloud |
| **Privacy** | Sensitive data never leaves the premises |
| **Offline operation** | Works without internet |
| **Bandwidth savings** | Only sends processed results, not raw data |
| **Cost reduction** | Less cloud storage and compute needed |

### Edge AI — TinyML:
Running machine learning models directly on microcontrollers:
- **TensorFlow Lite Micro** → Runs on Arduino, ESP32
- **Edge Impulse** → Platform for training edge ML models
- **ONNX Runtime** → Cross-platform ML on edge devices

### Example: Smart Security Camera
- **Without edge**: Every video frame uploaded to cloud for analysis → expensive, slow, privacy risk
- **With edge**: Motion detection runs on Pi locally → only clips with people sent to cloud → 99% less bandwidth

### Edge hierarchy:
1. **Device edge** → Microcontroller (ESP32) does basic filtering
2. **Local edge** → Gateway (Raspberry Pi) does heavier processing
3. **Regional edge** → Edge data center does complex analytics
4. **Cloud** → Long-term storage, global analytics`,
  },
  {
    triggers: [
      "cloud",
      "cloud iot",
      "aws iot",
      "azure iot",
      "google cloud iot",
      "thingspeak",
      "cloud platform",
      "iot cloud",
    ],
    title: "Cloud IoT Platforms",
    response: `## Cloud IoT Platforms

Cloud platforms receive, store, process, and visualize data from millions of IoT devices.

### Major Cloud IoT Platforms:

#### ☁️ AWS IoT Core (Amazon)
- **Best for**: Enterprise, large scale
- **Key features**: Device Shadow, Rules Engine, Greengrass (edge), ML with SageMaker
- **Protocol support**: MQTT, HTTP, WebSocket
- **Pricing**: ~$1 per million messages
- **Free tier**: 250,000 messages/month for 12 months

#### ☁️ Azure IoT Hub (Microsoft)
- **Best for**: Microsoft ecosystem, industrial IoT
- **Key features**: Device provisioning, IoT Edge, Digital Twins
- **Free tier**: 8,000 messages/day
- **Bonus**: Integrates with Power BI for dashboards

#### ☁️ Google Cloud IoT (GCP)
- **Key features**: BigQuery analytics, Pub/Sub messaging, Vertex AI
- **Best for**: Data analytics, ML on IoT data

#### 📊 ThingSpeak (MathWorks)
- **Best for**: Students, learning, prototypes
- **Free tier**: 3 million messages/year (generous!)
- **Features**: Built-in charts, MATLAB analytics
- **Easy to use**: 5 lines of code to start

#### 🟢 Adafruit IO
- **Best for**: Beginners, hobbyists
- **Free tier**: 30 data points/minute
- **Features**: Beautiful dashboards, IFTTT integration

### Key Cloud IoT Concepts:
- **Device Shadow** → Cloud maintains last known state of device (even offline)
- **Rules Engine** → Trigger actions based on incoming data (e.g., send SMS if temp > 80°C)
- **Time-series DB** → InfluxDB, TimescaleDB for storing sensor readings over time
- **Digital Twin** → Virtual replica of physical device for simulation and monitoring`,
  },
  {
    triggers: [
      "iot security",
      "security",
      "tls",
      "ssl",
      "encryption",
      "authentication",
      "vulnerability",
      "attack",
      "hacking iot",
      "secure iot",
      "certificate",
    ],
    title: "IoT Security",
    response: `## IoT Security — The Biggest Challenge

IoT security is critical because compromised devices can cause **physical harm** (hacked pacemaker, manipulated industrial valve) unlike a compromised laptop.

### Why IoT Security is Hard:
- **Resource constraints** → MCUs have too little RAM/CPU for heavy encryption
- **Scale** → Billions of devices are impossible to manually patch
- **Physical access** → Devices are in public places, easy to tamper with
- **Long lifespan** → IoT devices last 10–20 years; software goes unmaintained

### Common IoT Attacks:
| Attack | Description | Real Example |
|--------|-------------|--------------|
| **Mirai Botnet (2016)** | 600,000 IoT devices used for DDoS | Took down Twitter, Netflix |
| **Default passwords** | "admin/admin" never changed | Baby monitors hacked |
| **Eavesdropping** | Unencrypted MQTT traffic intercepted | Smart home commands stolen |
| **Replay attack** | Recorded commands replayed | Garage door opened remotely |
| **Firmware attack** | Malicious firmware flashed | Medical devices compromised |

### Security Best Practices:

#### 1. Use TLS/SSL Encryption
\`\`\`
MQTT port 1883 = UNENCRYPTED (never use in production)
MQTT port 8883 = TLS encrypted ✓
HTTP port 80  = UNENCRYPTED
HTTPS port 443 = TLS encrypted ✓
\`\`\`

#### 2. Authentication
- X.509 certificates for device identity
- JWT tokens for API authentication
- Never use default passwords
- Use unique credentials per device

#### 3. Secure Boot
- Verify firmware signature before executing
- Prevents malicious firmware installation
- Supported by ESP32 (hardware secure boot)

#### 4. OTA Updates
- Over-the-Air firmware updates to patch vulnerabilities
- Must verify update signature before applying
- ESP32 supports OTA via Arduino/ESP-IDF

### Encryption Standards:
- **AES-256** → Symmetric encryption for data at rest
- **RSA-4096 / ECC** → Asymmetric for key exchange
- **TLS 1.3** → Latest transport security, 30% faster than TLS 1.2`,
  },
  {
    triggers: [
      "machine learning",
      "ml iot",
      "tinyml",
      "neural network",
      "ai iot",
      "deep learning iot",
      "model",
      "classification",
      "anomaly detection",
    ],
    title: "Machine Learning in IoT",
    response: `## Machine Learning in IoT

Combining ML with IoT allows devices to learn patterns, detect anomalies, and make predictions from sensor data — without explicit programming.

### Types of ML in IoT:
| Type | Description | IoT Example |
|------|-------------|-------------|
| **Supervised Learning** | Learns from labeled examples | Classify machine as "normal" or "fault" |
| **Unsupervised Learning** | Finds hidden patterns | Detect unusual energy consumption |
| **Reinforcement Learning** | Learns by trial and error | Optimize HVAC settings |
| **Time-series forecasting** | Predict future values | Predict equipment failure 24h ahead |

### TinyML — ML on Microcontrollers:
Running inference directly on ESP32/Arduino — no cloud needed!

**Frameworks:**
- **TensorFlow Lite Micro** → Google's library for MCUs (< 256KB)
- **Edge Impulse** → Visual ML training platform, deploys to ESP32/Arduino
- **microTVM** → Apache's ML for tiny devices
- **ONNX Runtime** → Cross-platform inference

**What's possible on ESP32:**
- Keyword detection ("Hey device!")
- Gesture recognition (accelerometer)
- Anomaly detection (vibration patterns)
- Image classification (with camera module)

### Typical IoT ML Pipeline:
\`\`\`
1. COLLECT  → Sensor data (weeks/months of readings)
2. LABEL    → Tag examples (normal/fault, day/night)
3. TRAIN    → ML model on cloud (Python/TensorFlow)
4. CONVERT  → Quantize to TensorFlow Lite (.tflite)
5. DEPLOY   → Flash to microcontroller
6. INFER    → Real-time predictions on device
\`\`\`

### Practical Example — Predictive Maintenance:
An accelerometer on a motor collects vibration data. ML model trained on normal vs. fault patterns. When deployed, it detects bearing wear 48 hours before failure → saves expensive downtime.`,
  },
  {
    triggers: [
      "llm",
      "large language model",
      "gpt",
      "chatgpt",
      "llm iot",
      "language model",
      "generative ai",
      "ai assistant",
      "nlp iot",
    ],
    title: "LLMs in IoT",
    response: `## Large Language Models (LLMs) in IoT

LLMs like GPT-4, Claude, and Llama are transforming how we interact with and manage IoT systems.

### How LLMs Connect to IoT:

#### 1. Natural Language Device Control
Instead of: \`mqtt.publish("home/lights", "{"brightness": 80, "color": "warm"}")\`
User says: *"Make the bedroom lights warm and dim for movie night"*
→ LLM interprets intent → sends correct MQTT command

#### 2. IoT Data Analysis
Feed LLM a CSV of sensor readings:
*"Analyze this week's energy consumption data and identify the 3 biggest waste patterns"*
→ LLM provides human-readable insights from raw numbers

#### 3. Anomaly Explanation
Traditional ML: "Anomaly detected at timestamp 14:32:07" (unhelpful)
LLM-enhanced: "The vibration pattern at 2:32 PM matches early-stage bearing fatigue seen in similar motors — recommend inspection within 48 hours"

#### 4. Code Generation for IoT
Ask: *"Write ESP32 code to read DHT22 every 30 seconds and publish to MQTT topic home/sensor"*
→ LLM generates complete, working Arduino code

### LLM + IoT Architecture:
\`\`\`
IoT Devices → MQTT Broker → Backend Server
                                  ↕
                             LLM API (GPT/Claude)
                                  ↕
                           User Chat Interface
\`\`\`

### Popular LLMs for IoT Integration:
| Model | Provider | Notes |
|-------|----------|-------|
| **GPT-4o** | OpenAI | Best reasoning, paid |
| **Claude 3.5** | Anthropic | Great at code |
| **Llama 3.1** | Meta | Free, open-source, runs locally |
| **Gemini Flash** | Google | Fast, free tier available |
| **Mistral 7B** | Mistral AI | Lightweight, can run on edge |

### TinyLLM — LLMs on Edge:
- **Phi-3 mini** (3.8B params) runs on Raspberry Pi 5
- **Llama 3.2 1B** fits in 2GB RAM
- Enables offline NLP processing on edge devices`,
  },
  {
    triggers: [
      "wifi",
      "wireless",
      "bluetooth",
      "zigbee",
      "zwave",
      "lora",
      "lorawan",
      "nbiot",
      "lte-m",
      "sigfox",
      "protocol comparison",
      "communication protocol",
      "wireless protocol",
      "rf",
      "radio",
    ],
    title: "IoT Communication Protocols",
    response: `## IoT Communication Protocols — Complete Comparison

Choosing the right protocol depends on range, power, data rate, and cost.

### Short-Range Protocols:

| Protocol | Range | Speed | Power | Best For |
|----------|-------|-------|-------|----------|
| **WiFi** | 50–100m | 150 Mbps | High | Home IoT, cameras |
| **Bluetooth 5** | 40–400m | 2 Mbps | Low | Wearables, phones |
| **BLE** | 10–40m | 1 Mbps | Very Low | Beacons, health monitors |
| **Zigbee** | 10–100m | 250 Kbps | Very Low | Smart home mesh (Hue lights) |
| **Z-Wave** | 30m | 100 Kbps | Very Low | Smart home, home security |
| **Thread** | 10–30m | 250 Kbps | Very Low | Google Home ecosystem |

### Long-Range Protocols (LPWAN):

| Protocol | Range | Speed | Power | Best For |
|----------|-------|-------|-------|----------|
| **LoRa** | 2–15 km | 0.3–50 Kbps | Very Low | Rural sensors, smart meters |
| **LoRaWAN** | 2–15 km | 0.3–50 Kbps | Very Low | LoRa with network stack |
| **NB-IoT** | 15+ km | 200 Kbps | Low | Cellular IoT (uses 4G towers) |
| **LTE-M** | 15+ km | 1 Mbps | Low | Moving assets, higher data |
| **Sigfox** | 10–50 km | 100 bps | Ultra-low | Rare messages only (12 bytes/msg) |

### Application-Layer Protocols:
- **MQTT** → Pub/sub, lightweight, port 1883/8883
- **CoAP** → Like HTTP but for constrained devices (UDP-based)
- **HTTP/HTTPS** → Universal, heavier, good for REST APIs
- **WebSocket** → Full-duplex, great for real-time dashboards
- **AMQP** → Enterprise message queuing (RabbitMQ)

### Choosing the right protocol:
- **Home automation** → Zigbee or Z-Wave (mesh, reliable)
- **Smart city sensors** → LoRaWAN (long range, battery lasts years)
- **Industrial monitoring** → NB-IoT or LTE-M (cellular coverage)
- **Wearables** → BLE (phone connectivity, low power)
- **WiFi-connected project** → MQTT over WiFi (easy to start)`,
  },
  {
    triggers: [
      "raspberry pi",
      "gpio",
      "i2c",
      "spi",
      "uart",
      "serial",
      "pwm",
      "analog",
      "digital pin",
      "pin",
    ],
    title: "GPIO & Interfaces",
    response: `## GPIO Pins & Hardware Interfaces

### GPIO (General Purpose Input/Output)
GPIO pins can be configured as:
- **Digital Output** → Control LEDs, relays (HIGH = 3.3V/5V, LOW = 0V)
- **Digital Input** → Read button states, digital sensors
- **Analog Input** → Read variable voltages via ADC (potentiometer, LDR)
- **PWM Output** → Simulate analog output (LED dimming, servo control)

### Serial Interfaces:

#### I2C (Inter-Integrated Circuit)
- **Wires**: 2 (SDA = data, SCL = clock)
- **Devices**: Multiple (each has 7-bit address)
- **Speed**: 100 kHz standard, 400 kHz fast
- **Use**: BMP280, BH1750, OLED displays
\`\`\`
ESP32 → I2C → [BMP280 addr:0x76] + [OLED addr:0x3C] + [RTC addr:0x68]
(all on same 2 wires!)
\`\`\`

#### SPI (Serial Peripheral Interface)
- **Wires**: 4 (MOSI, MISO, SCK, CS)
- **Speed**: Up to 80 MHz (much faster than I2C)
- **Use**: SD cards, displays, high-speed ADCs
- **Each device needs its own CS (Chip Select) pin**

#### UART (Universal Asynchronous Receiver-Transmitter)
- **Wires**: 2 (TX = transmit, RX = receive)
- **Use**: GPS modules, Bluetooth HC-05, Serial Monitor debugging
- **Common baud rates**: 9600, 115200 bps

#### 1-Wire
- **Wires**: 1 data line + ground
- **Use**: DS18B20 temperature sensor
- **Multiple sensors**: All on same single wire, each has 64-bit unique ID`,
  },
  {
    triggers: [
      "smart home",
      "home automation",
      "alexa",
      "google home",
      "nest",
      "smart bulb",
      "smart plug",
      "homekit",
      "matter protocol",
    ],
    title: "Smart Home IoT",
    response: `## Smart Home IoT

Smart home is the most visible IoT application — making homes automated, energy-efficient, and controllable from anywhere.

### Smart Home Ecosystem:
\`\`\`
[Phone App] ←→ [Cloud/Hub] ←→ [Smart Devices]
                               • Smart bulbs (Zigbee)
                               • Thermostats (WiFi)
                               • Door locks (Z-Wave)
                               • Security cameras (WiFi)
                               • Motion sensors (Zigbee)
\`\`\`

### Popular Platforms:
| Platform | Protocol | Hub Required |
|----------|----------|--------------|
| **Amazon Alexa** | WiFi, Zigbee | Echo (optional) |
| **Google Home** | WiFi, Thread | Nest Hub |
| **Apple HomeKit** | WiFi, Thread, BLE | HomePod/iPad |
| **Samsung SmartThings** | Zigbee, Z-Wave, WiFi | SmartThings Hub |
| **Home Assistant** | Everything | Raspberry Pi (self-hosted) |

### DIY Smart Home with ESP32:
\`\`\`cpp
// ESP32 controls relay based on MQTT command
#include <PubSubClient.h>
void callback(char* topic, byte* payload, unsigned int length) {
  if(payload[0] == '1') digitalWrite(RELAY_PIN, HIGH);  // Turn on
  else digitalWrite(RELAY_PIN, LOW);                     // Turn off
}
// Subscribe to: home/livingroom/light
\`\`\`

### Matter Protocol (2022):
New universal smart home standard supported by Apple, Google, Amazon, Samsung. Devices using Matter work with **all** platforms — no more "works with Alexa only" problem.`,
  },
  {
    triggers: [
      "industrial iot",
      "iiot",
      "industry 4.0",
      "scada",
      "plc",
      "opc ua",
      "predictive maintenance",
      "manufacturing iot",
    ],
    title: "Industrial IoT (IIoT)",
    response: `## Industrial IoT (IIoT) — Industry 4.0

IIoT applies IoT to manufacturing, energy, logistics, and infrastructure — at massive scale with strict reliability requirements.

### IIoT vs Consumer IoT:
| Aspect | Consumer IoT | Industrial IoT |
|--------|-------------|----------------|
| **Reliability** | 99% uptime OK | 99.999% required |
| **Scale** | 10–100 devices | 10,000+ devices |
| **Security** | Important | Critical (physical safety) |
| **Latency** | Seconds OK | Milliseconds required |
| **Lifespan** | 2–5 years | 10–20 years |
| **Environment** | Normal | Extreme (heat, vibration) |

### Key IIoT Technologies:
- **PLC (Programmable Logic Controller)** → Industrial microcontroller for factory automation
- **SCADA** → Supervisory Control and Data Acquisition — monitors/controls industrial processes
- **OPC-UA** → Industrial communication standard (secure, platform-independent)
- **Modbus** → Legacy industrial protocol (still widely used)
- **Time-Sensitive Networking (TSN)** → Ethernet with guaranteed <1ms latency

### Industry 4.0 Use Cases:
1. **Predictive Maintenance** → Vibration + temperature sensors detect machine wear before failure
2. **Digital Twin** → Virtual replica of factory machine, simulate before physical changes
3. **Quality Control** → Camera + ML detects defects on production line at 1000 items/min
4. **Asset Tracking** → GPS + BLE beacons track every tool and part in real-time
5. **Energy Management** → Smart meters optimize power usage across factory

### Estimated ROI:
- Predictive maintenance: **10–25% reduction** in maintenance costs
- Downtime reduction: **20–50%** fewer unplanned outages
- Energy savings: **10–20%** with smart monitoring`,
  },
  {
    triggers: [
      "healthcare iot",
      "iot medical",
      "iomt",
      "wearable",
      "health monitor",
      "patient monitoring",
      "smart health",
    ],
    title: "Healthcare IoT (IoMT)",
    response: `## Healthcare IoT — Internet of Medical Things (IoMT)

IoMT connects medical devices to healthcare networks, enabling remote monitoring, faster diagnosis, and improved patient outcomes.

### IoMT Devices:
| Device | Sensor Used | Data Collected |
|--------|-------------|----------------|
| **Smartwatch** (Apple Watch) | PPG, Accelerometer | Heart rate, ECG, SpO2, steps |
| **Continuous Glucose Monitor** | Electrochemical | Blood glucose every 5 minutes |
| **Smart Inhaler** | Motion, flow | Medication usage, breathing patterns |
| **Remote Patient Monitor** | Multi-sensor | Vitals: BP, temp, SpO2, HR |
| **Smart Pill Dispenser** | Weight, RFID | Medication compliance |
| **Implantable Pacemaker** | Electrical, accelerometer | Heart rhythm, physical activity |

### Key Protocols in Healthcare IoT:
- **Bluetooth LE** → Wearable to phone connection (low power)
- **HL7 FHIR** → Healthcare data exchange standard
- **DICOM** → Medical imaging standard
- **IEEE 11073** → Medical device communication

### Real Impact:
- Remote monitoring reduced **hospital readmissions by 38%** (congestive heart failure patients)
- Apple Watch has detected **atrial fibrillation** in thousands of users, prompting life-saving treatment
- CGMs give diabetics **continuous awareness** vs. 4–8 finger pricks per day

### Privacy & Compliance:
- **HIPAA** (US) — strict rules on health data storage and transmission
- All health data must be encrypted in transit (TLS 1.3) and at rest (AES-256)
- Patient consent required for any data sharing`,
  },
  {
    triggers: [
      "agriculture iot",
      "smart farming",
      "precision agriculture",
      "soil sensor",
      "irrigation",
      "crop monitoring",
      "smart farm",
    ],
    title: "Smart Agriculture IoT",
    response: `## Smart Agriculture IoT — Precision Farming

IoT is transforming agriculture — helping farmers maximize yield while minimizing water, fertilizer, and pesticide use.

### Key Sensors Used:
| Sensor | Measures | Used For |
|--------|----------|----------|
| **Capacitive soil sensor** | Moisture content | Automatic irrigation |
| **EC sensor** | Soil conductivity | Fertilizer optimization |
| **NPK sensor** | Nitrogen, Phosphorus, Potassium | Precision fertilization |
| **Weather station** | Temp, humidity, wind, rain | Crop disease prediction |
| **Leaf wetness sensor** | Surface moisture | Fungal disease risk |
| **PAR sensor** | Photosynthetically active radiation | Optimize grow lights |
| **CO₂ sensor** | Greenhouse CO₂ level | Maximize photosynthesis |

### LoRaWAN for Agriculture:
WiFi and Bluetooth don't cover large farms (100+ acres). **LoRaWAN** is ideal:
- Range: **2–15 km** in rural areas
- Battery: **5–10 years** on AA batteries
- Low data: perfect for sending sensor readings every 15 minutes

### Smart Irrigation System:
\`\`\`
Soil sensor → reads moisture < 30%
     ↓
ESP32 → MQTT → Cloud logic
     ↓
Irrigation relay → turns water on for 20 minutes
     ↓
Soil sensor → reads moisture > 60% → stops water
\`\`\`

### Impact:
- **30–50% reduction** in water usage with smart irrigation
- **20% yield increase** with precision fertilization
- **60% reduction** in pesticide use with drone-based targeted spraying`,
  },
  {
    triggers: [
      "power consumption",
      "battery",
      "deep sleep",
      "low power",
      "energy harvesting",
      "solar iot",
      "power management",
    ],
    title: "Power Management in IoT",
    response: `## Power Management in IoT Devices

Power efficiency is critical for battery-operated IoT sensors. An ESP32 at full power runs 240mA — a typical 18650 battery (3000mAh) would last only **12.5 hours**. With deep sleep, the same battery lasts **years**.

### ESP32 Power Modes:
| Mode | Current Draw | When to Use |
|------|-------------|-------------|
| **Active (WiFi on)** | 160–240 mA | Transmitting data |
| **Modem sleep** | 20 mA | WiFi paused, CPU running |
| **Light sleep** | 0.8 mA | Waiting for interrupt |
| **Deep sleep** | 0.01 mA (10 µA) | Long idle periods |

### Deep Sleep Code (ESP32):
\`\`\`cpp
#include <esp_sleep.h>

void setup() {
  // Read sensor and send data
  float temp = dht.readTemperature();
  mqtt.publish("home/temp", String(temp).c_str());
  
  // Sleep for 10 minutes (microseconds)
  esp_sleep_enable_timer_wakeup(10 * 60 * 1000000ULL);
  esp_deep_sleep_start();  // ZZZzzz...
}
// loop() never runs — device wakes, runs setup(), sleeps again
\`\`\`

### Battery Life Calculation:
- Active time: 3 seconds @ 200mA = 0.167 mAh per cycle
- Sleep time: 10 min @ 0.01mA = 0.0017 mAh per cycle
- Cycles per day: 144
- **Daily consumption: ~24.5 mAh**
- **3000mAh battery life: ~122 days** (4 months!)

### Energy Harvesting:
- **Solar** → Tiny 0.5W panel charges 3.7V LiPo via TP4056 module
- **Vibration** → Piezoelectric harvester on machinery
- **Thermal** → Peltier module on heat source
- **RF Energy** → Harvest from ambient radio waves (very limited)`,
  },
  {
    triggers: [
      "programming",
      "micropython",
      "python iot",
      "c++ arduino",
      "javascript iot",
      "node.js iot",
      "freertos",
      "rtos",
    ],
    title: "IoT Programming",
    response: `## Programming Languages & Frameworks for IoT

### C/C++ (Arduino)
Most common for microcontrollers. Direct hardware control, fastest performance.
\`\`\`cpp
// Reading temperature and publishing via MQTT
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

WiFiClient espClient;
PubSubClient mqtt(espClient);
DHT dht(4, DHT22);

void loop() {
  float temp = dht.readTemperature();
  char msg[10];
  sprintf(msg, "%.1f", temp);
  mqtt.publish("sensors/temperature", msg);
  delay(5000);
}
\`\`\`

### MicroPython
Python for microcontrollers — easier to write, slightly slower than C++.
\`\`\`python
import machine, dht, time
from umqtt.simple import MQTTClient

sensor = dht.DHT22(machine.Pin(4))
client = MQTTClient("esp32", "broker.hivemq.com")
client.connect()

while True:
    sensor.measure()
    temp = sensor.temperature()
    client.publish(b"sensors/temp", str(temp).encode())
    time.sleep(5)
\`\`\`

### JavaScript/Node.js (Server/Raspberry Pi)
\`\`\`javascript
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('message', (topic, message) => {
  console.log(\`\${topic}: \${message.toString()}\`);
  // Save to database, trigger alerts, etc.
});
client.subscribe('sensors/#');  // Subscribe to all sensor topics
\`\`\`

### FreeRTOS
Real-Time Operating System for ESP32 — run multiple tasks simultaneously:
\`\`\`cpp
// Task 1: Read sensor every second
xTaskCreate(sensorTask, "Sensor", 2048, NULL, 1, NULL);
// Task 2: Send MQTT every 10 seconds  
xTaskCreate(mqttTask, "MQTT", 4096, NULL, 2, NULL);
\`\`\`

### Language Comparison:
| Language | Platform | Speed | Ease | Use Case |
|----------|----------|-------|------|----------|
| C/C++ | Arduino, ESP32 | Fastest | Hard | Production MCU |
| MicroPython | ESP32, Pyboard | Medium | Easy | Prototyping |
| Python | Raspberry Pi | Medium | Easy | Gateway, server |
| JavaScript | Node.js, RPi | Medium | Medium | Backend, dashboards |`,
  },
];

// ─── Fallback responses ──────────────────────────────────────────────────────
const greetingTriggers = [
  "hello",
  "hi",
  "hey",
  "hii",
  "helo",
  "greetings",
  "good morning",
  "good afternoon",
  "good evening",
];
const thanksTriggers = [
  "thank",
  "thanks",
  "thank you",
  "thx",
  "ty",
  "great",
  "awesome",
  "perfect",
  "nice",
  "good job",
];
const helpTriggers = [
  "help",
  "what can you do",
  "what do you know",
  "topics",
  "what can i ask",
  "menu",
];

function matchesGreeting(msg: string): boolean {
  const clean = msg
    .toLowerCase()
    .trim()
    .replace(/[?!.,]/g, "");
  return greetingTriggers.some((g) => clean === g || clean.startsWith(g + " "));
}
function matchesThanks(msg: string): boolean {
  return thanksTriggers.some((t) => msg.toLowerCase().includes(t));
}
function matchesHelp(msg: string): boolean {
  return helpTriggers.some((t) => msg.toLowerCase().includes(t));
}

function findBestMatch(message: string): string {
  const lower = message.toLowerCase();

  if (matchesGreeting(message)) {
    return `## Hello! 👋 Welcome to the All About IoT Assistant

I'm your IoT learning companion. I can explain **any IoT topic** from beginner to advanced level.

### Try asking me about:
- 🔌 **Hardware** → Arduino, ESP32, NodeMCU, Raspberry Pi
- 📡 **Protocols** → MQTT, WiFi, LoRa, Bluetooth, Zigbee
- 🌡️ **Sensors** → DHT22, PIR, ultrasonic, gas sensors
- ☁️ **Cloud** → AWS IoT, Azure IoT, ThingSpeak
- 🔐 **Security** → TLS, encryption, authentication
- 🤖 **AI + IoT** → Edge AI, TinyML, LLMs in IoT
- 🏭 **Applications** → Smart home, industrial, healthcare, agriculture

What would you like to learn today?`;
  }

  if (matchesThanks(message)) {
    return `You're welcome! 😊 

Feel free to ask anything else about IoT — whether it's hardware, protocols, security, cloud platforms, or real-world applications. I'm here to help you master it all!`;
  }

  if (matchesHelp(message)) {
    const topics = knowledgeBase.map((e) => `- **${e.title}**`).join("\n");
    return `## Topics I Can Help You With\n\n${topics}\n\n**How to ask:** Just type naturally — "What is MQTT?", "How does a PIR sensor work?", "Explain edge computing", "Show me Arduino code for DHT22", etc.`;
  }

  // Score each knowledge base entry
  let bestScore = 0;
  let bestResponse = "";

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const trigger of entry.triggers) {
      if (lower.includes(trigger)) {
        score += trigger.split(" ").length; // longer phrase match = higher score
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestResponse = entry.response;
    }
  }

  if (bestScore > 0) return bestResponse;

  // Partial keyword fallback
  const keywords: Record<string, string> = {
    iot: "iot introduction",
    "internet of things": "iot introduction",
    sensor: "sensors",
    mqtt: "mqtt",
    esp: "esp32",
    arduino: "arduino",
    wifi: "wireless protocol",
    cloud: "cloud iot",
    edge: "edge computing",
    security: "iot security",
    ml: "machine learning",
    ai: "machine learning",
    llm: "llm",
    "smart home": "smart home",
    industrial: "industrial iot",
    health: "healthcare iot",
    farm: "agriculture iot",
    battery: "power management",
    sleep: "power management",
    python: "programming",
    code: "programming",
    raspberry: "raspberry pi",
    gpio: "gpio",
    i2c: "gpio",
  };

  for (const [kw, topicHint] of Object.entries(keywords)) {
    if (lower.includes(kw)) {
      const match = knowledgeBase.find((e) =>
        e.triggers.some(
          (t) => t.includes(topicHint) || topicHint.includes(t.split(" ")[0]),
        ),
      );
      if (match) return match.response;
    }
  }

  return `I don't have a specific answer for **"${message}"** yet, but I can help with these IoT topics:

**Hardware:** Arduino, ESP32, NodeMCU, Raspberry Pi, sensors (DHT22, PIR, ultrasonic, gas)

**Protocols:** MQTT, WiFi, Bluetooth, Zigbee, Z-Wave, LoRa, NB-IoT, I2C, SPI, UART

**Platforms:** AWS IoT, Azure IoT Hub, ThingSpeak, Adafruit IO, Home Assistant

**Concepts:** Edge computing, cloud IoT, IoT security (TLS, encryption), Machine Learning, LLMs, Industrial IoT, Smart Home, Healthcare IoT, Smart Agriculture

**Programming:** Arduino C++, MicroPython, Node.js for IoT, FreeRTOS

Try rephrasing or ask about any of the topics above! 🚀`;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, sessionId } = parsed.data;
  const sid = sessionId ?? `session_${Date.now()}`;

  const response = findBestMatch(message);
  saveChatExchange(message, response, sid);

  res.json({
    response,
    sessionId: sid,
    relatedTopics: extractRelatedTopics(message),
  });
});

// Streaming endpoint — simulate word-by-word streaming for the same knowledge base
router.post("/chat/stream", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, sessionId } = parsed.data;
  const sid = sessionId ?? `session_${Date.now()}`;

  const fullResponse = findBestMatch(message);
  saveChatExchange(message, fullResponse, sid);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`data: ${JSON.stringify({ sessionId: sid })}\n\n`);

  // Stream word by word with small delay for realistic feel
  const words = fullResponse.split(" ");
  for (const word of words) {
    res.write(`data: ${JSON.stringify({ content: word + " " })}\n\n`);
    await new Promise((r) => setTimeout(r, 18));
  }

  res.write(`data: ${JSON.stringify({ done: true, sessionId: sid })}\n\n`);
  res.end();
});

router.get("/chat/history", async (req, res): Promise<void> => {
  const parsed = GetChatHistoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const limit = parsed.data.limit ?? 20;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    res
      .status(400)
      .json({ error: "limit must be an integer between 1 and 100" });
    return;
  }

  const messages = db
    .prepare(
      `SELECT id, role, content, session_id, created_at
       FROM chat_messages
       WHERE session_id = ?
       ORDER BY id DESC
       LIMIT ?`,
    )
    .all(parsed.data.sessionId, limit) as Array<{
    id: number;
    role: string;
    content: string;
    session_id: string;
    created_at: string;
  }>;

  res.json(
    messages.reverse().map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      sessionId: m.session_id,
      createdAt: new Date(m.created_at.replace(" ", "T") + "Z").toISOString(),
    })),
  );
});

router.delete("/chat/history", (req, res): void => {
  const parsed = GetChatHistoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  db.prepare("DELETE FROM chat_messages WHERE session_id = ?").run(
    parsed.data.sessionId,
  );
  res.status(204).end();
});

function extractRelatedTopics(message: string): string[] {
  const topics: string[] = [];
  const lowerMsg = message.toLowerCase();
  const topicMap: Record<string, string> = {
    mqtt: "MQTT Protocol",
    sensor: "IoT Sensors",
    nodemcu: "NodeMCU",
    esp: "ESP8266/ESP32",
    arduino: "Arduino",
    raspberry: "Raspberry Pi",
    "machine learning": "ML in IoT",
    llm: "Large Language Models",
    security: "IoT Security",
    cloud: "Cloud IoT Platforms",
    edge: "Edge Computing",
    protocol: "IoT Protocols",
    wifi: "WiFi Connectivity",
    bluetooth: "Bluetooth",
    zigbee: "Zigbee",
    lora: "LoRa",
    "smart home": "Smart Home IoT",
    industrial: "Industrial IoT",
  };
  for (const [keyword, topic] of Object.entries(topicMap)) {
    if (lowerMsg.includes(keyword) && topics.length < 3) topics.push(topic);
  }
  return topics;
}

function saveChatExchange(
  message: string,
  response: string,
  sessionId: string,
): void {
  const saveMessage = db.prepare(
    "INSERT INTO chat_messages (role, content, session_id) VALUES (?, ?, ?)",
  );

  db.exec("BEGIN IMMEDIATE");
  try {
    saveMessage.run("user", message, sessionId);
    saveMessage.run("assistant", response, sessionId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export default router;
