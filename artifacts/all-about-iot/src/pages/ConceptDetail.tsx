import { useGetConcept } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PlayCircle, Activity, Cpu, Wifi, Shield, Cloud, Brain, Layers, Radio, Thermometer, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { marked } from "marked";
import { useMemo, useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import arduino from "highlight.js/lib/languages/arduino";
import cpp from "highlight.js/lib/languages/cpp";
import python from "highlight.js/lib/languages/python";
import javascript from "highlight.js/lib/languages/javascript";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import { useProgress } from "@/hooks/use-progress";
import { FlashCardDeck } from "@/components/ui/flash-card";
import type { FlashCardData } from "@/components/ui/flash-card";

hljs.registerLanguage("arduino", arduino);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("python", python);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);

// ─── Per-concept flashcard banks ──────────────────────────────────────────────
const CONCEPT_CARDS: Record<string, FlashCardData[]> = {
  "introduction-to-iot": [
    { q: "What does IoT stand for?", a: "Internet of Things — a network of physical devices embedded with sensors, software, and connectivity to collect and exchange data." },
    { q: "Name the 4 layers of IoT architecture.", a: "Perception layer (sensors/actuators) → Network layer (connectivity) → Processing layer (edge/cloud) → Application layer (user-facing apps)." },
    { q: "What is a 'thing' in IoT?", a: "Any physical device with an embedded system that can collect data and communicate over a network — e.g. a thermostat, smartwatch, or industrial machine." },
    { q: "Name 3 real-world IoT applications.", a: "Smart home (Alexa, Nest), smart agriculture (soil moisture monitoring), industrial IoT (predictive maintenance on factory machines)." },
    { q: "What is the difference between IoT and M2M?", a: "M2M (Machine-to-Machine) is direct device-to-device communication, usually point-to-point. IoT is broader: uses cloud, analytics, and can involve many devices in complex systems." },
    { q: "What year was the term 'Internet of Things' coined?", a: "1999, by Kevin Ashton at Procter & Gamble, in the context of RFID and supply chain management." },
  ],
  "iot-sensors": [
    { q: "What is the difference between an active and passive sensor?", a: "Active sensors emit energy (radar, ultrasonic) to detect. Passive sensors detect naturally occurring energy (PIR detects infrared radiation from warm bodies)." },
    { q: "What does a DHT22 measure?", a: "Temperature (−40 to +80°C, ±0.5°C accuracy) and relative humidity (0–100%, ±2–5% accuracy). Uses single-wire protocol." },
    { q: "How does an ultrasonic sensor (HC-SR04) work?", a: "Emits a 40kHz ultrasonic pulse, measures the time for the echo to return. Distance = (time × speed of sound) / 2." },
    { q: "What is a PIR sensor and where is it used?", a: "Passive Infrared — detects changes in infrared radiation from warm bodies. Used in motion-activated lights, alarm systems, occupancy detectors." },
    { q: "What does a BMP280 sensor measure?", a: "Atmospheric pressure and temperature. Also used to calculate altitude since pressure decreases with height." },
    { q: "What is sensor fusion?", a: "Combining data from multiple sensors to produce more accurate, reliable results than any single sensor could. e.g. IMU = accelerometer + gyroscope + magnetometer." },
  ],
  "microcontrollers": [
    { q: "What is the difference between a microcontroller and a microprocessor?", a: "MCU: CPU + RAM + Flash + peripherals all on one chip — no OS needed, self-contained. MPU: just the CPU, needs external RAM, storage, and peripherals." },
    { q: "What is the Harvard architecture?", a: "Separate memory buses for instructions (flash) and data (RAM). Most MCUs use this. Faster than Von Neumann where both share one bus." },
    { q: "What is a GPIO pin?", a: "General Purpose Input/Output — a configurable digital pin on an MCU that can be set as input (read a sensor) or output (control an LED/relay)." },
    { q: "What is the Arduino Uno's MCU and key specs?", a: "ATmega328P — 8-bit AVR, 16 MHz, 32KB flash, 2KB SRAM, 14 digital I/O (6 PWM), 6 analog inputs, 5V logic." },
    { q: "What is the ESP32's main advantage over Arduino Uno?", a: "Dual-core 240 MHz, built-in WiFi + Bluetooth, 4MB flash, 520KB RAM, 36 GPIO — massively more powerful while still affordable (~$4)." },
    { q: "What is a bootloader in a microcontroller?", a: "A small program stored in flash that runs on startup, allowing the MCU to accept new firmware without a separate programmer — enables uploading via USB." },
  ],
  "esp32-programming": [
    { q: "How do you connect to WiFi on ESP32 in Arduino?", a: "Include WiFi.h, call WiFi.begin(ssid, password), then wait while WiFi.status() != WL_CONNECTED. Use WiFi.localIP() to get the assigned IP." },
    { q: "What is deep sleep on ESP32?", a: "A power mode where the CPU and most peripherals shut down, consuming ~10µA. The ULP co-processor can still run. Used to extend battery life." },
    { q: "What is the ESP32's dual-core architecture?", a: "Two Xtensa LX6 cores: Core 0 (protocol CPU) runs WiFi/BT stack. Core 1 (app CPU) runs user code. xTaskCreatePinnedToCore() pins tasks to a core." },
    { q: "What is OTA update on ESP32?", a: "Over-The-Air firmware update — uploading new firmware wirelessly via WiFi without physical access. Supported via ArduinoOTA library or IDF." },
    { q: "What is the ESP32's ADC resolution?", a: "12-bit ADC — 4096 levels (0–4095) representing 0–3.3V. Non-linear at extremes; recommend 100mV–3.2V range for accuracy." },
    { q: "How many PWM channels does ESP32 have?", a: "16 independent PWM channels (LEDC peripheral) that can be assigned to any GPIO. Supports frequencies from a few Hz to 40 MHz." },
  ],
  "mqtt-protocol": [
    { q: "What does MQTT stand for and what is it used for?", a: "Message Queuing Telemetry Transport — a lightweight publish-subscribe messaging protocol designed for IoT devices on low-bandwidth, unreliable networks." },
    { q: "What are the 3 components of MQTT?", a: "Publisher (sends messages to topics), Broker (routes messages, e.g. Mosquitto), Subscriber (receives messages on subscribed topics)." },
    { q: "What are MQTT QoS levels?", a: "QoS 0: at most once (fire and forget). QoS 1: at least once (acknowledged, may duplicate). QoS 2: exactly once (4-step handshake, slowest)." },
    { q: "What is a retain flag in MQTT?", a: "Tells the broker to keep the last message on a topic. New subscribers immediately receive it — useful for status/config topics." },
    { q: "What is MQTT over TLS?", a: "MQTT secured with TLS encryption (MQTTS), typically on port 8883. Adds mutual TLS for device authentication. Essential for production IoT." },
    { q: "Name 3 popular MQTT brokers.", a: "Mosquitto (open-source, lightweight), HiveMQ (enterprise), AWS IoT Core (managed cloud). ThingSpeak and Adafruit IO for beginners." },
  ],
  "machine-learning-iot": [
    { q: "What is TinyML?", a: "Running machine learning inference on microcontrollers (MCUs) with kilobytes of RAM — no cloud needed. Enables on-device intelligence." },
    { q: "Name 3 TinyML frameworks.", a: "TensorFlow Lite Micro (TFLM), Edge Impulse, MicroAI. TFLM can run on Arduino Nano BLE Sense, ESP32, and STM32." },
    { q: "What is model quantisation?", a: "Converting a model's weights from float32 to int8 (or float16). Reduces model size 4x and inference time, with slight accuracy loss." },
    { q: "Name 3 TinyML applications on IoT devices.", a: "Keyword spotting ('OK Google'), gesture recognition from IMU data, anomaly detection on vibration/temperature sensor streams." },
    { q: "What is the difference between training and inference?", a: "Training: learning model parameters from data (GPU-intensive, done in cloud/PC). Inference: applying the trained model to new data (runs on MCU)." },
    { q: "What is Edge Impulse?", a: "A platform for building and deploying TinyML models — collect sensor data, train, optimise, and deploy to Arduino, ESP32, or Pi without writing ML code from scratch." },
  ],
  "llm-iot": [
    { q: "How can LLMs be used in IoT systems?", a: "Natural language device control ('turn off all lights'), anomaly explanation, automated alert summaries, and voice-based interfaces for embedded devices." },
    { q: "What is RAG in the context of IoT?", a: "Retrieval-Augmented Generation — an LLM augmented with real-time sensor data or device logs, enabling it to answer questions about current system state." },
    { q: "What is the difference between an LLM and TinyML?", a: "LLMs (GPT, Gemini) are large cloud models for language tasks. TinyML runs small, task-specific models on MCUs. They serve different purposes." },
    { q: "What is a prompt in the context of LLMs?", a: "The text input given to a language model. Prompt engineering is crafting inputs that elicit accurate, useful outputs from the model." },
    { q: "What is function calling in LLMs?", a: "A feature where the LLM can invoke predefined functions (e.g. read_sensor(), toggle_relay()) based on user intent, enabling it to interact with IoT systems." },
    { q: "Name a challenge of using cloud LLMs in IoT.", a: "Latency (round-trip to cloud), internet dependency, cost per token, and privacy (sensor data sent to third-party servers)." },
  ],
  "iot-security": [
    { q: "What was the Mirai botnet?", a: "A 2016 malware that infected 600,000+ IoT devices (cameras, routers) using default credentials and launched massive DDoS attacks, peaking at 1.2 Tbps." },
    { q: "What is MQTT over TLS and why is it important?", a: "Encrypts MQTT traffic with TLS (port 8883). Without it, credentials and sensor data travel in plain text — easily intercepted on the network." },
    { q: "What is certificate pinning in IoT?", a: "Hard-coding the server's TLS certificate fingerprint into the device firmware, preventing MITM attacks even with rogue certificates." },
    { q: "What is secure boot?", a: "A MCU feature that verifies firmware cryptographic signatures before execution, preventing unsigned/malicious code from running." },
    { q: "What is network segmentation for IoT?", a: "Isolating IoT devices on a separate VLAN or subnet so a compromised device can't access critical systems (PCs, NAS, servers) on the main network." },
    { q: "What is OTA (Over-the-Air) security?", a: "Ensuring firmware updates are signed, encrypted, and authenticated before installation. Without this, an attacker could push malicious firmware." },
  ],
  "edge-computing": [
    { q: "What is edge computing?", a: "Processing data near the source (on device or local gateway) instead of sending it all to the cloud. Reduces latency, bandwidth costs, and improves privacy." },
    { q: "What is fog computing?", a: "A layer between edge devices and the cloud — intermediate gateways (Raspberry Pi, industrial PC) that aggregate and pre-process data from many edge nodes." },
    { q: "Name 3 benefits of edge computing for IoT.", a: "Low latency (real-time decisions), offline operation (works without internet), data privacy (sensitive data stays local), reduced cloud costs." },
    { q: "What is AWS Greengrass?", a: "An AWS service that extends cloud capabilities to edge devices — runs Lambda functions, Docker containers, and ML models locally on a gateway." },
    { q: "What hardware is used for edge computing?", a: "NVIDIA Jetson (GPU-accelerated AI), Raspberry Pi, Intel NUC, industrial PCs, or MCU-level devices running FreeRTOS for ultra-constrained edge." },
    { q: "What is a digital twin?", a: "A virtual replica of a physical device or system, updated in real-time with sensor data. Used for monitoring, simulation, and predictive maintenance." },
  ],
  "cloud-iot-platforms": [
    { q: "Name 3 major cloud IoT platforms.", a: "AWS IoT Core (device management, rules engine), Azure IoT Hub (bi-directional messaging), Google Cloud IoT Core (Pub/Sub based). Also: ThingSpeak, Adafruit IO for beginners." },
    { q: "What is device shadow (AWS IoT)?", a: "A JSON document in AWS IoT Core that stores the current and desired state of a device. Enables controlling devices even when they're offline." },
    { q: "What is a rules engine in AWS IoT?", a: "A feature that routes MQTT messages to other AWS services (Lambda, DynamoDB, S3, SNS) based on SQL-like query rules on message content." },
    { q: "What is InfluxDB and why is it used in IoT?", a: "A time-series database optimised for storing timestamped data from sensors. Supports very high write throughput and efficient time-range queries." },
    { q: "What is Grafana?", a: "An open-source visualisation platform that creates dashboards from time-series databases (InfluxDB, Prometheus). Widely used with IoT sensor data." },
    { q: "What is AMQP?", a: "Advanced Message Queuing Protocol — enterprise-grade message broker protocol. Used in IoT for reliable, high-throughput messaging. RabbitMQ implements AMQP." },
  ],
  "iot-protocols": [
    { q: "Compare WiFi, BLE, Zigbee, and LoRa for IoT.", a: "WiFi: high speed, high power. BLE: low power, short range. Zigbee: mesh, 250kbps, ~100m. LoRa: 15km+, ultra-low power, kb/s data rate." },
    { q: "What is the Thread protocol?", a: "An IP-based mesh networking protocol for smart home (802.15.4 radio). Used by Matter (Apple HomeKit, Google Home). Low power, self-healing mesh." },
    { q: "What is NB-IoT?", a: "Narrowband IoT — a 3GPP cellular standard for low-power, wide-area IoT. Uses existing LTE spectrum. 1km+ range, years of battery life, ~250kbps." },
    { q: "What frequency does Zigbee use?", a: "Primarily 2.4 GHz globally (channel 11–26). Also 868 MHz (Europe) and 915 MHz (Americas) — less interference but lower data rate." },
    { q: "What is the CoAP protocol?", a: "Constrained Application Protocol — a RESTful protocol for constrained devices over UDP. Lighter than HTTP. Supports GET, POST, PUT, DELETE like REST." },
    { q: "What is LoRaWAN?", a: "A MAC layer protocol on top of LoRa — defines network architecture (end devices → gateways → network server → application server). Manages ADR, channels." },
  ],
};


