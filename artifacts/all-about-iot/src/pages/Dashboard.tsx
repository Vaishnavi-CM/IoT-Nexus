import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Droplets, Thermometer, Wind, Sun, Info, Cpu, Wifi, Database, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const generateData = () =>
  Array.from({ length: 20 }).map((_, i) => ({
    time: i,
    temperature: 20 + Math.random() * 10,
    humidity: 40 + Math.random() * 20,
    pressure: 1000 + Math.random() * 50,
    light: Math.random() * 1000,
  }));

export default function Dashboard() {
  const [data, setData] = useState(generateData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        return [
          ...prev.slice(1),
          {
            time: last.time + 1,
            temperature: Math.max(15, Math.min(35, last.temperature + (Math.random() - 0.5) * 1.5)),
            humidity: Math.max(20, Math.min(90, last.humidity + (Math.random() - 0.5) * 2)),
            pressure: Math.max(990, Math.min(1040, last.pressure + (Math.random() - 0.5) * 2)),
            light: Math.max(0, Math.min(1000, last.light + (Math.random() - 0.5) * 80)),
          },
        ];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const current = data[data.length - 1];

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Real-Time IoT Dashboard
          </h1>
          <p className="text-muted-foreground">
            Educational simulation — demonstrating how a real IoT monitoring system works.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <span className="text-sm font-medium text-green-500">Simulation Running</span>
        </div>
      </div>

      {/* ── ABOUT THIS DASHBOARD ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mb-8 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5"
      >
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-blue-300 mb-1">About This Dashboard</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This is an <span className="text-blue-300 font-medium">educational simulation</span> demonstrating how a real IoT monitoring system looks and works.
              The sensor readings update every 2 seconds using a <span className="text-blue-300 font-medium">realistic random-walk algorithm</span> — meaning
              each new value drifts slightly from the last, just like real sensors behave. In a production IoT system,
              these readings would come from physical hardware devices over the internet.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── WHAT EACH SENSOR MEASURES ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <SensorExplainer
          icon={<Thermometer className="h-5 w-5 text-red-400" />}
          name="Temperature"
          range="20°C – 30°C"
          color="red"
          realHardware="DHT22 or DS18B20 temperature sensor"
          protocol="I2C or 1-Wire protocol → ESP32 ADC → MQTT publish"
          whatItMeans="Monitors indoor/outdoor air temperature. In real deployments used for smart HVAC, server room cooling, cold-chain monitoring, and greenhouse automation."
          currentValue={`${current.temperature.toFixed(1)}°C`}
        />
        <SensorExplainer
          icon={<Droplets className="h-5 w-5 text-blue-400" />}
          name="Humidity"
          range="40% – 60% RH"
          color="blue"
          realHardware="DHT22, SHT31, or HIH6130 capacitive humidity sensor"
          protocol="I2C interface → NodeMCU/ESP32 → MQTT to broker"
          whatItMeans="Relative humidity tells you how much water vapor is in the air. Critical for food storage, museums, data centers, and preventing condensation damage in electronics."
          currentValue={`${current.humidity.toFixed(1)}%`}
        />
        <SensorExplainer
          icon={<Wind className="h-5 w-5 text-purple-400" />}
          name="Atmospheric Pressure"
          range="990 – 1040 hPa"
          color="purple"
          realHardware="BMP280 or BMP388 barometric pressure sensor (I2C/SPI)"
          protocol="SPI/I2C → microcontroller → HTTP POST or MQTT to cloud"
          whatItMeans="Atmospheric pressure measured in hectopascals (hPa). Used in weather stations, altitude calculation for drones, and predicting storm fronts. Sea level = 1013.25 hPa."
          currentValue={`${current.pressure.toFixed(0)} hPa`}
        />
        <SensorExplainer
          icon={<Sun className="h-5 w-5 text-yellow-400" />}
          name="Light Intensity"
          range="0 – 1000 lux"
          color="yellow"
          realHardware="BH1750 or TSL2561 digital ambient light sensor (I2C)"
          protocol="I2C → Arduino/ESP8266 → WiFi → ThingSpeak or AWS IoT"
          whatItMeans="Measured in lux (lumens per square meter). Used for automatic street lighting (turns on below 50 lux), solar panel tracking, plant growth monitoring, and camera exposure control."
          currentValue={`${current.light.toFixed(0)} lx`}
        />
      </div>

      {/* Live metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <ValueCard title="Temperature" value={`${current.temperature.toFixed(1)}°C`} icon={<Thermometer className="text-red-500" />} color="text-red-500" />
        <ValueCard title="Humidity" value={`${current.humidity.toFixed(1)}%`} icon={<Droplets className="text-blue-500" />} color="text-blue-500" />
        <ValueCard title="Pressure" value={`${current.pressure.toFixed(0)} hPa`} icon={<Wind className="text-purple-500" />} color="text-purple-500" />
        <ValueCard title="Light Level" value={`${current.light.toFixed(0)} lx`} icon={<Sun className="text-yellow-500" />} color="text-yellow-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Temperature History" description="Simulates DHT22 readings — in a real system this comes from MQTT topic home/sensors/temperature">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" hide />
              <YAxis domain={[15, 35]} stroke="rgba(255,255,255,0.5)" tickFormatter={v => `${v}°C`} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} formatter={(v: number) => [`${v.toFixed(1)}°C`, "Temperature"]} />
              <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Humidity Trend" description="Simulates SHT31 capacitive sensor — humidity rises when rain is detected by a nearby weather station">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.5)" tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} formatter={(v: number) => [`${v.toFixed(1)}%`, "Humidity"]} />
              <Area type="monotone" dataKey="humidity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Light Intensity" description="Simulates BH1750 — real values: overcast outdoor (~1000 lx), office (~500 lx), moonlight (~0.1 lx)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" hide />
              <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={v => `${v}lx`} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} formatter={(v: number) => [`${v.toFixed(0)} lx`, "Light"]} />
              <Bar dataKey="light" fill="#eab308" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="bg-card/50 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="font-display text-lg">Simulated Device Network</CardTitle>
            <CardDescription>What a real IoT deployment looks like</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "ESP32 — Living Room", sensor: "DHT22 + BH1750", status: "Active", ping: "24ms", color: "green" },
                { name: "NodeMCU — Outdoor", sensor: "BMP280 + DS18B20", status: "Active", ping: "45ms", color: "green" },
                { name: "Arduino Uno — Garage", sensor: "MQ-2 + PIR", status: "Warning", ping: "120ms", color: "yellow" },
                { name: "Raspberry Pi — Server", sensor: "CPU + GPU Temp", status: "Active", ping: "8ms", color: "green" },
                { name: "ESP8266 — Garden", sensor: "Soil + Rain", status: "Offline", ping: "—", color: "red" },
              ].map((d, i) => (
                <div key={i} className="flex items-start justify-between p-3 bg-background/50 rounded-lg border border-white/5">
                  <div className="flex items-start gap-3">
                    <Activity className={`w-4 h-4 mt-0.5 shrink-0 ${d.color === "green" ? "text-green-500" : d.color === "yellow" ? "text-yellow-500" : "text-red-500"}`} />
                    <div>
                      <div className="text-sm font-medium">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.sensor}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="text-muted-foreground">{d.ping}</span>
                    <span className={`px-2 py-0.5 rounded ${d.color === "green" ? "bg-green-500/10 text-green-400" : d.color === "yellow" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How a real IoT dashboard works */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-xl border border-white/10 bg-card/30 p-6"
      >
        <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" /> How a Real IoT Dashboard Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-cyan-400">
              <Cpu className="h-4 w-4" /> Step 1 — Data Collection
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Physical sensors (DHT22, BMP280, BH1750) are wired to a microcontroller (ESP32 / NodeMCU).
              The microcontroller reads raw analog or digital values every few seconds using its ADC or I2C/SPI bus.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-purple-400">
              <Wifi className="h-4 w-4" /> Step 2 — Transmission
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Readings are packaged as JSON and sent over WiFi using the MQTT protocol to a broker
              (Mosquitto, AWS IoT Core, or HiveMQ). MQTT uses topics like <code className="text-accent text-xs">home/room1/temp</code> for routing.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-green-400">
              <Database className="h-4 w-4" /> Step 3 — Storage & Display
            </div>
            <p className="text-muted-foreground leading-relaxed">
              A backend server (Node.js / Python) subscribes to MQTT topics, stores values in a time-series
              database (InfluxDB, TimescaleDB), and serves them to a dashboard (Grafana, Node-RED, or this custom UI) via REST API.
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0"/>
          <p className="text-xs text-muted-foreground">
            <span className="text-amber-400 font-medium">Simulation note:</span> All readings on this dashboard are mathematically generated
            using a random-walk model to mimic real sensor behavior (slow, continuous drift with small variance).
            No physical sensors are connected. To build a real version, connect an ESP32 with a DHT22 and this exact architecture.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function SensorExplainer({ icon, name, range, color, realHardware, protocol, whatItMeans, currentValue }: {
  icon: React.ReactNode; name: string; range: string; color: string;
  realHardware: string; protocol: string; whatItMeans: string; currentValue: string;
}) {
  const borderColor = { red: "border-red-500/20 bg-red-500/5", blue: "border-blue-500/20 bg-blue-500/5",
    purple: "border-purple-500/20 bg-purple-500/5", yellow: "border-yellow-500/20 bg-yellow-500/5" }[color] ?? "";
  const textColor = { red: "text-red-400", blue: "text-blue-400", purple: "text-purple-400", yellow: "text-yellow-400" }[color] ?? "";
  return (
    <Card className={`border ${borderColor} bg-card/20`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">{icon} {name}</div>
          <div className={`text-xl font-mono font-bold ${textColor}`}>{currentValue}</div>
        </div>
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div><span className="text-foreground/70 font-medium">Simulated range:</span> {range}</div>
          <div><span className="text-foreground/70 font-medium">Real hardware:</span> {realHardware}</div>
          <div><span className="text-foreground/70 font-medium">Data path:</span> <span className="font-mono">{protocol}</span></div>
          <div className="pt-1 border-t border-white/5"><span className="text-foreground/70 font-medium">Real-world use:</span> {whatItMeans}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ValueCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card className="bg-card/50 backdrop-blur border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground text-sm font-medium">{title}</span>
          <div className="p-2 bg-background rounded-full">{icon}</div>
        </div>
        <div className={`text-3xl font-bold font-display ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="bg-card/50 backdrop-blur border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[260px]">{children}</CardContent>
    </Card>
  );
}
