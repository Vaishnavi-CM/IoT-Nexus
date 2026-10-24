import type { FlashCardData } from "@/components/ui/flash-card";

export interface CSEDeck {
  id: string;
  title: string;
  icon: string;
  color: string;
  accent: string;
  tagline: string;
  cards: FlashCardData[];
}

// ─── CS Fundamentals ──────────────────────────────────────────────────────────
const csFundamentals: FlashCardData[] = [
  { q: "What is a bit?", a: "The smallest unit of data in computing — either a 0 or a 1. Represents a binary digit.", tag: "Binary" },
  { q: "What is a byte?", a: "8 bits grouped together. Can represent 256 values (0–255). Used as the basic addressable unit of memory.", tag: "Memory" },
  { q: "What does CPU stand for and what does it do?", a: "Central Processing Unit — the brain of a computer that executes program instructions (fetch, decode, execute cycle).", tag: "Hardware" },
  { q: "What is RAM?", a: "Random Access Memory — fast, volatile memory used to store data and programs currently in use. Lost when power is off.", tag: "Memory" },
  { q: "What is the difference between RAM and ROM?", a: "RAM is volatile (loses data without power, read-write). ROM is non-volatile (retains data, typically read-only, used for firmware).", tag: "Memory" },
  { q: "What is an Operating System?", a: "Software that manages hardware resources and provides services for programs. Examples: Windows, Linux, macOS, Android.", tag: "OS" },
  { q: "What is binary? Give an example.", a: "Base-2 number system using only 0 and 1. Example: decimal 10 = binary 1010 (8+2).", tag: "Binary" },
  { q: "What is ASCII?", a: "American Standard Code for Information Interchange — assigns numbers 0–127 to characters. 'A'=65, 'a'=97, '0'=48.", tag: "Encoding" },
  { q: "What is the ALU?", a: "Arithmetic Logic Unit — part of the CPU that performs arithmetic (add, subtract) and logical (AND, OR, NOT) operations.", tag: "Hardware" },
  { q: "What is a compiler?", a: "A program that translates source code written in a high-level language (C, C++) into machine code all at once before execution.", tag: "Languages" },
  { q: "What is an interpreter?", a: "A program that executes source code line-by-line at runtime without pre-compiling. Python and JavaScript use interpreters.", tag: "Languages" },
  { q: "What is the fetch-decode-execute cycle?", a: "The basic CPU operation: Fetch instruction from memory → Decode it → Execute it. Repeated billions of times per second.", tag: "Hardware" },
  { q: "What is clock speed in a CPU?", a: "The number of cycles a CPU can perform per second, measured in GHz. A 3 GHz CPU executes ~3 billion cycles per second.", tag: "Hardware" },
  { q: "What is a logic gate?", a: "A basic electronic circuit that performs a Boolean operation (AND, OR, NOT, NAND, NOR, XOR) on binary inputs.", tag: "Digital Logic" },
  { q: "What is hexadecimal?", a: "Base-16 number system using digits 0–9 and A–F. Used in programming for memory addresses and colour codes. FF = 255 in decimal.", tag: "Binary" },
  { q: "What is cache memory?", a: "Ultra-fast memory built into or near the CPU (L1, L2, L3). Stores frequently used data to reduce access time.", tag: "Memory" },
  { q: "What is a process vs a thread?", a: "A process is an independent program execution with its own memory. A thread is a lightweight unit within a process sharing its memory.", tag: "OS" },
  { q: "What is an interrupt?", a: "A signal to the CPU that an event needs immediate attention, causing it to pause the current task and run an interrupt handler.", tag: "OS" },
];

