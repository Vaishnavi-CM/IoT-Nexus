import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlashCardDeck } from "@/components/ui/flash-card";
import { CSE_DECKS } from "@/data/cse-flashcards";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen, Cpu, Globe, Database, Brain, Shield,
  Cloud, Code2, Zap, TreePine, ChevronRight, Lightbulb,
} from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  "cs-fundamentals":  <Cpu className="w-5 h-5" />,
  "data-structures":  <TreePine className="w-5 h-5" />,
  "algorithms":       <Zap className="w-5 h-5" />,
  "networks":         <Globe className="w-5 h-5" />,
  "databases":        <Database className="w-5 h-5" />,
  "ai-ml":            <Brain className="w-5 h-5" />,
  "iot-embedded":     <Cpu className="w-5 h-5" />,
  "security":         <Shield className="w-5 h-5" />,
  "web-cloud":        <Cloud className="w-5 h-5" />,
  "programming":      <Code2 className="w-5 h-5" />,
};

// Topic detail articles for each deck
const TOPIC_DETAILS: Record<string, { title: string; body: string; tags: string[] }[]> = {
  "cs-fundamentals": [
    { title: "Binary & Number Systems", tags: ["Binary","Hex","Octal"], body: "Computers store all information as binary (base-2). A bit is 0 or 1. 8 bits = 1 byte (256 values). Hexadecimal (base-16) is a compact way to write binary — each hex digit = 4 bits. Decimal 255 = 0xFF = 11111111 in binary. Understanding number systems is essential for memory addresses, colour codes (#RRGGBB), networking (IP/subnet), and low-level programming." },
    { title: "CPU Architecture", tags: ["CPU","ALU","Registers"], body: "The CPU has an ALU (arithmetic/logic), Control Unit (decode & execute), and registers (ultra-fast temporary storage). The fetch-decode-execute cycle runs billions of times per second. Modern CPUs have multiple cores, cache levels (L1 < L2 < L3), and pipelining to execute multiple instructions simultaneously. Clock speed (GHz) measures cycles per second." },
    { title: "Memory Hierarchy", tags: ["RAM","Cache","ROM"], body: "Speed vs cost tradeoff: Registers (fastest, tiny) → L1/L2/L3 Cache → RAM → SSD/HDD (slowest, largest). RAM is volatile DRAM. Cache is SRAM on the CPU die. Virtual memory uses disk as slow RAM. ROM stores firmware. Flash (NAND) is non-volatile rewritable storage used in SSDs and microcontrollers." },
    { title: "Operating Systems", tags: ["Process","Scheduler","File System"], body: "An OS manages hardware resources and provides abstractions: processes (isolated execution), threads (lightweight units), file system (organised persistent storage), and system calls (API to hardware). The scheduler decides which process runs on the CPU. The kernel is the core of the OS with highest privilege. Common: Linux, Windows NT, macOS (XNU), Android (Linux-based)." },
    { title: "Logic Gates & Boolean Algebra", tags: ["AND","OR","NOT","XOR"], body: "Logic gates are the building blocks of all digital circuits. AND=both inputs 1, OR=at least one 1, NOT=invert, NAND=AND inverted, XOR=inputs differ. De Morgan's: NOT(A AND B) = NOT A OR NOT B. Transistors implement gates — a modern CPU has billions of transistors. Boolean algebra underpins circuit design, conditionals, and bit manipulation." },
  ],
  "data-structures": [
    { title: "Arrays & Dynamic Arrays", tags: ["Array","ArrayList","Vector"], body: "Arrays store elements in contiguous memory for O(1) random access by index. Fixed size in C/C++. Dynamic arrays (Python list, Java ArrayList, C++ vector) resize automatically — amortised O(1) append. Inserting/deleting in the middle is O(n) due to shifting. 2D arrays are used for matrices, game grids, images." },
    { title: "Linked Lists", tags: ["Singly","Doubly","Circular"], body: "Each node holds data + pointer to next. Singly linked: O(1) insert at head, O(n) search. Doubly linked: each node has prev + next pointers, enabling O(1) delete if you have a reference. No random access (no index). Used in queues, LRU cache (doubly + hash map), and undo lists." },
    { title: "Trees & BSTs", tags: ["BST","AVL","Red-Black"], body: "Binary Search Tree: left < node < right. Average O(log n) search/insert. Worst case O(n) if unbalanced (chain). Self-balancing trees (AVL, Red-Black) maintain O(log n) always. B-Trees are used in databases for index structures. Heaps are complete binary trees used for priority queues (O(log n) insert/extract-min)." },
    { title: "Hash Tables", tags: ["HashMap","Hashing","Collision"], body: "A hash function maps a key to an array index. Average O(1) get/set/delete. Collisions (two keys → same index) resolved by chaining (linked list) or open addressing (linear probing). Load factor = elements/capacity. Rehashing occurs when load factor is too high. Python dict and JS object are hash maps." },
    { title: "Graphs", tags: ["Adjacency List","BFS","DFS"], body: "Graphs model relationships: social networks, maps, dependencies. Represented as adjacency list (space efficient) or matrix (fast edge lookup). BFS (queue) finds shortest path in unweighted graphs. DFS (stack/recursion) explores all paths. Dijkstra's for weighted shortest path. Used for routing, recommendations, dependency resolution." },
  ],
  "algorithms": [
    { title: "Sorting Algorithms", tags: ["QuickSort","MergeSort","Heap"], body: "Bubble/Selection/Insertion sorts are O(n²) — fine for small n. Merge sort is O(n log n) stable (preserves equal element order). Quick sort O(n log n) average but O(n²) worst — mitigated by random pivot. Heap sort O(n log n) in-place. TimSort (Python/Java default) combines insertion + merge. Counting/Radix sort is O(n) for integers." },
    { title: "Searching", tags: ["Binary Search","Linear","BFS"], body: "Linear search O(n) — scans every element. Binary search O(log n) — requires sorted array, halves search space each step. BFS for shortest path in unweighted graphs. A* search uses heuristics for optimal pathfinding in weighted graphs. Jump search and interpolation search are alternatives to binary search." },
    { title: "Dynamic Programming", tags: ["Memoisation","Tabulation","Subproblems"], body: "DP solves problems with overlapping subproblems and optimal substructure. Top-down: recurse + cache (memoisation). Bottom-up: fill a table (tabulation). Classic problems: Fibonacci, Longest Common Subsequence, 0/1 Knapsack, Coin Change, Edit Distance, Matrix Chain Multiplication. Reduces exponential to polynomial time." },
    { title: "Greedy Algorithms", tags: ["Optimal","Huffman","Dijkstra"], body: "Make the locally optimal choice at each step, hoping for a global optimum. Works when the problem has the greedy choice property + optimal substructure. Examples: Activity Selection, Huffman Encoding (data compression), Kruskal's/Prim's MST, Dijkstra's (non-negative weights). Fails for 0/1 Knapsack (use DP instead)." },
    { title: "Complexity Theory", tags: ["P","NP","Big-O"], body: "Big-O: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n) < O(n!). P = solvable in polynomial time. NP = verifiable in polynomial time. NP-complete = hardest in NP (SAT, TSP, 3-COLOURing). NP-hard = at least as hard as NP. P vs NP is the greatest open problem in CS — a $1M Millennium Prize." },
  ],
  "networks": [
    { title: "OSI Model", tags: ["7 Layers","Protocol Stack"], body: "7 layers: Physical (bits over wire), Data Link (frames, MAC), Network (packets, IP routing), Transport (TCP/UDP, end-to-end), Session (connection management), Presentation (encoding, TLS), Application (HTTP, DNS, SMTP). Each layer adds a header (encapsulation). TCP/IP model merges to 4 layers: Link, Internet, Transport, Application." },
    { title: "IP Addressing & Subnetting", tags: ["IPv4","IPv6","CIDR"], body: "IPv4: 32-bit, written as 4 octets (192.168.1.1). 4.3 billion addresses. Private ranges: 10.x.x.x, 172.16.x.x, 192.168.x.x. CIDR notation: /24 = 256 hosts. IPv6: 128-bit (3.4×10³⁸ addresses). Subnetting divides networks for security and routing efficiency. NAT allows private IPs to share public IPs." },
    { title: "TCP vs UDP", tags: ["TCP","UDP","Reliability"], body: "TCP: 3-way handshake, ordered delivery, acknowledgements, flow control, congestion control. Used for HTTP, SSH, email. UDP: connectionless, no ordering, fast. Used for video streaming, DNS, gaming, VoIP. QUIC (HTTP/3) builds reliability on UDP for better web performance. TCP 4-way teardown: FIN, FIN-ACK, FIN, ACK." },
    { title: "DNS & HTTP", tags: ["DNS","HTTP/2","REST"], body: "DNS resolves domain names to IPs: browser checks cache → OS → resolver → root → TLD → authoritative. Recursive vs iterative queries. HTTP is stateless text protocol. HTTP/2 multiplexes streams, compresses headers, enables server push. HTTP/3 uses QUIC (UDP). REST uses HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove). Status codes: 2xx OK, 3xx redirect, 4xx client error, 5xx server error." },
    { title: "Network Security", tags: ["Firewall","VPN","TLS"], body: "Firewalls filter traffic by IP, port, and protocol (stateless) or by connection state (stateful). VPNs encrypt traffic in a tunnel — WireGuard (modern, fast) or OpenVPN. TLS uses asymmetric crypto for key exchange, then symmetric (AES) for data. IDS/IPS detect/block intrusions. Zero-trust: verify every request regardless of network location." },
  ],
  "databases": [
    { title: "Relational Databases & SQL", tags: ["SQL","Joins","ACID"], body: "Tables store data in rows/columns. SQL: SELECT, INSERT, UPDATE, DELETE. JOINs combine tables: INNER (matching rows), LEFT (all left), RIGHT (all right), FULL. GROUP BY aggregates, HAVING filters groups. Subqueries and CTEs for complex queries. Transactions ensure ACID. PostgreSQL and MySQL are dominant open-source relational DBs." },
    { title: "Indexing & Query Optimisation", tags: ["B-Tree","Index","EXPLAIN"], body: "Indexes speed up reads at the cost of write performance and storage. B-Tree index: default, good for ranges and equality. Hash index: exact matches only. Composite indexes: index on multiple columns (order matters). EXPLAIN / EXPLAIN ANALYZE shows query plan. Avoid N+1 queries. Use query caches, connection pools, and read replicas." },
    { title: "NoSQL Databases", tags: ["MongoDB","Redis","Cassandra"], body: "Document stores (MongoDB): JSON-like documents, flexible schema. Key-Value (Redis): ultra-fast in-memory, used for caching and sessions. Column-family (Cassandra): wide rows, designed for high write throughput and partitioning. Graph (Neo4j): relationships as first-class citizens. Time-series (InfluxDB): for IoT sensor data. CAP theorem: can only guarantee 2 of 3 (Consistency, Availability, Partition tolerance)." },
    { title: "Database Design", tags: ["Normalisation","ERD","Schema"], body: "Entity-Relationship Diagrams (ERDs) model data before implementation. Normalisation removes redundancy: 1NF (atomic values), 2NF (full functional dependency), 3NF (no transitive dependency). Sometimes denormalise for read performance. One-to-many: foreign key. Many-to-many: junction table. Star schema (fact + dimension tables) for data warehouses." },
  ],
  "ai-ml": [
    { title: "ML Fundamentals", tags: ["Supervised","Unsupervised","Reinforcement"], body: "ML algorithms learn from data without explicit rules. Supervised: labelled (x→y) — classification (categories) and regression (continuous). Unsupervised: unlabelled — clustering (k-means, DBSCAN), dimensionality reduction (PCA, t-SNE). Reinforcement: reward-based — Q-learning, PPO. Bias-variance tradeoff: high bias = underfitting, high variance = overfitting." },
    { title: "Neural Networks & Deep Learning", tags: ["CNN","RNN","Transformer"], body: "Neural nets: input layer → hidden layers (activation: ReLU, sigmoid) → output. Backpropagation computes gradients. Batch normalisation, dropout prevent overfitting. CNNs use convolutional filters for images (ResNet, VGG). RNNs handle sequences but suffer from vanishing gradients → LSTMs/GRUs fix this. Transformers use self-attention (parallel), outperform RNNs for NLP." },
    { title: "Large Language Models (LLMs)", tags: ["GPT","BERT","Fine-tuning"], body: "LLMs are transformer models trained on massive text corpora via next-token prediction. BERT: bidirectional (encoder-only), great for classification. GPT: autoregressive (decoder-only), great for generation. RLHF (Reinforcement Learning from Human Feedback) aligns models with human preferences (ChatGPT). Fine-tuning adapts a base model. RAG (Retrieval-Augmented Generation) adds external knowledge." },
    { title: "AI/ML in IoT (TinyML)", tags: ["TinyML","Edge AI","TFLM"], body: "TinyML runs ML models on microcontrollers with kilobytes of RAM. TensorFlow Lite Micro (TFLM), Edge Impulse. Applications: keyword spotting ('Hey Siri'), gesture recognition, anomaly detection on sensors. Model compression: quantisation (float32 → int8), pruning (remove unimportant weights), knowledge distillation. ESP32 and Arduino Nano 33 BLE Sense support TinyML." },
    { title: "Computer Vision", tags: ["Object Detection","YOLO","OpenCV"], body: "CV tasks: classification, object detection (YOLO, SSD, Faster R-CNN), segmentation (Mask R-CNN, SAM), pose estimation, OCR. OpenCV for image processing. YOLO (You Only Look Once) detects objects in real time in a single pass. Transfer learning from ImageNet (ResNet, EfficientNet, ViT) for custom datasets. Widely used in self-driving, medical imaging, surveillance." },
  ],
  "iot-embedded": [
    { title: "Microcontrollers Deep Dive", tags: ["ESP32","Arduino","STM32"], body: "Arduino Uno: 8-bit ATmega328P, 16MHz, 32KB flash, 2KB RAM, 14 digital I/O, 6 PWM, 6 analog. Programmed in C/C++. ESP32: dual-core Xtensa LX6 @ 240MHz, 4MB flash, 520KB SRAM, WiFi+BT, 36 GPIO. STM32: 32-bit ARM Cortex-M, up to 550MHz, enterprise grade. Raspberry Pi Pico: RP2040 dual-core ARM M0+, 264KB RAM, 2MB flash, MicroPython." },
    { title: "Wireless Protocols Compared", tags: ["Zigbee","Z-Wave","BLE","WiFi"], body: "WiFi (802.11): high speed, high power. BLE: low power, ~10m, point-to-point or mesh (BLE Mesh). Zigbee (802.15.4): low power, 250kbps, 100m, true mesh, 65K+ devices per network. Z-Wave: 868MHz, no interference, 30m, max 232 devices. LoRa: 15km+, <50kbps, years on battery — for farms, assets. NB-IoT: cellular, 1km+, telcos." },
    { title: "Sensors & Actuators", tags: ["DHT22","PIR","Servo","Relay"], body: "Temperature: DHT22 (±0.5°C), DS18B20 (waterproof, 1-Wire), BMP280 (also pressure). Light: LDR (analog), BH1750 (I2C lux). Motion: PIR (infrared), HC-SR04 (ultrasonic distance 2-400cm). Gas: MQ-2 (smoke/LPG). Actuators: servo (PWM, 0-180°), stepper (precise steps), relay (switch 220V loads). I2C, SPI, analog, 1-Wire interfaces." },
    { title: "MQTT & IoT Protocols", tags: ["MQTT","CoAP","AMQP"], body: "MQTT (Message Queuing Telemetry Transport): TCP-based pub/sub. Broker (Mosquitto, HiveMQ, AWS IoT Core) distributes messages by topic. QoS 0 (fire-forget), QoS 1 (at least once), QoS 2 (exactly once). Retain flag keeps last message. CoAP: UDP-based REST for constrained devices. AMQP: enterprise messaging. HTTP for REST APIs on IoT gateways." },
    { title: "Edge Computing & RTOS", tags: ["FreeRTOS","Edge","MQTT"], body: "FreeRTOS: preemptive scheduler for microcontrollers. Tasks, queues, semaphores, mutexes, timers. Portable across ESP32, STM32, Arduino, Raspberry Pi. Edge devices process data locally — reduces cloud costs, enables offline operation. AWS Greengrass, Azure IoT Edge for gateway compute. Time-critical systems (robotics, industrial) require deterministic RTOS scheduling, not Linux." },
  ],
  "security": [
    { title: "Cryptography Fundamentals", tags: ["AES","RSA","ECC"], body: "Symmetric (AES-256): same key for encrypt/decrypt — fast, used for bulk data. Asymmetric (RSA-4096, ECC): public key encrypts, private decrypts — slow, used for key exchange. TLS uses asymmetric to exchange a symmetric session key. SHA-256: 256-bit hash, used for signing and integrity. bcrypt/Argon2: slow hashes for passwords (prevents brute force)." },
    { title: "Common Attack Vectors", tags: ["SQLi","XSS","CSRF","RCE"], body: "SQL Injection: unsanitised input in SQL queries — use prepared statements. XSS: injected scripts run in users' browsers — sanitise output, use CSP headers. CSRF: tricks authenticated users into making unintended requests — use CSRF tokens. Buffer overflow: overwrite stack/heap — use memory-safe languages (Rust) or ASLR/stack canaries. RCE: remote code execution via vulnerabilities." },
    { title: "IoT Security", tags: ["Firmware","TLS","CVE"], body: "IoT devices are notoriously insecure: default passwords, unencrypted traffic, no update mechanisms. Mirai botnet (2016) infected 600K devices, launched largest-ever DDoS. Best practices: use TLS (MQTT over TLS = MQTTS), unique device credentials, OTA (over-the-air) firmware updates, certificate pinning, secure boot, network segmentation." },
    { title: "Zero Trust & Defence in Depth", tags: ["Zero Trust","MFA","Least Privilege"], body: "Zero Trust: 'never trust, always verify' — authenticate every request regardless of network location. Micro-segmentation, continuous monitoring, MFA. Defence in depth: multiple security layers — perimeter (firewall), network (IDS/IPS), host (antivirus, EDR), application (WAF), data (encryption). OWASP Top 10 lists critical web app security risks." },
  ],
  "web-cloud": [
    { title: "Modern Web Architecture", tags: ["SPA","SSR","JAMstack"], body: "SPA (Single Page Application): React/Vue/Angular loads once, updates DOM via JS. Fast UI, poor SEO. SSR (Server-Side Rendering): Next.js renders HTML on server per request — better SEO, slower TTFB. SSG (Static Site Generation): pre-build all pages at build time (Gatsby, Astro). JAMstack: JavaScript + API + Markup. Edge rendering runs code near the user (Cloudflare Workers, Vercel Edge)." },
    { title: "REST API Design", tags: ["REST","CRUD","OpenAPI"], body: "Resources are nouns (/users, /products). Methods: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove). Use proper status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorised, 403 Forbidden, 404 Not Found, 500 Server Error. Versioning: /api/v1/. Pagination: ?page=1&limit=20. Document with OpenAPI/Swagger." },
    { title: "Containers & DevOps", tags: ["Docker","K8s","CI/CD"], body: "Docker packages app + dependencies into a container image. Dockerfile defines the build. docker-compose for multi-service apps. Kubernetes (K8s) orchestrates containers: Pods (1+ containers), Services (load balancing), Deployments (rolling updates), ConfigMaps/Secrets. Helm for K8s packaging. CI/CD: GitHub Actions, Jenkins, GitLab CI automate build → test → deploy pipelines." },
    { title: "Cloud Platforms", tags: ["AWS","Azure","GCP"], body: "AWS: EC2 (VMs), S3 (object storage), RDS (managed DB), Lambda (serverless), IoT Core. Azure: IoT Hub (device management), Functions, Cosmos DB. GCP: Pub/Sub (MQTT-like), BigQuery (analytics), Vertex AI. Key concepts: IaaS (raw VMs), PaaS (managed runtime), SaaS (full app). Serverless (Lambda, Cloud Functions) charges per invocation, scales to zero." },
  ],
  "programming": [
    { title: "Object-Oriented Programming", tags: ["OOP","SOLID","Design Patterns"], body: "4 pillars: Encapsulation (data hiding, getters/setters), Inheritance (extend/override), Polymorphism (runtime: method overriding, compile-time: overloading), Abstraction (interfaces/abstract classes). SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. Patterns: Singleton, Observer, Factory, Strategy, Decorator." },
    { title: "Functional Programming", tags: ["Immutability","Map","Filter","Reduce"], body: "Pure functions: same input → same output, no side effects. Immutability: don't mutate data, return new values. First-class functions: pass/return functions. Higher-order functions: map (transform), filter (select), reduce (aggregate). Currying: f(a)(b) instead of f(a,b). Monads: composable computational contexts (Promise is a monad). Languages: Haskell, Erlang, Elixir; features in Python, JS, Scala." },
    { title: "Concurrency & Async", tags: ["Threads","Async/Await","Event Loop"], body: "Multi-threading: true parallelism on multi-core CPUs. Shared memory needs locks (mutex, semaphore) to prevent race conditions. Async I/O (Node.js, Python asyncio): single thread + event loop handles many concurrent tasks. async/await syntactic sugar over Promises/coroutines. Go routines: lightweight green threads. Actor model (Erlang, Akka): no shared state, message passing." },
    { title: "Memory Management", tags: ["Stack","Heap","GC","Rust"], body: "Stack: fast LIFO, stores local variables + return addresses. Heap: dynamic allocation (malloc/new). Manual management in C/C++: malloc + free (memory leaks/dangling pointers if misused). Garbage collection (Java, Python, JS): automatic, GC pauses. Reference counting (Python, Swift): immediate deallocation, cycles need breaking. Rust: ownership + borrow checker — memory safe without GC." },
  ],
};

