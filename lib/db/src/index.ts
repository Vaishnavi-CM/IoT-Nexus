import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

function findWorkspaceRoot(): string {
  let directory = process.cwd();

  while (true) {
    if (existsSync(resolve(directory, "pnpm-workspace.yaml"))) return directory;

    const parent = dirname(directory);
    if (parent === directory) return process.cwd();
    directory = parent;
  }
}

const workspaceRoot = findWorkspaceRoot();
const configuredDatabasePath = process.env.DATABASE_PATH;
const databasePath =
  configuredDatabasePath === ":memory:"
    ? configuredDatabasePath
    : resolve(
        workspaceRoot,
        configuredDatabasePath ?? "data/all-about-iot.sqlite",
      );

if (databasePath !== ":memory:") {
  mkdirSync(dirname(databasePath), { recursive: true });
}

export const db = new DatabaseSync(databasePath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA busy_timeout = 5000;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS concepts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    key_points TEXT NOT NULL DEFAULT '[]',
    has_animation INTEGER NOT NULL DEFAULT 0,
    has_simulation INTEGER NOT NULL DEFAULT 0,
    has_dashboard INTEGER NOT NULL DEFAULT 0,
    related_concepts TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_option INTEGER NOT NULL,
    explanation TEXT NOT NULL DEFAULT '',
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    session_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx
    ON chat_messages(created_at);

  CREATE TABLE IF NOT EXISTS site_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value INTEGER NOT NULL DEFAULT 0
  );