// ─── Data Structures ─────────────────────────────────────────────────────────
const dataStructures: FlashCardData[] = [
  { q: "What is a stack? What are its operations?", a: "LIFO (Last-In-First-Out) structure. Operations: push (add), pop (remove top), peek (view top). Used in function calls, undo.", tag: "Stack" },
  { q: "What is a queue? What are its operations?", a: "FIFO (First-In-First-Out) structure. Operations: enqueue (add rear), dequeue (remove front). Used in scheduling, BFS.", tag: "Queue" },
  { q: "What is an array?", a: "A fixed-size collection of elements stored in contiguous memory, accessed by index in O(1) time.", tag: "Array" },
  { q: "What is a linked list?", a: "A linear structure where each node contains data and a pointer to the next node. Dynamic size, O(n) access, O(1) insert at head.", tag: "Linked List" },
  { q: "What is a binary tree?", a: "A tree where each node has at most two children (left and right). Foundation for BSTs, heaps, expression trees.", tag: "Tree" },
  { q: "What is a Binary Search Tree (BST)?", a: "A binary tree where left child < parent < right child. Enables O(log n) search, insert, delete on average.", tag: "Tree" },
  { q: "What is a hash table?", a: "A data structure that maps keys to values using a hash function for O(1) average-case lookup, insert, and delete.", tag: "Hash" },
  { q: "What is a hash collision?", a: "When two keys hash to the same index. Resolved by chaining (linked list at each slot) or open addressing (probing).", tag: "Hash" },
  { q: "What is a graph?", a: "A collection of nodes (vertices) connected by edges. Can be directed/undirected, weighted/unweighted. Models networks, maps, social connections.", tag: "Graph" },
  { q: "What is BFS vs DFS?", a: "BFS (Breadth-First Search): explores level by level using a queue. DFS (Depth-First Search): explores as deep as possible using a stack/recursion.", tag: "Graph" },
  { q: "What is a heap?", a: "A complete binary tree where each parent is greater (max-heap) or smaller (min-heap) than its children. Used in priority queues.", tag: "Heap" },
  { q: "What is Big O notation?", a: "A way to describe algorithm efficiency in terms of input size n. O(1) constant, O(log n) logarithmic, O(n) linear, O(n²) quadratic.", tag: "Complexity" },
  { q: "What is the time complexity of binary search?", a: "O(log n) — it halves the search space each step. Requires the array to be sorted.", tag: "Algorithms" },
  { q: "What is a trie?", a: "A tree-like structure for storing strings where each path from root to leaf spells a word. Used in autocomplete, dictionaries.", tag: "Tree" },
  { q: "What is a deque?", a: "Double-Ended Queue — allows insert and delete at both front and rear. More flexible than a queue.", tag: "Queue" },
  { q: "What is dynamic programming?", a: "Optimisation technique that solves problems by breaking them into overlapping subproblems and caching results (memoisation/tabulation).", tag: "Algorithms" },
];

// ─── Algorithms ───────────────────────────────────────────────────────────────
const algorithms: FlashCardData[] = [
  { q: "What is bubble sort and its time complexity?", a: "Repeatedly swaps adjacent elements if out of order. O(n²) worst case, O(n) best case (already sorted). Simple but slow.", tag: "Sorting" },
  { q: "What is merge sort?", a: "Divide-and-conquer: split array in half recursively, sort, then merge. Time O(n log n) always. Space O(n). Stable sort.", tag: "Sorting" },
  { q: "What is quick sort?", a: "Picks a pivot, partitions array so left < pivot < right, recursively sorts. Average O(n log n), worst O(n²) with bad pivot.", tag: "Sorting" },
  { q: "What is Dijkstra's algorithm?", a: "Finds shortest path from a source node to all others in a weighted graph (non-negative weights). Time O((V+E) log V) with a min-heap.", tag: "Graph" },
  { q: "What is recursion?", a: "A function calling itself with a smaller input until reaching a base case. Stack-based; every recursive call adds a stack frame.", tag: "Recursion" },
  { q: "What is the difference between greedy and dynamic programming?", a: "Greedy makes the locally optimal choice at each step (no backtracking). DP explores all subproblems and caches results for global optimum.", tag: "Paradigms" },
  { q: "What is a spanning tree?", a: "A subgraph of a connected graph that includes all vertices with minimum edges (no cycles). Minimum Spanning Tree (MST) has minimum total weight.", tag: "Graph" },
  { q: "What is Kruskal's algorithm?", a: "Finds MST by sorting edges by weight and adding them if they don't form a cycle. Uses Union-Find. O(E log E).", tag: "Graph" },
  { q: "What is memoisation?", a: "Caching the results of expensive function calls so the same input doesn't get recomputed. Top-down DP approach.", tag: "DP" },
  { q: "What is the knapsack problem?", a: "Given items with weights/values and a capacity, maximise value without exceeding capacity. Classic DP problem. O(nW) time.", tag: "DP" },
  { q: "What is a P vs NP problem?", a: "P: problems solvable in polynomial time. NP: solutions verifiable in polynomial time. Whether P=NP is the biggest unsolved problem in CS.", tag: "Theory" },
  { q: "What is a topological sort?", a: "Linear ordering of vertices in a DAG such that for every edge u→v, u comes before v. Used in build systems, dependency resolution.", tag: "Graph" },
];