// ─── Concept-specific inline animations ──────────────────────────────────────

function IoTNetworkAnim() {
  const nodes = [
    { x: 50, y: 20, label: "Cloud", color: "#7c3aed" },
    { x: 20, y: 55, label: "Sensor A", color: "#00d4ff" },
    { x: 80, y: 55, label: "Sensor B", color: "#00d4ff" },
    { x: 35, y: 82, label: "Gateway", color: "#10b981" },
    { x: 65, y: 82, label: "Actuator", color: "#f59e0b" },
  ];
  const edges = [[0,1],[0,2],[1,3],[2,4],[3,4]];
  return (
    <div className="w-full h-44 bg-muted/40 dark:bg-[#050810] border border-border rounded-xl overflow-hidden relative">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {edges.map(([a,b],i) => (
          <line key={i} x1={`${nodes[a].x}%`} y1={`${nodes[a].y}%`} x2={`${nodes[b].x}%`} y2={`${nodes[b].y}%`}
            stroke="rgba(0,212,255,0.35)" strokeWidth="0.8" strokeDasharray="2 2"/>
        ))}
        {edges.map(([a,b],i) => {
          const sx = nodes[a].x, sy = nodes[a].y, ex = nodes[b].x, ey = nodes[b].y;
          return (
            <circle key={`p${i}`} r="1.2" fill="#00d4ff">
              <animate attributeName="cx" values={`${sx}%;${ex}%;${sx}%`} dur={`${2+i*0.5}s`} repeatCount="indefinite"/>
              <animate attributeName="cy" values={`${sy}%;${ey}%;${sy}%`} dur={`${2+i*0.5}s`} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0;1;0" dur={`${2+i*0.5}s`} repeatCount="indefinite"/>
            </circle>
          );
        })}
        {nodes.map((n,i) => (
          <g key={i}>
            <circle cx={`${n.x}%`} cy={`${n.y}%`} r="5" fill="transparent" stroke={n.color} strokeWidth="1.5"/>
            <text x={`${n.x}%`} y={`${n.y+9}%`} textAnchor="middle" fontSize="4" fill={n.color} fontFamily="monospace">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function SensorAnim() {
  const sensors = [
    { label:"DHT11", emoji:"🌡️", color:"#ef4444", desc:"Temp & Humidity" },
    { label:"HC-SR04", emoji:"📡", color:"#3b82f6", desc:"Ultrasonic" },
    { label:"PIR", emoji:"👁️", color:"#10b981", desc:"Motion" },
    { label:"LDR", emoji:"☀️", color:"#f59e0b", desc:"Light" },
    { label:"MQ-2", emoji:"💨", color:"#8b5cf6", desc:"Gas" },
    { label:"BMP280", emoji:"🌬️", color:"#06b6d4", desc:"Pressure" },
  ];
  return (
    <div className="w-full bg-muted/40 dark:bg-[#050810] border border-border rounded-xl p-4 grid grid-cols-3 gap-3">
      {sensors.map((s,i) => (
        <div key={i} className="flex flex-col items-center p-2 rounded-lg border border-border bg-background/50"
          style={{animation:`fadeIn 0.4s ease ${i*0.1}s both`}}>
          <div className="text-2xl mb-1">{s.emoji}</div>
          <div className="text-xs font-mono font-bold" style={{color:s.color}}>{s.label}</div>
          <div className="text-xs text-muted-foreground text-center">{s.desc}</div>
          <div className="mt-2 h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full" style={{background:s.color, width:"70%", animation:`pulse 1.5s ease-in-out ${i*0.3}s infinite alternate`}}/>
          </div>
        </div>
      ))}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} @keyframes pulse{from{width:30%}to{width:90%}}`}</style>
    </div>
  );
}

function MicrocontrollerAnim() {
  const regs = ["R0","R1","PC","SP","IR","ACC","MAR","MDR"];
  return (
    <div className="w-full bg-muted/40 dark:bg-[#050810] border border-border rounded-xl p-4 overflow-hidden">
      <div className="flex gap-4 items-center justify-center">
        <div className="border border-cyan-500/40 rounded-lg p-3 bg-background/60 dark:bg-[#0d1a2e] min-w-[110px]">
          <div className="text-xs text-cyan-500 dark:text-cyan-400 font-mono text-center mb-2">CPU Core @ 240MHz</div>
          <div className="grid grid-cols-2 gap-1">
            {regs.map((r,i) => (
              <div key={r} className="text-xs font-mono bg-muted/80 dark:bg-black/40 rounded px-1.5 py-0.5 text-center"
                style={{color:`hsl(${180+i*20},80%,65%)`, animation:`blink ${0.8+i*0.15}s ease-in-out infinite alternate`}}>
                {r}: {(Math.random()*255|0).toString(16).padStart(2,"0").toUpperCase()}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 text-xs font-mono">
          {[["Flash","32KB","#00d4ff"],["SRAM","2KB","#10b981"],["EEPROM","1KB","#f59e0b"]].map(([n,s,c])=>(
            <div key={n} className="border rounded px-2 py-1" style={{borderColor:c+"40",color:c}}>
              {n} <span className="opacity-60">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes blink{from{opacity:0.4}to{opacity:1}}`}</style>
    </div>
  );
}

function ESP32Anim() {
  return (
    <div className="w-full h-44 bg-muted/40 dark:bg-[#050810] border border-border rounded-xl flex items-center justify-center overflow-hidden relative">
      <div className="relative border-2 border-cyan-500/40 bg-background/60 dark:bg-[#0a1628] rounded-lg w-40 h-32 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs font-mono text-cyan-400 font-bold">ESP32</div>
          <div className="text-[9px] text-muted-foreground">240MHz Dual-Core</div>
          <div className="text-[9px] text-purple-400 mt-1">WiFi + BT 4.2</div>
        </div>
        {[-60,-40,-20,0,20,40,60].map((deg,i) => (
          <div key={i} className="absolute inset-0 rounded-full border border-cyan-500/20"
            style={{transform:`scale(${1.5+i*0.3})`, animation:`wifiPulse ${1+i*0.2}s ease-out infinite`, animationDelay:`${i*0.15}s`}}/>
        ))}
      </div>
      <div className="absolute top-2 right-2 text-xs font-mono text-green-400 opacity-70">
        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>SSID: HomeNet</div>
      </div>
      <style>{`@keyframes wifiPulse{0%{opacity:0.5;transform:scale(1)}100%{opacity:0;transform:scale(2.5)}}`}</style>
    </div>
  );
}

function MQTTAnim() {
  const devices = [
    {x:15,y:30,label:"Pub A",color:"#00d4ff"},{x:15,y:65,label:"Pub B",color:"#7c3aed"},
    {x:85,y:30,label:"Sub A",color:"#10b981"},{x:85,y:65,label:"Sub B",color:"#f59e0b"},
  ];
  return (
    <div className="w-full h-44 bg-muted/40 dark:bg-[#050810] border border-border rounded-xl overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {devices.map((d,i)=>(
          <g key={i}>
            <circle cx={`${d.x}%`} cy={`${d.y}%`} r="7" fill="transparent" stroke={d.color} strokeWidth="1.5"/>
            <text x={`${d.x}%`} y={`${d.y+0.5}%`} textAnchor="middle" dominantBaseline="middle" fontSize="3.5" fill={d.color} fontFamily="monospace">{d.label}</text>
          </g>
        ))}
        <rect x="42%" y="38%" width="16%" height="24%" rx="2" fill="transparent" stroke="#00d4ff" strokeWidth="1.2"/>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="3.5" fill="#00d4ff" fontFamily="monospace">MQTT</text>
        <text x="50%" y="55%" textAnchor="middle" fontSize="3" fill="#00d4ff" fontFamily="monospace" opacity="0.7">Broker</text>
        {devices.slice(0,2).map((d,i)=>(
          <circle key={`pub${i}`} r="1.5" fill={d.color}>
            <animate attributeName="cx" values={`${d.x}%;50%;${d.x}%`} dur={`${1.5+i*0.5}s`} repeatCount="indefinite"/>
            <animate attributeName="cy" values={`${d.y}%;50%;${d.y}%`} dur={`${1.5+i*0.5}s`} repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;0.5;0" dur={`${1.5+i*0.5}s`} repeatCount="indefinite"/>
          </circle>
        ))}
        {devices.slice(2).map((d,i)=>(
          <circle key={`sub${i}`} r="1.5" fill={d.color}>
            <animate attributeName="cx" values={`50%;${d.x}%;50%`} dur={`${1.5+i*0.4}s`} repeatCount="indefinite" begin={`${0.5+i*0.3}s`}/>
            <animate attributeName="cy" values={`50%;${d.y}%;50%`} dur={`${1.5+i*0.4}s`} repeatCount="indefinite" begin={`${0.5+i*0.3}s`}/>
            <animate attributeName="opacity" values="0;1;0" dur={`${1.5+i*0.4}s`} repeatCount="indefinite" begin={`${0.5+i*0.3}s`}/>
          </circle>
        ))}
      </svg>
    </div>
  );
}

