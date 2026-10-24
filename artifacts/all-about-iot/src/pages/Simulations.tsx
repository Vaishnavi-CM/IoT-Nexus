import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Wifi, Zap, Cpu, Radio, Info } from "lucide-react";

// ─── Theory panel component ───────────────────────────────────────────────────
function TheoryBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 p-4 mt-4">
      <div className="flex items-center gap-2 font-semibold text-blue-300 mb-2 text-sm">
        <Info className="h-4 w-4 shrink-0" /> {title}
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-1.5">{children}</div>
    </div>
  );
}

// ─── Microcontroller visualization ───────────────────────────────────────────
function MicrocontrollerViz({ playing }: { playing: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#050810] overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#00d4ff" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {playing && (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {[0,1,2,3,4,5].map(i => (
            <line key={i} x1={`${10 + i * 14}%`} y1="0%" x2={`${10 + i * 14}%`} y2="100%"
              stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 20"
              style={{ animation: `flowDown ${1.5 + i * 0.3}s linear infinite` }}/>
          ))}
        </svg>
      )}
      <div className="relative z-10">
        <div className={`absolute w-48 h-48 rounded-full transition-all duration-1000 ${playing ? 'opacity-30' : 'opacity-5'}`}
          style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)', animation: playing ? 'pulse 2s ease-in-out infinite' : 'none' }}/>
        <div className="relative w-56 h-56 rounded-lg border-2 border-[#1a3a4a] bg-[#0a1628] shadow-2xl"
          style={{ boxShadow: playing ? '0 0 40px rgba(0,212,255,0.3)' : undefined }}>
          <div className="absolute -left-3 top-6 bottom-6 flex flex-col justify-between">
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-3 h-1 bg-amber-400 rounded-sm" />
                <div className={`w-1 h-1 rounded-full ${playing ? 'bg-cyan-400' : 'bg-gray-600'}`}
                  style={playing ? { animation: `blink ${0.5 + i * 0.2}s ease-in-out infinite alternate` } : {}}/>
              </div>
            ))}
          </div>
          <div className="absolute -right-3 top-6 bottom-6 flex flex-col justify-between">
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} className="flex items-center gap-0.5 flex-row-reverse">
                <div className="w-3 h-1 bg-amber-400 rounded-sm" />
                <div className={`w-1 h-1 rounded-full ${playing ? 'bg-purple-400' : 'bg-gray-600'}`}
                  style={playing ? { animation: `blink ${0.7 + i * 0.15}s ease-in-out infinite alternate` } : {}}/>
              </div>
            ))}
          </div>
          <div className="absolute -top-3 left-6 right-6 flex justify-between">
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="h-3 w-1 bg-amber-400 rounded-sm" />
                <div className={`w-1 h-1 rounded-full ${playing ? 'bg-green-400' : 'bg-gray-600'}`}
                  style={playing ? { animation: `blink ${0.6 + i * 0.25}s ease-in-out infinite alternate` } : {}}/>
              </div>
            ))}
          </div>
          <div className="absolute -bottom-3 left-6 right-6 flex justify-between">
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 flex-col-reverse">
                <div className="h-3 w-1 bg-amber-400 rounded-sm" />
                <div className={`w-1 h-1 rounded-full ${playing ? 'bg-red-400' : 'bg-gray-600'}`}
                  style={playing ? { animation: `blink ${0.4 + i * 0.3}s ease-in-out infinite alternate` } : {}}/>
              </div>
            ))}
          </div>
          <div className="absolute inset-8 rounded border border-cyan-500/30 bg-[#0d2035] flex items-center justify-center"
            style={playing ? { boxShadow: '0 0 15px rgba(0,212,255,0.4)', animation: 'rotateSlow 8s linear infinite' } : {}}>
            <div className="w-16 h-16 rounded border-2 border-cyan-400/50 flex items-center justify-center"
              style={playing ? { animation: 'pulse 1s ease-in-out infinite' } : {}}>
              <Cpu className={`h-8 w-8 ${playing ? 'text-cyan-400' : 'text-gray-600'}`} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 text-xs text-cyan-400 font-mono opacity-70">ESP32 @ 240MHz</div>
      <div className="absolute top-4 right-4 text-xs text-purple-400 font-mono opacity-70">GPIO × 36</div>
      <style>{`
        @keyframes flowDown { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -24; } }
        @keyframes blink { from { opacity: 0.3; } to { opacity: 1; } }
        @keyframes rotateSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
      `}</style>
    </div>
  );
}