// ─── Computer Networks ────────────────────────────────────────────────────────
const networks: FlashCardData[] = [
  { q: "What are the 7 layers of the OSI model?", a: "Physical, Data Link, Network, Transport, Session, Presentation, Application. Mnemonic: 'Please Do Not Throw Sausage Pizza Away'.", tag: "OSI" },
  { q: "What is the difference between TCP and UDP?", a: "TCP: reliable, ordered, connection-oriented, error-checked (slower). UDP: fast, connectionless, no guarantee of delivery. Use UDP for streaming/gaming.", tag: "Transport" },
  { q: "What is an IP address?", a: "A unique numerical label for a device on a network. IPv4: 32-bit (e.g. 192.168.1.1). IPv6: 128-bit for more addresses.", tag: "IP" },
  { q: "What is DNS?", a: "Domain Name System — translates human-readable domain names (google.com) into IP addresses. The internet's phone book.", tag: "DNS" },
  { q: "What is HTTP vs HTTPS?", a: "HTTP: HyperText Transfer Protocol — sends data as plain text. HTTPS: HTTP + TLS encryption. HTTPS is secure (port 443 vs 80).", tag: "HTTP" },
  { q: "What is a subnet mask?", a: "A 32-bit number that divides an IP address into network and host portions. 255.255.255.0 means the first 3 octets identify the network.", tag: "IP" },
  { q: "What is NAT?", a: "Network Address Translation — maps private IP addresses to a public IP. Allows multiple devices to share one public IP.", tag: "IP" },
  { q: "What is a MAC address?", a: "Media Access Control address — a hardware ID assigned to a network interface card (NIC). 48-bit, written as XX:XX:XX:XX:XX:XX.", tag: "Data Link" },
  { q: "What is a router vs a switch?", a: "Router: connects different networks, routes packets between them (Layer 3). Switch: connects devices within the same network (Layer 2, uses MAC).", tag: "Hardware" },
  { q: "What is a firewall?", a: "A network security system that monitors and controls incoming/outgoing traffic based on predefined security rules.", tag: "Security" },
  { q: "What is the TCP 3-way handshake?", a: "SYN → SYN-ACK → ACK. Client sends SYN, server responds SYN-ACK, client sends ACK. Establishes a TCP connection.", tag: "TCP" },
  { q: "What is DHCP?", a: "Dynamic Host Configuration Protocol — automatically assigns IP addresses, subnet masks, gateways to devices on a network.", tag: "Protocol" },
  { q: "What is a VPN?", a: "Virtual Private Network — creates an encrypted tunnel over a public network, making it appear as if you're on a private network.", tag: "Security" },
  { q: "What is latency vs bandwidth?", a: "Latency: time delay for data to travel (ms). Bandwidth: maximum data rate (Mbps). High bandwidth with high latency still feels slow.", tag: "Performance" },
  { q: "What is WebSocket?", a: "A protocol providing full-duplex communication over a single TCP connection. Enables real-time data push from server to client.", tag: "Protocol" },
];