`);

const concepts = [
  {
    slug: "introduction-to-iot",
    title: "Introduction to IoT",
    category: "Fundamentals",
    level: "beginner",
    description:
      "Learn how connected physical devices collect, exchange, and act on data.",
    content:
      "## What is IoT?\n\nThe **Internet of Things (IoT)** is a network of physical objects equipped with sensors, software, and connectivity. These devices collect data and exchange it with other systems so that people and software can monitor conditions and automate actions.\n\n## The basic data flow\n\n1. A **sensor** measures the physical world, such as temperature or motion.\n2. A **device** processes the reading and connects over a network.\n3. An **application** stores, visualizes, and analyzes the data.\n4. An **actuator** can perform an action, such as switching on a fan.\n\n## Common applications\n\nSmart homes, health wearables, precision agriculture, logistics, and industrial equipment all use IoT to improve monitoring and automation.",
    keyPoints: [
      "IoT connects physical devices to digital systems.",
      "Sensors collect data; actuators perform actions.",
      "Connectivity, processing, and applications work together.",
    ],
    hasAnimation: true,
    hasSimulation: false,
    hasDashboard: true,
    relatedConcepts: ["iot-sensors", "mqtt-protocol", "iot-architecture"],
  },
  {
    slug: "iot-sensors",
    title: "IoT Sensors",
    category: "Hardware",
    level: "beginner",
    description:
      "Explore sensors that turn temperature, motion, light, and other measurements into data.",
    content:
      "## What is a sensor?\n\nA sensor detects a physical property and converts it into a signal a computer can measure. IoT devices use sensors to observe their environment.\n\n## Common examples\n\n- **DHT22:** Measures temperature and humidity.\n- **PIR:** Detects changes in infrared radiation caused by motion.\n- **LDR:** Measures light level by changing its resistance.\n- **HC-SR04:** Estimates distance from the time taken by an ultrasonic echo to return.\n- **BMP280:** Measures air pressure and temperature.\n\n## Interfaces\n\nSensors may communicate using analog voltage or digital protocols such as I2C, SPI, UART, or 1-Wire. Check a sensor's voltage and interface before connecting it to a microcontroller.",
    keyPoints: [
      "Sensors convert physical properties into measurable signals.",
      "Check voltage, range, accuracy, and interface.",
      "I2C and SPI allow multiple sensors to share a bus.",
    ],
    hasAnimation: true,
    hasSimulation: true,
    hasDashboard: true,
    relatedConcepts: [
      "introduction-to-iot",
      "microcontrollers",
      "esp32-programming",
    ],
  },
  {
    slug: "microcontrollers",
    title: "Microcontrollers",
    category: "Hardware",
    level: "beginner",
    description:
      "Understand the small computers that read sensors and control IoT devices.",
    content:
      "## Microcontrollers\n\nA microcontroller (MCU) combines a processor, memory, and input/output peripherals on a single chip. It runs firmware that repeatedly reads inputs, processes them, and controls outputs.\n\n## Common boards\n\n- **Arduino Uno:** A beginner-friendly board for learning embedded programming.\n- **ESP32:** Adds built-in Wi-Fi and Bluetooth for connected projects.\n- **Raspberry Pi Pico:** A low-cost microcontroller board programmable with C/C++ or MicroPython.\n\n## MCU or single-board computer?\n\nMicrocontrollers start quickly and use little power. A single-board computer such as Raspberry Pi runs a full operating system and is better suited to heavier applications.",
    keyPoints: [
      "An MCU integrates a processor, memory, and peripherals.",
      "GPIO pins connect firmware to sensors and actuators.",
      "Choose a board based on connectivity, power, and workload.",
    ],
    hasAnimation: true,
    hasSimulation: false,
    hasDashboard: false,
    relatedConcepts: ["iot-sensors", "esp32-programming", "iot-connectivity"],
  },
  {
    slug: "esp32-programming",
    title: "ESP32 Programming",
    category: "Hardware",
    level: "intermediate",
    description:
      "Build connected projects using the ESP32's microcontroller, Wi-Fi, and Bluetooth.",
    content:
      "## Getting started with ESP32\n\nThe ESP32 family combines a microcontroller with wireless connectivity, making it useful for sensor nodes and smart devices. You can develop with the Arduino framework, ESP-IDF, or MicroPython.\n\n## Typical workflow\n\n1. Configure GPIO pins for the sensor or actuator.\n2. Read and validate sensor measurements.\n3. Connect to a Wi-Fi network when required.\n4. Send data using HTTP or MQTT.\n5. Handle connection failures and avoid exposing credentials in firmware.\n\nUse the exact pinout and voltage limits of your board; not every GPIO supports every peripheral.",
    keyPoints: [
      "ESP32 boards include Wi-Fi and Bluetooth.",
      "Firmware can use Arduino, ESP-IDF, or MicroPython.",
      "Handle connectivity failures and keep secrets out of source code.",
    ],
    hasAnimation: false,
    hasSimulation: true,
    hasDashboard: true,
    relatedConcepts: ["microcontrollers", "iot-sensors", "mqtt-protocol"],
  },
  {
    slug: "mqtt-protocol",
    title: "MQTT Protocol",
    category: "Protocols",
    level: "intermediate",
    description:
      "Learn the lightweight publish-subscribe protocol widely used for IoT messaging.",
    content:
      "## MQTT\n\nMQTT is a lightweight messaging protocol designed for devices and networks with limited bandwidth. Clients connect to a **broker** and publish messages to named **topics**. Other clients subscribe to those topics to receive messages.\n\n## Quality of Service\n\n- **QoS 0:** At most once; no delivery acknowledgement.\n- **QoS 1:** At least once; a message can be delivered more than once.\n- **QoS 2:** Exactly once; the most reliable and highest-overhead delivery level.\n\nUse authentication and TLS in production, and design topic permissions so that devices can only access the data they need.",
    keyPoints: [
      "MQTT uses publishers, subscribers, topics, and a broker.",
      "QoS 0, 1, and 2 trade delivery guarantees for overhead.",
      "Use authentication, TLS, and least-privilege topic permissions.",
    ],
    hasAnimation: true,
    hasSimulation: true,
    hasDashboard: false,
    relatedConcepts: [
      "iot-connectivity",
      "introduction-to-iot",
      "iot-security",
    ],
  },
  {
    slug: "iot-connectivity",
    title: "IoT Connectivity",
    category: "Protocols",
    level: "intermediate",
    description:
      "Compare Wi-Fi, Bluetooth LE, Zigbee, cellular, and long-range IoT networks.",
    content:
      "## Choosing a connectivity technology\n\nIoT devices use different networks depending on range, data rate, energy budget, coverage, and cost.\n\n- **Wi-Fi:** High data rate and common infrastructure; relatively power hungry.\n- **Bluetooth Low Energy:** Short-range communication with low power consumption.\n- **Zigbee and Thread:** Low-power mesh networking for nearby devices.\n- **LoRaWAN:** Long range and low data rates for battery-powered sensors.\n- **Cellular:** Wide-area coverage with a subscription and modem power costs.\n\nChoose a technology based on measured project requirements rather than range alone.",
    keyPoints: [
      "No one wireless technology fits every IoT project.",
      "Range, throughput, power, coverage, and cost are key trade-offs.",
      "Match the network to the device and application requirements.",
    ],
    hasAnimation: true,
    hasSimulation: false,
    hasDashboard: true,
    relatedConcepts: ["mqtt-protocol", "microcontrollers", "iot-security"],
  },
  {
    slug: "iot-security",
    title: "IoT Security",
    category: "Security",
    level: "advanced",
    description:
      "Protect connected devices, communications, credentials, and update processes.",
    content:
      "## Securing an IoT system\n\nIoT security protects devices and the data exchanged between devices, gateways, and services. Plan security throughout the device lifecycle, from manufacturing and provisioning through updates and retirement.\n\n## Core practices\n\n- Replace default passwords and assign unique device identities.\n- Encrypt network traffic with current TLS configurations.\n- Store credentials securely and rotate them when needed.\n- Apply signed firmware updates and maintain an update process.\n- Limit network access, disable unused services, and monitor device behavior.\n\nSecurity is a system property: device firmware, networks, APIs, and cloud access all need appropriate protections.",
    keyPoints: [
      "Give each device a unique identity and strong credentials.",
      "Encrypt communications and validate firmware updates.",
      "Limit access and plan for patching throughout device life.",
    ],
    hasAnimation: false,
    hasSimulation: false,
    hasDashboard: true,
    relatedConcepts: [
      "iot-connectivity",
      "mqtt-protocol",
      "iot-cloud-platforms",
    ],
  },
  {
    slug: "edge-computing",
    title: "Edge Computing",
    category: "Architecture",
    level: "advanced",
    description:
      "Process IoT data near the devices to reduce latency and network use.",
    content:
      "## Edge computing\n\nEdge computing processes data on a device or nearby gateway instead of sending every reading to a remote cloud. Local processing can support faster responses, reduce bandwidth, and keep some data on site.\n\n## Common architecture\n\nA sensor sends measurements to a nearby gateway. The gateway filters readings, detects events, and sends useful summaries to a cloud service for long-term storage and fleet-wide analysis.\n\nEdge deployments still need secure updates, observability, and a plan for intermittent connectivity.",
    keyPoints: [
      "Edge computing moves processing near data sources.",
      "It can reduce latency, bandwidth, and unnecessary data transfer.",
      "Edge devices still need secure operations and updates.",
    ],
    hasAnimation: true,
    hasSimulation: true,
    hasDashboard: true,
    relatedConcepts: [
      "iot-cloud-platforms",
      "iot-architecture",
      "iot-security",
    ],
  },
  {
    slug: "iot-cloud-platforms",
    title: "IoT Cloud Platforms",
    category: "Cloud",
    level: "intermediate",
    description:
      "See how cloud services ingest, store, analyze, and visualize device data.",
    content:
      "## Cloud services for IoT\n\nIoT cloud platforms provide device registration, message ingestion, storage, rules, analytics, and dashboards. They make it possible to operate fleets of devices without building every service from scratch.\n\n## Design considerations\n\nDefine device identity and access controls, message schemas, retention periods, monitoring, and cost limits before sending production data. A cloud platform complements device and edge processing rather than replacing their security requirements.",
    keyPoints: [
      "Cloud platforms manage device data and fleet services.",
      "Plan access controls, data retention, and operational monitoring.",
      "Evaluate cost, portability, and service availability.",
    ],
    hasAnimation: false,
    hasSimulation: false,
    hasDashboard: true,
    relatedConcepts: ["edge-computing", "iot-security", "iot-architecture"],
  },
  {
    slug: "iot-architecture",
    title: "IoT Architecture",
    category: "Architecture",
    level: "beginner",
    description:
      "Connect devices, gateways, networks, and applications in a reliable IoT system.",
    content:
      "## IoT system architecture\n\nAn IoT application typically includes devices, connectivity, processing, and an application layer. Gateways can translate protocols and perform local processing, while cloud services provide shared storage and fleet operations.\n\n## Design for reliability\n\nSpecify message formats and device identities, handle retries and duplicate delivery, and monitor each system boundary. Separate responsibilities so an individual service failure does not silently corrupt device data.",
    keyPoints: [
      "IoT architectures connect devices, networks, processing, and applications.",
      "Gateways can translate protocols and filter data.",
      "Define message formats and failure handling at each boundary.",
    ],
    hasAnimation: true,
    hasSimulation: true,
    hasDashboard: true,
    relatedConcepts: [
      "introduction-to-iot",
      "edge-computing",
      "iot-cloud-platforms",
    ],
  },
];

const insertConcept = db.prepare(`
  INSERT OR IGNORE INTO concepts (
    slug, title, category, level, description, content, key_points,
    has_animation, has_simulation, has_dashboard, related_concepts
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const concept of concepts) {
  insertConcept.run(
    concept.slug,
    concept.title,
    concept.category,
    concept.level,
    concept.description,
    concept.content,
    JSON.stringify(concept.keyPoints),
    Number(concept.hasAnimation),
    Number(concept.hasSimulation),
    Number(concept.hasDashboard),
    JSON.stringify(concept.relatedConcepts),
  );
}