function MLAnim() {
  const layers = [[3,4,4,2]];
  const layerData = [3,4,4,2];
  return (
    <div className="w-full h-44 bg-muted/40 dark:bg-[#050810] border border-border rounded-xl overflow-hidden flex items-center justify-center">
      <svg viewBox="0 0 100 80" className="w-full h-full">
        {layerData.map((count, li) => (
          Array.from({length:count}).map((_,ni) => {
            const x = 15 + li * 24;
            const y = 40 - (count-1)*8 + ni*16;
            const colors = ["#00d4ff","#7c3aed","#10b981","#f59e0b"];
            return (
              <g key={`${li}-${ni}`}>
                {li < layerData.length-1 && Array.from({length:layerData[li+1]}).map((_,nj)=>{
                  const nx=x+24, ny=40-(layerData[li+1]-1)*8+nj*16;
                  return <line key={nj} x1={x} y1={y} x2={nx} y2={ny} stroke="rgba(100,100,180,0.25)" strokeWidth="0.5"/>;
                })}
                <circle cx={x} cy={y} r="4" fill="transparent" stroke={colors[li]} strokeWidth="1.2">
                  <animate attributeName="r" values="3.5;4.5;3.5" dur={`${1+li*0.2+ni*0.1}s`} repeatCount="indefinite"/>
                </circle>
              </g>
            );
          })
        ))}
        <text x="50" y="76" textAnchor="middle" fontSize="4" fill="currentColor" opacity="0.4" fontFamily="monospace">Input → Hidden → Output</text>
      </svg>
    </div>
  );
}