// ─── Databases ────────────────────────────────────────────────────────────────
const databases: FlashCardData[] = [
  { q: "What is a relational database?", a: "A database that organises data into tables with rows and columns. Tables are related via foreign keys. Uses SQL. Examples: MySQL, PostgreSQL.", tag: "SQL" },
  { q: "What does ACID stand for?", a: "Atomicity (all or nothing), Consistency (valid state always), Isolation (concurrent transactions don't interfere), Durability (committed data persists).", tag: "ACID" },
  { q: "What is a primary key?", a: "A column (or set of columns) that uniquely identifies each row in a table. Cannot be NULL or duplicate.", tag: "SQL" },
  { q: "What is a foreign key?", a: "A column that references the primary key of another table, establishing a relationship between them.", tag: "SQL" },
  { q: "What is SQL JOIN? Name the types.", a: "Combines rows from two tables. Types: INNER JOIN (matching rows), LEFT JOIN (all left + matching right), RIGHT JOIN, FULL OUTER JOIN.", tag: "SQL" },
  { q: "What is database indexing?", a: "A data structure (B-tree, hash) that speeds up data retrieval at the cost of extra storage and slower writes.", tag: "Optimisation" },
  { q: "What is normalisation?", a: "Organising a database to reduce data redundancy and improve integrity. Forms: 1NF, 2NF, 3NF, BCNF.", tag: "Design" },
  { q: "What is a NoSQL database?", a: "A non-relational database designed for large-scale, flexible data. Types: document (MongoDB), key-value (Redis), column (Cassandra), graph (Neo4j).", tag: "NoSQL" },
  { q: "What is a transaction?", a: "A sequence of database operations treated as a single unit. Either all succeed (commit) or all fail (rollback).", tag: "ACID" },
  { q: "What is the difference between SQL and NoSQL?", a: "SQL: structured, schema-based, ACID, vertical scaling. NoSQL: flexible schema, horizontal scaling, eventual consistency, better for big data.", tag: "Comparison" },
  { q: "What is sharding?", a: "Splitting a database into smaller partitions (shards) across multiple servers to enable horizontal scaling.", tag: "Scalability" },
  { q: "What is an ORM?", a: "Object-Relational Mapping — lets developers interact with a database using their programming language's objects instead of raw SQL. e.g., Drizzle, Hibernate.", tag: "Tools" },
];

// ─── AI & Machine Learning ────────────────────────────────────────────────────
const aiml: FlashCardData[] = [
  { q: "What is Machine Learning?", a: "A subset of AI where systems learn patterns from data without being explicitly programmed. The model improves with more data.", tag: "ML" },
  { q: "What is supervised vs unsupervised learning?", a: "Supervised: trained on labelled data (input→output pairs). Unsupervised: finds hidden patterns in unlabelled data (clustering, dimensionality reduction).", tag: "ML" },
  { q: "What is a neural network?", a: "A model inspired by the brain: layers of interconnected nodes (neurons). Input layer → hidden layers → output layer. Learns via backpropagation.", tag: "Deep Learning" },
  { q: "What is deep learning?", a: "ML using neural networks with many hidden layers (deep networks). Excels at images, audio, text. Needs lots of data and compute.", tag: "Deep Learning" },
  { q: "What is gradient descent?", a: "An optimisation algorithm that minimises a loss function by iteratively moving in the direction of the steepest descent of the gradient.", tag: "Optimisation" },
  { q: "What is overfitting?", a: "When a model learns the training data too well, including noise, and performs poorly on new data. Fixed by regularisation, dropout, more data.", tag: "ML" },
  { q: "What is a confusion matrix?", a: "A table showing True Positives, True Negatives, False Positives, False Negatives to evaluate classification model performance.", tag: "Evaluation" },
  { q: "What is a transformer model?", a: "A neural network architecture using self-attention to process sequences in parallel. Foundation of GPT, BERT, and all modern LLMs.", tag: "NLP" },
  { q: "What is reinforcement learning?", a: "An agent learns by taking actions in an environment to maximise cumulative reward. Used in game-playing AI, robotics, self-driving cars.", tag: "RL" },
  { q: "What is NLP?", a: "Natural Language Processing — AI techniques for understanding, generating, and processing human language. Used in chatbots, translation, sentiment analysis.", tag: "NLP" },
  { q: "What is a CNN?", a: "Convolutional Neural Network — uses filters to detect spatial patterns in images. Dominant for image classification, object detection.", tag: "Deep Learning" },
  { q: "What is an RNN?", a: "Recurrent Neural Network — processes sequential data with a hidden state. Used for time series, speech. Replaced by transformers for most tasks.", tag: "Deep Learning" },
  { q: "What is transfer learning?", a: "Using a pre-trained model (trained on a large dataset) and fine-tuning it for a specific task. Saves time and data.", tag: "ML" },
  { q: "What is a Large Language Model (LLM)?", a: "A transformer-based model trained on massive text data to understand and generate human language. Examples: GPT-4, Gemini, Claude, LLaMA.", tag: "LLM" },
  { q: "What is feature engineering?", a: "The process of selecting, transforming, and creating input variables (features) to improve a machine learning model's performance.", tag: "ML" },
  { q: "What is k-means clustering?", a: "An unsupervised algorithm that groups data into k clusters by minimising the distance of each point to its cluster centre (centroid).", tag: "Unsupervised" },
];