export default function Learn() {
  const [activeDeck, setActiveDeck] = useState(CSE_DECKS[0].id);
  const [activeTab, setActiveTab] = useState<"topics" | "flashcards">("topics");

  const deck = CSE_DECKS.find(d => d.id === activeDeck) ?? CSE_DECKS[0];
  const topics = TOPIC_DETAILS[activeDeck] ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/8 bg-card/20 backdrop-blur">
        <div className="absolute top-0 left-1/4 w-96 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">CSE Knowledge Base</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-3">
            Learn <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Computer Science</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            10 domains · 140+ flashcards · Deep-dive articles covering everything from
            bits to LLMs, Arduino to Kubernetes, Zigbee to Cybersecurity.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ── Domain selector ────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {CSE_DECKS.map(d => (
            <button
              key={d.id}
              onClick={() => { setActiveDeck(d.id); setActiveTab("topics"); }}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                activeDeck === d.id
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                  : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground bg-card/30"
              }`}
            >
              <span>{d.icon}</span>
              {d.title}
            </button>
          ))}
        </div>

        {/* ── Deck header ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDeck}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className={`rounded-2xl border border-white/8 bg-gradient-to-br ${deck.color} p-6 mb-6 relative overflow-hidden`}>
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/3 pointer-events-none" />
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{deck.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold font-display">{deck.title}</h2>
                  <p className="text-muted-foreground text-sm">{deck.tagline}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary">{topics.length} topics</Badge>
                <Badge variant="secondary">{deck.cards.length} flashcards</Badge>
              </div>
            </div>

            {/* ── Tab bar ──────────────────────────────────────────── */}
            <div className="flex gap-1 mb-6 p-1 rounded-xl bg-card/30 border border-white/8 w-fit">
              {(["topics", "flashcards"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    activeTab === tab
                      ? "bg-background shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "flashcards" ? "⚡ Flashcards" : "📖 Topics"}
                </button>
              ))}
            </div>

            {/* ── Topics tab ───────────────────────────────────────── */}
            {activeTab === "topics" && (
              <div className="grid md:grid-cols-2 gap-5">
                {topics.length > 0 ? topics.map((t, i) => (
                  <motion.div
                    key={t.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="h-full bg-card/40 border-white/8 hover:border-white/20 transition-all hover:shadow-lg group">
                      <CardContent className="p-6">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {t.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                        <h3 className="font-bold font-display text-lg mb-3 group-hover:text-primary transition-colors">
                          {t.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
                        <button
                          onClick={() => setActiveTab("flashcards")}
                          className="mt-4 inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                        >
                          <Lightbulb className="w-3.5 h-3.5" /> Practice with flashcards <ChevronRight className="w-3 h-3" />
                        </button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )) : (
                  <div className="col-span-2 text-center py-16 text-muted-foreground">
                    Topics coming soon for this section.
                  </div>
                )}
              </div>
            )}

            {/* ── Flashcards tab ───────────────────────────────────── */}
            {activeTab === "flashcards" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                <FlashCardDeck
                  cards={deck.cards}
                  title={`${deck.icon} ${deck.title} Flashcards`}
                  accentColor={deck.accent}
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