const questions = [
  {
    question: "What does IoT stand for?",
    options: [
      "Internet of Things",
      "Integration of Technology",
      "Interface of Terminals",
      "Internet of Tools",
    ],
    correctOption: 0,
    explanation:
      "IoT stands for the Internet of Things: connected physical devices that collect and exchange data.",
    topic: "Fundamentals",
    difficulty: "beginner",
  },
  {
    question:
      "Which component detects a physical measurement such as temperature?",
    options: ["Actuator", "Sensor", "Broker", "Gateway"],
    correctOption: 1,
    explanation:
      "A sensor measures a physical property and produces a signal that a device can process.",
    topic: "Hardware",
    difficulty: "beginner",
  },
  {
    question: "Which sensor commonly measures both temperature and humidity?",
    options: ["PIR", "LDR", "DHT22", "HC-SR04"],
    correctOption: 2,
    explanation: "The DHT22 measures temperature and relative humidity.",
    topic: "Hardware",
    difficulty: "beginner",
  },
  {
    question: "What is the main role of an MQTT broker?",
    options: [
      "Measure temperature",
      "Route published messages to subscribers",
      "Compile firmware",
      "Assign GPIO pins",
    ],
    correctOption: 1,
    explanation:
      "The broker receives publications and forwards them to clients subscribed to matching topics.",
    topic: "Protocols",
    difficulty: "intermediate",
  },
  {
    question: "Which MQTT QoS level provides at-most-once delivery?",
    options: ["QoS 0", "QoS 1", "QoS 2", "QoS 3"],
    correctOption: 0,
    explanation:
      "QoS 0 sends once without an acknowledgement, so a message may be lost.",
    topic: "Protocols",
    difficulty: "intermediate",
  },
  {
    question:
      "Which technology is built into common ESP32 boards for wireless networking?",
    options: ["Wi-Fi", "LoRaWAN", "Satellite", "Ethernet fiber"],
    correctOption: 0,
    explanation:
      "Common ESP32 variants include Wi-Fi; Bluetooth support is available on many variants too.",
    topic: "Hardware",
    difficulty: "beginner",
  },
  {
    question: "What is a key advantage of edge computing?",
    options: [
      "It removes the need for sensors",
      "It can process data closer to where it is generated",
      "It guarantees internet access",
      "It encrypts all data automatically",
    ],
    correctOption: 1,
    explanation:
      "Processing data near its source can reduce response latency and unnecessary network traffic.",
    topic: "Architecture",
    difficulty: "intermediate",
  },
  {
    question: "Which practice helps protect data transmitted by IoT devices?",
    options: [
      "Use default passwords",
      "Disable all firmware updates",
      "Use TLS and device authentication",
      "Share one credential across the fleet",
    ],
    correctOption: 2,
    explanation:
      "TLS protects data in transit, while device authentication establishes which devices are connecting.",
    topic: "Security",
    difficulty: "advanced",
  },
  {
    question: "Which interface commonly uses the SDA and SCL signal lines?",
    options: ["UART", "I2C", "SPI", "PWM"],
    correctOption: 1,
    explanation:
      "I2C uses a serial data line (SDA) and a serial clock line (SCL).",
    topic: "Hardware",
    difficulty: "intermediate",
  },
  {
    question: "What does a PIR sensor detect?",
    options: [
      "Changes in infrared radiation",
      "Air pressure",
      "Magnetic field direction",
      "Network packet loss",
    ],
    correctOption: 0,
    explanation:
      "A passive infrared sensor detects changes in infrared radiation, often to sense movement.",
    topic: "Hardware",
    difficulty: "beginner",
  },
];

const insertQuestion = db.prepare(`
  INSERT INTO quiz_questions (
    question, options, correct_option, explanation, topic, difficulty
  )
  SELECT ?, ?, ?, ?, ?, ?
  WHERE NOT EXISTS (
    SELECT 1 FROM quiz_questions WHERE question = ?
  )
`);

for (const question of questions) {
  insertQuestion.run(
    question.question,
    JSON.stringify(question.options),
    question.correctOption,
    question.explanation,
    question.topic,
    question.difficulty,
    question.question,
  );
}

db.prepare(
  `
  INSERT OR IGNORE INTO site_stats (key, value)
  VALUES ('questions_answered', 0)
`,
).run();