// ─── IoT & Embedded Systems ───────────────────────────────────────────────────
const iotEmbedded: FlashCardData[] = [
  { q: "What is Zigbee?", a: "A low-power, low-data-rate wireless protocol (IEEE 802.15.4) for mesh networking. Used in smart home devices. Range ~100m. Uses 2.4 GHz.", tag: "Zigbee" },
  { q: "What is Z-Wave?", a: "A wireless protocol for smart home automation using 868–908 MHz (sub-GHz). Less interference than Zigbee. Mesh network, ~30m range per node.", tag: "Z-Wave" },
  { q: "What is Arduino?", a: "An open-source microcontroller platform (AVR-based). Popular for prototyping. Programmed in C/C++ via Arduino IDE. 5V logic, 14 digital I/O pins (Uno).", tag: "Arduino" },
  { q: "What is the difference between Arduino and ESP32?", a: "Arduino Uno: simple AVR MCU, no WiFi/BT, 32KB flash. ESP32: dual-core 240MHz, built-in WiFi+Bluetooth, 4MB flash, much more powerful.", tag: "Hardware" },
  { q: "What is I2C?", a: "Inter-Integrated Circuit — a 2-wire serial protocol (SDA + SCL). Allows multiple devices on one bus with unique addresses. Short-range, low speed.", tag: "Protocol" },
  { q: "What is SPI?", a: "Serial Peripheral Interface — a 4-wire synchronous protocol (MOSI, MISO, SCK, CS). Faster than I2C, full-duplex. For displays, SD cards.", tag: "Protocol" },
  { q: "What is UART?", a: "Universal Asynchronous Receiver-Transmitter — a 2-wire async serial protocol (TX, RX). Used for serial monitor debugging and GPS modules.", tag: "Protocol" },
  { q: "What is PWM?", a: "Pulse Width Modulation — rapidly switching a digital pin ON/OFF to simulate analogue output. Controls motor speed, LED brightness. Duty cycle 0–100%.", tag: "Electronics" },
  { q: "What is LoRa?", a: "Long Range — a spread-spectrum wireless modulation for LPWAN. Very long range (15km+), very low power, very low data rate. For agriculture, tracking.", tag: "LoRa" },
  { q: "What is MQTT?", a: "Message Queuing Telemetry Transport — a lightweight pub/sub protocol over TCP. Uses topics, brokers. Ideal for IoT with low bandwidth.", tag: "MQTT" },
  { q: "What is a DHT22 sensor?", a: "A digital temperature and humidity sensor. Range: -40 to +80°C, 0–100% RH. Communicates via single-wire protocol. More accurate than DHT11.", tag: "Sensors" },
  { q: "What is edge computing in IoT?", a: "Processing data near the source (on the device or local gateway) rather than in the cloud. Reduces latency, bandwidth, and privacy concerns.", tag: "Edge" },
  { q: "What is a microcontroller vs microprocessor?", a: "MCU: CPU + RAM + Flash + I/O all on one chip. No OS needed. MPU: just the CPU, needs external RAM, ROM, peripherals. MCUs are for embedded.", tag: "Hardware" },
  { q: "What is FreeRTOS?", a: "A real-time operating system for microcontrollers. Provides task scheduling, inter-task communication (queues, semaphores). Used on ESP32, Arduino.", tag: "RTOS" },
  { q: "What is a PIR sensor?", a: "Passive Infrared sensor — detects motion by measuring infrared radiation from warm bodies. Used in alarm systems, auto-lights.", tag: "Sensors" },
  { q: "What is Matter (smart home protocol)?", a: "An IP-based open standard for smart home interoperability, supported by Apple, Google, Amazon. Runs over WiFi, Thread, or Ethernet.", tag: "Protocol" },
];