function SecurityAnim() {
  return (
    <div className="w-full h-44 bg-muted/40 dark:bg-[#050810] border border-border rounded-xl flex items-center justify-center overflow-hidden relative">
      <div className="text-center z-10">
        <Shield className="h-16 w-16 text-green-400 mx-auto mb-2" style={{filter:"drop-shadow(0 0 12px #10b981)"}}/>
        <div className="text-xs font-mono text-green-400">TLS 1.3 Encrypted</div>
        <div className="text-xs text-muted-foreground">AES-256 / RSA-4096</div>
      </div>
      {[1,2,3,4].map(i=>(
        <div key={i} className="absolute inset-0 rounded-full border border-green-500/20"
          style={{margin:`${i*20}px`, animation:`secPulse 2s ease-out ${i*0.4}s infinite`}}/>
      ))}
      <style>{`@keyframes secPulse{0%{opacity:0.6;transform:scale(0.9)}100%{opacity:0;transform:scale(1.1)}}`}</style>
    </div>
  );
}

function EdgeAnim() {
  return (
    <div className="w-full h-44 bg-muted/40 dark:bg-[#050810] border border-border rounded-xl overflow-hidden">
      <svg viewBox="0 0 100 80" className="w-full h-full">
        <rect x="5" y="30" width="22" height="20" rx="2" fill="transparent" stroke="#00d4ff" strokeWidth="1"/>
        <text x="16" y="40.5" textAnchor="middle" dominantBaseline="middle" fontSize="3.5" fill="#00d4ff" fontFamily="monospace">IoT</text>
        <text x="16" y="44.5" textAnchor="middle" fontSize="3" fill="#00d4ff" fontFamily="monospace" opacity="0.7">Device</text>
        <rect x="39" y="25" width="22" height="30" rx="2" fill="transparent" stroke="#10b981" strokeWidth="1"/>
        <text x="50" y="40" textAnchor="middle" dominantBaseline="middle" fontSize="3.5" fill="#10b981" fontFamily="monospace">Edge</text>
        <text x="50" y="44" textAnchor="middle" fontSize="3" fill="#10b981" fontFamily="monospace" opacity="0.7">Gateway</text>
        <rect x="73" y="20" width="22" height="40" rx="2" fill="transparent" stroke="#7c3aed" strokeWidth="1"/>
        <text x="84" y="40" textAnchor="middle" dominantBaseline="middle" fontSize="3.5" fill="#7c3aed" fontFamily="monospace">Cloud</text>
        <text x="84" y="44" textAnchor="middle" fontSize="3" fill="#7c3aed" fontFamily="monospace" opacity="0.7">AWS/Azure</text>
        {[0,1].map(i=>(
          <circle key={i} r="1.2" fill="#00d4ff">
            <animate attributeName="cx" values="27;39" dur="1s" repeatCount="indefinite" begin={`${i*0.5}s`}/>
            <animate attributeName="cy" values="40;40" dur="1s" repeatCount="indefinite" begin={`${i*0.5}s`}/>
            <animate attributeName="opacity" values="1;0" dur="1s" repeatCount="indefinite" begin={`${i*0.5}s`}/>
          </circle>
        ))}
        {[0,1].map(i=>(
          <circle key={`c${i}`} r="1.2" fill="#10b981">
            <animate attributeName="cx" values="61;73" dur="1.4s" repeatCount="indefinite" begin={`${i*0.7}s`}/>
            <animate attributeName="cy" values="40;40" dur="1.4s" repeatCount="indefinite" begin={`${i*0.7}s`}/>
            <animate attributeName="opacity" values="1;0" dur="1.4s" repeatCount="indefinite" begin={`${i*0.7}s`}/>
          </circle>
        ))}
        <text x="33" y="56" fontSize="3" fill="rgba(0,212,255,0.5)" fontFamily="monospace">&lt;1ms</text>
        <text x="56" y="56" fontSize="3" fill="rgba(16,185,129,0.5)" fontFamily="monospace">~50ms</text>
      </svg>
    </div>
  );
}