// ─── RF Signal oscilloscope ───────────────────────────────────────────────────
function SignalViz({ playing, frequency, amplitude }: { playing: boolean; frequency: number; amplitude: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef<number>(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(0,212,255,0.05)"; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
      if (playing) frameRef.current += 0.05;
      const t = frameRef.current;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "rgba(0,212,255,0.2)"); grad.addColorStop(0.5, "rgba(0,212,255,1)"); grad.addColorStop(1, "rgba(124,58,237,0.5)");
      ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.shadowColor = "#00d4ff"; ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h/2 + Math.sin((x / w) * Math.PI * 2 * frequency + t) * (amplitude / 100) * (h/2 - 20);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(124,58,237,0.3)"; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h/2 + Math.sin((x / w) * Math.PI * 2 * frequency * 2 + t * 1.5) * (amplitude / 100) * (h/2 - 30) * 0.4;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(0,212,255,0.6)"; ctx.font = "10px monospace";
      ctx.fillText(`f = ${frequency} Hz`, 10, 20); ctx.fillText(`A = ${amplitude}%`, 10, 35);
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, frequency, amplitude]);
  return <canvas ref={canvasRef} className="w-full h-full" width={500} height={200}/>;
}

// ─── MQTT topology ────────────────────────────────────────────────────────────
function MQTTViz({ playing }: { playing: boolean }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setFrame(f => (f + 1) % 60), 50);
    return () => clearInterval(t);
  }, [playing]);
  const broker = { x: 50, y: 50 };
  const devices = [
    { x: 15, y: 15, label: "Sensor A", color: "#00d4ff", icon: "📡" },
    { x: 85, y: 15, label: "Sensor B", color: "#7c3aed", icon: "🌡️" },
    { x: 15, y: 85, label: "Dashboard", color: "#10b981", icon: "📊" },
    { x: 85, y: 85, label: "Actuator", color: "#f59e0b", icon: "⚡" },
    { x: 50, y: 10, label: "Gateway", color: "#ec4899", icon: "🔗" },
  ];
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#050810] overflow-hidden p-4">
      <svg className="w-full h-full max-w-md max-h-80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {devices.map((d, i) => {
          const progress = playing ? ((frame / 60 + i * 0.2) % 1) : 0;
          const px = broker.x + (d.x - broker.x) * progress;
          const py = broker.y + (d.y - broker.y) * progress;
          return (
            <g key={i}>
              <line x1={broker.x} y1={broker.y} x2={d.x} y2={d.y} stroke={d.color} strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2 2"/>
              {playing && (
                <circle cx={px} cy={py} r="1" fill={d.color} opacity="0.9">
                  <animate attributeName="opacity" values="0;1;0" dur={`${1 + i * 0.3}s`} repeatCount="indefinite"/>
                </circle>
              )}
            </g>
          );
        })}
        <circle cx={broker.x} cy={broker.y} r="8" fill="#1a1f2e" stroke="#00d4ff" strokeWidth="1"/>
        {playing && (
          <circle cx={broker.x} cy={broker.y} r="8" fill="none" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.4">
            <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
          </circle>
        )}
        <text x={broker.x} y={broker.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="5" fill="#00d4ff" fontFamily="monospace">MQTT</text>
        <text x={broker.x} y={broker.y + 14} textAnchor="middle" fontSize="3" fill="#00d4ff" fontFamily="monospace" opacity="0.7">Broker</text>
        {devices.map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r="6" fill="#0d1a2e" stroke={d.color} strokeWidth="0.8"/>
            <text x={d.x} y={d.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="4">{d.icon}</text>
            <text x={d.x} y={d.y + 11} textAnchor="middle" fontSize="2.5" fill={d.color} fontFamily="monospace">{d.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Simulations() {
  const [mcuPlaying, setMcuPlaying] = useState(true);
  const [mqttPlaying, setMqttPlaying] = useState(true);
  const [sigPlaying, setSigPlaying] = useState(true);
  const [temperature, setTemperature] = useState([24]);
  const [humidity, setHumidity] = useState([45]);
  const [frequency, setFrequency] = useState([3]);
  const [amplitude, setAmplitude] = useState([70]);
  const [mqttLogs, setMqttLogs] = useState<string[]>([
    "[broker] MQTT Broker started on port 1883",
    "[connect] Sensor-A (DHT22) connected",
    "[connect] Sensor-B (BMP280) connected",
    "[connect] Dashboard subscribed to home/#",
  ]);

  useEffect(() => {
    if (!mqttPlaying) return;
    const topics = ["home/temp", "home/humidity", "factory/pressure", "office/motion", "garden/soil"];
    const t = setInterval(() => {
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const val = (Math.random() * 40 + 10).toFixed(1);
      setMqttLogs(prev => [...prev.slice(-8), `[publish] ${topic}: ${val}`]);
    }, 1200);
    return () => clearInterval(t);
  }, [mqttPlaying]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          Interactive Simulations
        </h1>
        <p className="text-lg text-muted-foreground">
          Live animated visualizations of real IoT hardware, protocols, and sensors — with theory explanations for each.
        </p>
      </div>

      <Tabs defaultValue="visualizations" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-card/50 border border-border">
            <TabsTrigger value="visualizations">Hardware Visualizations</TabsTrigger>
            <TabsTrigger value="protocols">Protocol Simulations</TabsTrigger>
            <TabsTrigger value="interactive">Interactive Sensors</TabsTrigger>
          </TabsList>
        </div>

        {/* ── Tab 1: Hardware ───────────────────────────────────────────── */}
        <TabsContent value="visualizations" className="space-y-8 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ESP32 chip */}
            <Card className="bg-card/50 backdrop-blur border-white/10 overflow-hidden flex flex-col">
              <div className="h-[320px] w-full relative">
                <MicrocontrollerViz playing={mcuPlaying}/>
                <div className="absolute bottom-4 right-4">
                  <Button variant="secondary" size="icon" className="bg-background/80 backdrop-blur" onClick={() => setMcuPlaying(p => !p)}>
                    {mcuPlaying ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
                  </Button>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-lg font-bold font-display mb-1 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-cyan-400"/> ESP32 Microcontroller — Live Pin Activity
                </h3>
                <p className="text-sm text-muted-foreground">
                  The blinking colored dots represent GPIO (General Purpose Input/Output) pin states — HIGH or LOW, 3.3V or 0V.
                  The glowing center is the dual-core Xtensa LX6 CPU processing instructions.
                </p>
                <TheoryBox title="What is a Microcontroller?">
                  <p>A <strong className="text-foreground">microcontroller (MCU)</strong> is a complete computer on a single chip. Unlike a laptop CPU which needs separate RAM, storage, and peripherals, an MCU has everything built-in: CPU core, Flash memory (stores your program), SRAM (runtime variables), ADC (reads analog sensors), and communication interfaces (I2C, SPI, UART, WiFi).</p>
                  <p className="mt-1.5">The <strong className="text-foreground">ESP32</strong> runs at up to 240 MHz with 520 KB SRAM, 4 MB Flash, built-in WiFi (802.11 b/g/n) and Bluetooth 4.2 — all for under $5. This makes it the most popular IoT chip in the world.</p>
                  <p className="mt-1.5"><strong className="text-foreground">GPIO pins</strong> can be configured as digital input (read button/sensor states), digital output (drive LEDs, relays), PWM output (control motor speed, LED brightness), or analog input via 12-bit ADC (0–4095 representing 0–3.3V).</p>
                </TheoryBox>
              </CardContent>
            </Card>

            {/* RF Signal oscilloscope */}
            <Card className="bg-card/50 backdrop-blur border-white/10 overflow-hidden flex flex-col">
              <div className="h-[200px] w-full relative bg-[#050810]">
                <SignalViz playing={sigPlaying} frequency={frequency[0]} amplitude={amplitude[0]}/>
                <div className="absolute bottom-4 right-4">
                  <Button variant="secondary" size="icon" className="bg-background/80 backdrop-blur" onClick={() => setSigPlaying(p => !p)}>
                    {sigPlaying ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
                  </Button>
                </div>
              </div>
              <CardContent className="p-5 space-y-3">
                <h3 className="text-lg font-bold font-display flex items-center gap-2">
                  <Radio className="h-4 w-4 text-purple-400"/> RF Signal Waveform — Oscilloscope View
                </h3>
                <div>
                  <div className="flex justify-between mb-1 text-xs"><span className="text-muted-foreground">Frequency</span><span className="font-mono text-cyan-400">{frequency[0]} Hz</span></div>
                  <Slider value={frequency} onValueChange={setFrequency} min={1} max={10} step={1}/>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-xs"><span className="text-muted-foreground">Amplitude</span><span className="font-mono text-purple-400">{amplitude[0]}%</span></div>
                  <Slider value={amplitude} onValueChange={setAmplitude} min={10} max={100} step={5}/>
                </div>
                <TheoryBox title="Understanding Wireless Signals">
                  <p>This oscilloscope shows a <strong className="text-foreground">sinusoidal carrier wave</strong> — the fundamental shape of all radio signals. <strong className="text-foreground">Frequency</strong> determines how many cycles occur per second (measured in Hz). WiFi uses 2.4 GHz (2.4 billion cycles/second), LoRa uses 868 MHz, Bluetooth uses 2.4 GHz.</p>
                  <p className="mt-1.5"><strong className="text-foreground">Amplitude</strong> is the signal strength — higher amplitude means stronger signal, longer range, but more power consumption. IoT devices constantly balance signal strength against battery life.</p>
                  <p className="mt-1.5">The faint purple second wave is the <strong className="text-foreground">second harmonic</strong> — a natural byproduct of signal modulation that must be filtered out in real RF circuits.</p>
                </TheoryBox>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 2: Protocols ──────────────────────────────────────────── */}
        <TabsContent value="protocols" className="space-y-8 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* MQTT topology */}
            <Card className="bg-card/50 backdrop-blur border-white/10 overflow-hidden flex flex-col">
              <div className="h-[280px] w-full relative">
                <MQTTViz playing={mqttPlaying}/>
                <div className="absolute bottom-4 right-4">
                  <Button variant="secondary" size="icon" className="bg-background/80 backdrop-blur" onClick={() => setMqttPlaying(p => !p)}>
                    {mqttPlaying ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
                  </Button>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-lg font-bold font-display mb-1 flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-400"/> MQTT Publish/Subscribe Topology
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Animated dots = messages traveling between devices and the broker. Each color = a different device.
                </p>
                <TheoryBox title="How MQTT Works">
                  <p><strong className="text-foreground">MQTT (Message Queuing Telemetry Transport)</strong> is a lightweight messaging protocol designed for constrained IoT devices. It uses a <strong className="text-foreground">publish/subscribe</strong> model instead of direct device-to-device communication.</p>
                  <p className="mt-1.5">A <strong className="text-foreground">broker</strong> (like Mosquitto or HiveMQ) sits in the middle. Sensors <em>publish</em> data to a <strong className="text-foreground">topic</strong> (e.g., <code className="text-accent text-xs">home/livingroom/temperature</code>). Any device that has <em>subscribed</em> to that topic instantly receives the message — even if it's on the other side of the world.</p>
                  <p className="mt-1.5">MQTT uses only a <strong className="text-foreground">2-byte minimum header</strong> over TCP — far smaller than HTTP's 200+ byte overhead. This lets a sensor running on a 9V battery publish thousands of readings before needing a replacement.</p>
                  <p className="mt-1.5"><strong className="text-foreground">QoS levels:</strong> 0 = fire and forget, 1 = at least once delivery, 2 = exactly once delivery. Most IoT apps use QoS 1 for balance of reliability and speed.</p>
                </TheoryBox>
              </CardContent>
            </Card>

            {/* MQTT broker live log */}
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-400"/> MQTT Broker Console
                </CardTitle>
                <CardDescription>Real-time message stream — simulating Mosquitto broker</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[#0a0f1a] rounded-lg border border-white/10 p-4 h-44 overflow-y-auto font-mono text-xs space-y-1">
                  <div className="text-green-400 border-b border-white/10 pb-2 mb-2">
                    ● Mosquitto MQTT v2.0.18 — port 1883 — TLS on 8883
                  </div>
                  {mqttLogs.map((log, i) => (
                    <div key={i} className={log.includes("[publish]") ? "text-cyan-400" : log.includes("[connect]") ? "text-green-400" : log.includes("[broker]") ? "text-amber-400" : "text-muted-foreground"}>
                      {log}
                    </div>
                  ))}
                  <div className="animate-pulse text-white/30">_</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setMqttPlaying(p => !p)}>
                    {mqttPlaying ? <><Pause className="h-3 w-3 mr-1"/>Pause</> : <><Play className="h-3 w-3 mr-1"/>Resume</>}
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setMqttLogs(["[broker] Log cleared."])}>
                    <RotateCcw className="h-3 w-3 mr-1"/>Clear
                  </Button>
                </div>
                <TheoryBox title="Reading the Broker Log">
                  <p><strong className="text-foreground">[connect]</strong> lines show a new device establishing a TCP connection to the broker on port 1883. The broker assigns it a Client ID and keeps the connection alive using MQTT PINGREQ/PINGRESP packets every 60 seconds.</p>
                  <p className="mt-1.5"><strong className="text-foreground">[publish]</strong> lines show messages arriving. The topic path uses <strong className="text-foreground">forward-slash hierarchy</strong> (home/temp) — the broker uses this to route messages only to subscribers of that exact topic. Wildcards like <code className="text-accent text-xs">home/#</code> subscribe to all subtopics.</p>
                  <p className="mt-1.5">In production, port 8883 is used with <strong className="text-foreground">TLS encryption</strong> and X.509 certificates — especially important for industrial IoT where data tampering could be dangerous.</p>
                </TheoryBox>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 3: Interactive sensors ────────────────────────────────── */}
        <TabsContent value="interactive" className="space-y-8 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* DHT11 sliders */}
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="font-display text-lg">DHT22 Sensor Simulation</CardTitle>
                <CardDescription>Drag the sliders to change the virtual environment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-medium text-sm text-red-400">Air Temperature</label>
                    <span className="text-sm font-bold font-mono">{temperature[0]}°C</span>
                  </div>
                  <Slider value={temperature} onValueChange={setTemperature} max={50} min={-10} step={0.5}/>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>-10°C</span><span>50°C</span></div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-medium text-sm text-blue-400">Relative Humidity</label>
                    <span className="text-sm font-bold font-mono">{humidity[0]}%</span>
                  </div>
                  <Slider value={humidity} onValueChange={setHumidity} max={100} min={0} step={1}/>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>0% Dry</span><span>100% Saturated</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0a0f1a] rounded-lg p-3 text-center border border-white/10">
                    <div className="text-3xl font-bold font-mono text-red-400">{temperature[0].toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground mt-1">°C Temperature</div>
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-red-500 rounded-full transition-all duration-300"
                        style={{ width: `${((temperature[0] + 10) / 60) * 100}%` }}/>
                    </div>
                  </div>
                  <div className="bg-[#0a0f1a] rounded-lg p-3 text-center border border-white/10">
                    <div className="text-3xl font-bold font-mono text-blue-400">{humidity[0]}</div>
                    <div className="text-xs text-muted-foreground mt-1">% Humidity</div>
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${humidity[0]}%` }}/>
                    </div>
                  </div>
                </div>
                <TheoryBox title="How the DHT22 Works">
                  <p>The <strong className="text-foreground">DHT22 (AM2302)</strong> contains two sensors in one package: a <strong className="text-foreground">capacitive humidity element</strong> (a polymer film whose capacitance changes with moisture) and a <strong className="text-foreground">thermistor</strong> (a resistor whose resistance varies with temperature). A built-in 8-bit microcontroller inside the DHT22 reads both, converts to digital, and sends values using a custom single-wire protocol.</p>
                  <p className="mt-1.5"><strong className="text-foreground">Accuracy:</strong> ±0.5°C temperature, ±2% humidity. Upgrade from DHT11 (±2°C, ±5%). Sampling rate: once every 2 seconds minimum.</p>
                  <p className="mt-1.5">The <strong className="text-foreground">Heat Index</strong> — how hot it feels — is calculated from temperature + humidity together: <code className="text-accent text-xs">HI = -8.78 + 1.61T + 2.34H - 0.146TH...</code></p>
                </TheoryBox>
              </CardContent>
            </Card>

            {/* Serial monitor */}
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="font-display text-lg">Arduino Serial Monitor</CardTitle>
                <CardDescription>What you see in the Arduino IDE when your ESP32 is connected via USB</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-[#0a0f1a] p-4 rounded-xl border border-white/10 font-mono text-xs shadow-inner relative overflow-hidden min-h-[230px]">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-accent"/>
                  <div className="mb-3 text-muted-foreground border-b border-white/10 pb-2">
                    COM3 — 9600 baud — DTR/RTS — ESP32 Dev Module
                  </div>
                  <div className="space-y-1 text-green-400">
                    <div className="text-muted-foreground">&gt; Booting ESP32...</div>
                    <div className="text-muted-foreground">&gt; Flash: 4MB, PSRAM: none</div>
                    <div className="text-muted-foreground">&gt; Connecting to WiFi: HomeNet.....</div>
                    <div className="text-muted-foreground">&gt; IP: 192.168.1.42 | MAC: AA:BB:CC:DD:EE:FF</div>
                    <div className="text-muted-foreground">&gt; MQTT: broker.hivemq.com:1883 ✓</div>
                    <div>&gt; DHT22 init OK on GPIO 4</div>
                    <div>&gt; --- Reading sensor data ---</div>
                    <div className="text-white">
                      <span className="text-red-400">Temp: {temperature[0].toFixed(1)}°C</span>
                      <span className="text-white mx-2">|</span>
                      <span className="text-blue-400">Hum: {humidity[0].toFixed(1)}%</span>
                      <span className="text-white mx-2">|</span>
                      <span className="text-yellow-400">Heat Index: {(temperature[0] + (humidity[0] > 40 ? (humidity[0]-40)*0.1 : 0)).toFixed(1)}°C</span>
                    </div>
                    <div className="text-amber-400">&gt; Publishing to home/sensor/dht22...</div>
                    <div className="text-muted-foreground text-xs mt-2 whitespace-pre">{JSON.stringify({
                      device_id: "esp32-room1",
                      sensor: "DHT22",
                      temperature: temperature[0],
                      humidity: humidity[0],
                      heat_index: parseFloat((temperature[0] + (humidity[0] > 40 ? (humidity[0]-40)*0.1 : 0)).toFixed(1)),
                      unit: "Celsius",
                      uptime_s: 847,
                      rssi_dbm: -62,
                      ts: new Date().toISOString()
                    }, null, 2)}</div>
                  </div>
                </div>
                <TheoryBox title="Understanding the Serial Output">
                  <p>The <strong className="text-foreground">Serial Monitor</strong> in Arduino IDE shows text your program sends via the UART (Universal Asynchronous Receiver-Transmitter) at 9600 baud (9600 bits/second). Every <code className="text-accent text-xs">Serial.println()</code> in your code appears here.</p>
                  <p className="mt-1.5">The JSON payload above is what gets sent to the MQTT broker. <strong className="text-foreground">RSSI</strong> (Received Signal Strength Indicator) at -62 dBm means good WiFi signal (range: -30 excellent to -90 very weak). <strong className="text-foreground">Uptime</strong> tracks seconds since last reboot — useful for detecting unexpected crashes.</p>
                </TheoryBox>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