// ─── Cybersecurity ────────────────────────────────────────────────────────────
const security: FlashCardData[] = [
  { q: "What is symmetric vs asymmetric encryption?", a: "Symmetric: same key to encrypt and decrypt (AES, fast). Asymmetric: public key encrypts, private key decrypts (RSA, slower, used in HTTPS).", tag: "Crypto" },
  { q: "What is a SQL injection attack?", a: "Inserting malicious SQL code into user input to manipulate database queries. Prevention: parameterised queries, ORMs, input validation.", tag: "Attack" },
  { q: "What is XSS?", a: "Cross-Site Scripting — injecting malicious scripts into web pages viewed by other users. Prevention: output encoding, Content-Security-Policy headers.", tag: "Attack" },
  { q: "What is a DDoS attack?", a: "Distributed Denial of Service — overwhelming a server with traffic from many sources (botnets) to make it unavailable.", tag: "Attack" },
  { q: "What is TLS/SSL?", a: "Transport Layer Security (successor to SSL) — cryptographic protocol that encrypts data in transit. Used in HTTPS. Provides authentication, integrity, confidentiality.", tag: "Crypto" },
  { q: "What is a man-in-the-middle (MITM) attack?", a: "An attacker secretly intercepts and possibly alters communications between two parties who believe they're communicating directly.", tag: "Attack" },
  { q: "What is hashing?", a: "A one-way function converting data to a fixed-size digest (SHA-256, bcrypt). Used for password storage — cannot be reversed, only compared.", tag: "Crypto" },
  { q: "What is phishing?", a: "Social engineering attack where attackers impersonate trusted entities via email/SMS to steal credentials or install malware.", tag: "Attack" },
  { q: "What is the principle of least privilege?", a: "Give users/processes only the minimum access required for their task. Limits damage if credentials are compromised.", tag: "Defence" },
  { q: "What is two-factor authentication (2FA)?", a: "Security requiring two verification methods: something you know (password) + something you have (OTP) or are (fingerprint).", tag: "Auth" },
  { q: "What is a zero-day vulnerability?", a: "A software security flaw unknown to the vendor, with no patch available. Extremely dangerous as attackers can exploit it before it's fixed.", tag: "Vulnerabilities" },
  { q: "What is a buffer overflow attack?", a: "Writing data beyond a buffer's boundary to overwrite adjacent memory, potentially allowing arbitrary code execution.", tag: "Attack" },
];