function CloudAnim() {
  const services = ["AWS IoT","Azure IoT","GCP IoT","ThingSpeak"];
  return (
    <div className="w-full bg-muted/40 dark:bg-[#050810] border border-border rounded-xl p-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {services.map((s,i)=>(
          <div key={i} className="border rounded-lg px-3 py-2 text-xs font-mono text-center"
            style={{borderColor:"rgba(124,58,237,0.5)", color:"#7c3aed", background:"rgba(124,58,237,0.08)",
              animation:`cloudFade 0.5s ease ${i*0.15}s both`}}>
            <Cloud className="h-4 w-4 mx-auto mb-1"/>
            {s}
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-4 text-xs text-muted-foreground font-mono">
        <span className="text-cyan-400">Device Shadow</span>
        <span className="text-purple-400">Rules Engine</span>
        <span className="text-green-400">Analytics</span>
      </div>
      <style>{`@keyframes cloudFade{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

function LLMAnim() {
  const tokens = ["IoT","sensor","data","→","AI","insight","→","action"];
  return (
    <div className="w-full bg-muted/40 dark:bg-[#050810] border border-border rounded-xl p-4 overflow-hidden">
      <div className="flex flex-wrap gap-2 justify-center mb-3">
        {tokens.map((t,i)=>(
          <div key={i} className="px-2 py-1 rounded text-xs font-mono border"
            style={{borderColor:`hsl(${200+i*20},70%,50%)`, color:`hsl(${200+i*20},70%,65%)`,
              background:`hsla(${200+i*20},70%,50%,0.1)`, animation:`tokenIn 0.3s ease ${i*0.08}s both`}}>
            {t}
          </div>
        ))}
      </div>
      <div className="text-center text-xs text-muted-foreground font-mono">
        GPT-4o-mini • LLaMA • Gemini • Claude
      </div>
      <style>{`@keyframes tokenIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

function ProtocolsAnim() {
  const protocols = [
    {name:"MQTT",layer:"Application",color:"#00d4ff"},
    {name:"CoAP",layer:"Application",color:"#7c3aed"},
    {name:"HTTP",layer:"Application",color:"#10b981"},
    {name:"TCP/UDP",layer:"Transport",color:"#f59e0b"},
    {name:"IPv6",layer:"Network",color:"#ef4444"},
    {name:"WiFi/LoRa",layer:"Physical",color:"#8b5cf6"},
  ];
  return (
    <div className="w-full bg-muted/40 dark:bg-[#050810] border border-border rounded-xl p-4 space-y-1.5">
      {protocols.map((p,i)=>(
        <div key={i} className="flex items-center gap-3 rounded px-2 py-1 border border-border bg-background/50"
          style={{animation:`slideIn 0.3s ease ${i*0.08}s both`}}>
          <div className="text-xs font-mono font-bold w-16" style={{color:p.color}}>{p.name}</div>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{background:p.color, width:`${85-i*8}%`}}/>
          </div>
          <div className="text-xs text-muted-foreground w-20 text-right">{p.layer}</div>
        </div>
      ))}
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

const animationMap: Record<string, React.ReactNode> = {
  "iot-introduction": <IoTNetworkAnim />,
  "sensors-overview": <SensorAnim />,
  "microcontrollers": <MicrocontrollerAnim />,
  "nodemcu-esp32": <ESP32Anim />,
  "mqtt-protocol": <MQTTAnim />,
  "machine-learning-iot": <MLAnim />,
  "large-language-models": <LLMAnim />,
  "iot-security": <SecurityAnim />,
  "edge-computing": <EdgeAnim />,
  "cloud-iot": <CloudAnim />,
  "iot-protocols": <ProtocolsAnim />,
};

// ─── Markdown renderer ────────────────────────────────────────────────────────

function MarkdownContent({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    marked.setOptions({ breaks: true, gfm: true });
    return marked.parse(content) as string;
  }, [content]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.querySelectorAll<HTMLElement>("pre code").forEach(block => {
      hljs.highlightElement(block);
    });
  }, [html]);

  return (
    <div
      ref={ref}
      className="prose dark:prose-invert prose-lg max-w-none
        prose-headings:font-display prose-headings:text-foreground
        prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
        prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-primary/90
        prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-accent/90
        prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
        prose-p:leading-relaxed prose-p:text-foreground/90
        prose-li:text-foreground/90 prose-li:leading-relaxed
        prose-strong:text-foreground prose-strong:font-semibold
        prose-code:font-mono prose-code:text-sm
        prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
        prose-hr:border-border
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-table:border-collapse prose-td:border prose-td:border-border prose-th:border prose-th:border-border"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ConceptDetail() {
  const { slug } = useParams();
  const { data: concept, isLoading, error } = useGetConcept(slug || "", {
    query: { enabled: !!slug, queryKey: ["concept", slug] }
  });
  const { markRead, unmarkRead, isRead } = useProgress();
  const read = isRead(slug || "");

  // Auto-mark as read after 3 seconds of viewing
  useEffect(() => {
    if (!slug || !concept) return;
    const timer = setTimeout(() => markRead(slug), 3000);
    return () => clearTimeout(timer);
  }, [slug, concept, markRead]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-16 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="space-y-4">
          {Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-4 w-full"/>)}
        </div>
      </div>
    );
  }

  if (error || !concept) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Concept not found</h2>
        <Link href="/concepts" className="text-primary hover:underline">Return to Concepts</Link>
      </div>
    );
  }

  const anim = animationMap[slug || ""];

  return (
    <motion.div
      className="container mx-auto px-4 py-12 max-w-4xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link href="/concepts" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Concepts Library
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="secondary" className="capitalize">{concept.level}</Badge>
          <Badge variant="outline">{concept.category}</Badge>
          {read && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Read
            </motion.span>
          )}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">{concept.title}</h1>
        <p className="text-xl text-muted-foreground leading-relaxed mb-4">{concept.description}</p>
        {/* Manual read toggle */}
        <button
          onClick={() => read ? unmarkRead(slug || "") : markRead(slug || "")}
          className={`inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-full border transition-all ${
            read
              ? "border-green-500/30 text-green-500 bg-green-500/5 hover:bg-green-500/10"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {read ? "Mark as unread" : "Mark as read"}
        </button>
      </div>

      {/* Feature badges */}
      {(concept.hasAnimation || concept.hasSimulation || concept.hasDashboard) && (
        <div className="flex flex-wrap gap-3 mb-8 p-4 bg-card/30 border border-white/5 rounded-xl">
          {concept.hasAnimation && (
            <div className="flex items-center text-sm text-primary gap-1.5">
              <PlayCircle className="w-4 h-4" /> Interactive Animation
            </div>
          )}
          {concept.hasSimulation && (
            <div className="flex items-center text-sm text-accent gap-1.5">
              <Cpu className="w-4 h-4" /> Simulation Available
            </div>
          )}
          {concept.hasDashboard && (
            <div className="flex items-center text-sm text-chart-3 gap-1.5">
              <Activity className="w-4 h-4" /> Live Dashboard
            </div>
          )}
        </div>
      )}

      {/* Animation — always shown if we have one for this slug */}
      {anim && (
        <div className="mb-10">
          <h2 className="text-xl font-bold font-display mb-3 flex items-center gap-2 text-primary">
            <PlayCircle className="h-5 w-5"/> Interactive Visualization
          </h2>
          {anim}
        </div>
      )}

      {/* Key Takeaways */}
      {concept.keyPoints && concept.keyPoints.length > 0 && (
        <div className="mb-10 p-6 bg-primary/5 border border-primary/20 rounded-xl">
          <h2 className="text-xl font-bold font-display mb-4 text-primary">Key Takeaways</h2>
          <ul className="space-y-2">
            {concept.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-base">
                <span className="text-primary mt-1">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full Markdown Content */}
      <div className="mb-16">
        <MarkdownContent content={concept.content} />
      </div>

      {/* Flashcards for this concept */}
      {CONCEPT_CARDS[slug || ""] && (
        <div className="mb-12 p-6 rounded-2xl border border-primary/15 bg-primary/3">
          <h3 className="text-xl font-bold font-display mb-5 flex items-center gap-2">
            <span className="text-xl">⚡</span> Quick Flashcards
            <span className="text-sm font-normal text-muted-foreground ml-1">— test your recall</span>
          </h3>
          <FlashCardDeck
            cards={CONCEPT_CARDS[slug || ""]!}
            title={concept.title}
            accentColor="from-primary to-accent"
          />
        </div>
      )}

      {/* Related Concepts */}
      {concept.relatedConcepts && concept.relatedConcepts.length > 0 && (
        <div className="pt-8 border-t border-border">
          <h3 className="text-2xl font-bold font-display mb-6">Related Concepts</h3>
          <div className="flex flex-wrap gap-3">
            {concept.relatedConcepts.map((relatedSlug) => (
              <Link key={relatedSlug} href={`/concepts/${relatedSlug}`}>
                <Badge variant="secondary" className="text-base py-2 px-4 cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors capitalize">
                  {relatedSlug.replace(/-/g, ' ')}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