// ─── Web & Cloud ──────────────────────────────────────────────────────────────
const webCloud: FlashCardData[] = [
  { q: "What is REST?", a: "Representational State Transfer — an architectural style for APIs using HTTP methods (GET, POST, PUT, DELETE) and stateless communication.", tag: "API" },
  { q: "What is GraphQL?", a: "A query language for APIs where clients specify exactly what data they need. Single endpoint, reduces over/under-fetching vs REST.", tag: "API" },
  { q: "What is a CDN?", a: "Content Delivery Network — a distributed network of servers that delivers static content from the server nearest to the user, reducing latency.", tag: "Performance" },
  { q: "What is Docker?", a: "A platform for packaging applications into containers — lightweight, portable, isolated environments that run consistently anywhere.", tag: "DevOps" },
  { q: "What is Kubernetes?", a: "An open-source container orchestration system that automates deployment, scaling, and management of containerised applications.", tag: "DevOps" },
  { q: "What is serverless computing?", a: "A cloud model where the provider manages servers. Functions run on demand (AWS Lambda, Cloudflare Workers). Pay per execution, not per server.", tag: "Cloud" },
  { q: "What is CI/CD?", a: "Continuous Integration / Continuous Delivery — automated pipelines that build, test, and deploy code changes rapidly and reliably.", tag: "DevOps" },
  { q: "What is the DOM?", a: "Document Object Model — a tree representation of an HTML page that JavaScript can manipulate to dynamically update content.", tag: "Web" },
  { q: "What is React?", a: "A JavaScript library for building UIs using reusable components with a virtual DOM. Declarative, component-based, maintained by Meta.", tag: "Web" },
  { q: "What is a microservices architecture?", a: "Designing an application as a collection of small, independently deployable services that communicate via APIs. Opposite of monolith.", tag: "Architecture" },
  { q: "What is OAuth?", a: "Open Authorization — a protocol allowing third-party apps to access user data without passwords. 'Sign in with Google/GitHub' uses OAuth 2.0.", tag: "Auth" },
  { q: "What is CORS?", a: "Cross-Origin Resource Sharing — a browser security mechanism that restricts web pages from making requests to a different domain than the one that served the page.", tag: "Web" },
  { q: "What is WebAssembly (WASM)?", a: "A binary instruction format that runs in browsers at near-native speed. Lets C, C++, Rust code run in the web alongside JavaScript.", tag: "Web" },
  { q: "What is load balancing?", a: "Distributing incoming network traffic across multiple servers to ensure no single server is overwhelmed. Improves availability and scalability.", tag: "Architecture" },
];

// ─── Programming Concepts ─────────────────────────────────────────────────────
const programming: FlashCardData[] = [
  { q: "What are the 4 pillars of OOP?", a: "Encapsulation (bundling data + methods), Inheritance (extending classes), Polymorphism (same interface, different behaviour), Abstraction (hiding complexity).", tag: "OOP" },
  { q: "What is a pointer?", a: "A variable that stores the memory address of another variable. Used in C/C++ for direct memory access. Dereferenced with *.", tag: "C/C++" },
  { q: "What is the difference between pass-by-value and pass-by-reference?", a: "Pass-by-value: a copy of the variable is passed (changes don't affect original). Pass-by-reference: the original variable is passed (changes affect original).", tag: "Functions" },
  { q: "What is a closure?", a: "A function that captures variables from its surrounding scope. The function 'closes over' those variables and remembers them.", tag: "Functions" },
  { q: "What is a higher-order function?", a: "A function that takes another function as an argument or returns a function. Examples: map(), filter(), reduce() in JS/Python.", tag: "Functional" },
  { q: "What is a design pattern? Name three.", a: "Reusable solution to a common software problem. Examples: Singleton (one instance), Observer (event-driven), Factory (object creation abstraction).", tag: "Patterns" },
  { q: "What is a lambda function?", a: "An anonymous function defined inline. In Python: lambda x: x*2. In JS: (x) => x*2. Useful for short, one-off operations.", tag: "Functions" },
  { q: "What is the difference between == and === in JavaScript?", a: "== compares values after type coercion ('5' == 5 is true). === compares value AND type ('5' === 5 is false). Always prefer ===.", tag: "JavaScript" },
  { q: "What is a generator in Python?", a: "A function using 'yield' instead of 'return'. Returns an iterator, producing values one at a time lazily — saves memory for large datasets.", tag: "Python" },
  { q: "What is the difference between stack and heap memory?", a: "Stack: function calls, local variables, fast, auto-managed (LIFO). Heap: dynamic allocation (malloc/new), manual/GC-managed, slower, larger.", tag: "Memory" },
  { q: "What is a mutex?", a: "Mutual Exclusion — a synchronisation primitive that ensures only one thread can access a shared resource at a time. Prevents race conditions.", tag: "Concurrency" },
  { q: "What is async/await?", a: "Syntax for writing asynchronous code that looks synchronous. async declares a function returns a Promise. await pauses until the Promise resolves.", tag: "Async" },
  { q: "What is a race condition?", a: "A bug where program behaviour depends on the sequence or timing of concurrent operations, leading to unpredictable results.", tag: "Concurrency" },
  { q: "What is garbage collection?", a: "Automatic memory management that frees memory occupied by objects no longer referenced. Used in Java, Python, JS. Opposite: manual memory management (C, C++).", tag: "Memory" },
];

// ─── Decks export ─────────────────────────────────────────────────────────────

export const CSE_DECKS: CSEDeck[] = [
  {
    id: "cs-fundamentals",
    title: "CS Fundamentals",
    icon: "🖥️",
    color: "from-cyan-500/10 to-blue-500/5",
    accent: "from-cyan-500 to-blue-500",
    tagline: "Bits, bytes, CPU, memory, OS, and how computers really work",
    cards: csFundamentals,
  },
  {
    id: "data-structures",
    title: "Data Structures",
    icon: "🌳",
    color: "from-emerald-500/10 to-teal-500/5",
    accent: "from-emerald-500 to-teal-500",
    tagline: "Arrays, linked lists, trees, graphs, heaps, and hash tables",
    cards: dataStructures,
  },
  {
    id: "algorithms",
    title: "Algorithms",
    icon: "⚡",
    color: "from-yellow-500/10 to-orange-500/5",
    accent: "from-yellow-500 to-orange-500",
    tagline: "Sorting, searching, graph algorithms, DP, and complexity theory",
    cards: algorithms,
  },
  {
    id: "networks",
    title: "Computer Networks",
    icon: "🌐",
    color: "from-blue-500/10 to-indigo-500/5",
    accent: "from-blue-500 to-indigo-500",
    tagline: "OSI model, TCP/IP, DNS, HTTP, firewalls, VPNs",
    cards: networks,
  },
  {
    id: "databases",
    title: "Databases",
    icon: "🗄️",
    color: "from-violet-500/10 to-purple-500/5",
    accent: "from-violet-500 to-purple-500",
    tagline: "SQL, NoSQL, ACID, indexing, normalisation, and scalability",
    cards: databases,
  },
  {
    id: "ai-ml",
    title: "AI & Machine Learning",
    icon: "🧠",
    color: "from-pink-500/10 to-rose-500/5",
    accent: "from-pink-500 to-rose-500",
    tagline: "ML, deep learning, transformers, LLMs, NLP, RL and more",
    cards: aiml,
  },
  {
    id: "iot-embedded",
    title: "IoT & Embedded",
    icon: "🔌",
    color: "from-lime-500/10 to-green-500/5",
    accent: "from-lime-500 to-green-500",
    tagline: "Arduino, ESP32, Zigbee, LoRa, sensors, MQTT, FreeRTOS",
    cards: iotEmbedded,
  },
  {
    id: "security",
    title: "Cybersecurity",
    icon: "🔐",
    color: "from-red-500/10 to-orange-500/5",
    accent: "from-red-500 to-orange-500",
    tagline: "Encryption, attacks, TLS, hashing, authentication, zero-days",
    cards: security,
  },
  {
    id: "web-cloud",
    title: "Web & Cloud",
    icon: "☁️",
    color: "from-sky-500/10 to-cyan-500/5",
    accent: "from-sky-500 to-cyan-500",
    tagline: "REST, Docker, Kubernetes, CI/CD, serverless, React, microservices",
    cards: webCloud,
  },
  {
    id: "programming",
    title: "Programming Concepts",
    icon: "💻",
    color: "from-fuchsia-500/10 to-pink-500/5",
    accent: "from-fuchsia-500 to-pink-500",
    tagline: "OOP, closures, async/await, memory, concurrency, design patterns",
    cards: programming,
  },
];
