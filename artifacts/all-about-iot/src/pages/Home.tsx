import { useGetSiteStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen, Layers, Cpu, Wifi, Shield, Brain,
  ChevronRight, Zap, BarChart2, MessageSquare,
  PlayCircle, GraduationCap, ArrowRight,
} from "lucide-react";

// ── Canvas IoT Network ─────────────────────────────────────────────────────────

interface Node {
  x: number; y: number; vx: number; vy: number;
  r: number; pulsePhase: number; label: string;
}

interface Packet {
  from: number; to: number; t: number; speed: number;
}

const ICONS_LABELS = ["ESP32", "Sensor", "Cloud", "MQTT", "Edge", "MCU", "API", "Hub", "Node"];

function IoTCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const packetsRef = useRef<Packet[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      initNodes();
    };

    const initNodes = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      const count = Math.min(14, Math.max(8, Math.floor(w / 100)));
      nodesRef.current = Array.from({ length: count }, (_, i) => ({
        x: 60 + Math.random() * (w - 120),
        y: 60 + Math.random() * (h - 120),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 18 + Math.random() * 8,
        pulsePhase: Math.random() * Math.PI * 2,
        label: ICONS_LABELS[i % ICONS_LABELS.length],
      }));
    };

    const spawnPacket = () => {
      const nodes = nodesRef.current;
      if (nodes.length < 2) return;
      const from = Math.floor(Math.random() * nodes.length);
      let to = Math.floor(Math.random() * nodes.length);
      while (to === from) to = Math.floor(Math.random() * nodes.length);
      packetsRef.current.push({ from, to, t: 0, speed: 0.004 + Math.random() * 0.005 });
    };

    let packetTimer = 0;
    let time = 0;

    const isDark = () => document.documentElement.classList.contains("dark");

    const loop = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      time += 0.016;
      packetTimer += 0.016;
      if (packetTimer > 1.2) { spawnPacket(); packetTimer = 0; }

      const dark = isDark();
      const nodes = nodesRef.current;
      const packets = packetsRef.current;

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 40 || n.x > w - 40) n.vx *= -1;
        if (n.y < 40 || n.y > h - 40) n.vy *= -1;
        n.pulsePhase += 0.02;
      });

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 200) {
            const alpha = (1 - dist / 200) * (dark ? 0.25 : 0.12);
            ctx.beginPath();
            ctx.strokeStyle = dark
              ? `rgba(0,212,255,${alpha})`
              : `rgba(0,100,200,${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw packets
      packetsRef.current = packets.filter(p => {
        p.t += p.speed;
        if (p.t >= 1) return false;
        const a = nodes[p.from], b = nodes[p.to];
        if (!a || !b) return false;
        const px = a.x + (b.x - a.x) * p.t;
        const py = a.y + (b.y - a.y) * p.t;
        ctx.beginPath();
        const g = ctx.createRadialGradient(px, py, 0, px, py, 6);
        g.addColorStop(0, dark ? "rgba(0,212,255,0.9)" : "rgba(0,100,220,0.9)");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      // Draw nodes
      nodes.forEach(n => {
        const pulse = Math.sin(n.pulsePhase) * 4;

        // Pulse ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + pulse + 6, 0, Math.PI * 2);
        ctx.strokeStyle = dark ? "rgba(0,212,255,0.15)" : "rgba(0,100,200,0.1)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node circle
        const grad = ctx.createRadialGradient(n.x - 3, n.y - 3, 2, n.x, n.y, n.r);
        grad.addColorStop(0, dark ? "rgba(30,60,100,0.95)" : "rgba(200,230,255,0.95)");
        grad.addColorStop(1, dark ? "rgba(10,20,50,0.9)" : "rgba(160,200,240,0.9)");
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = dark ? "rgba(0,212,255,0.5)" : "rgba(0,100,200,0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = dark ? "rgba(0,212,255,0.9)" : "rgba(0,80,180,0.9)";
        ctx.font = `bold ${Math.floor(n.r * 0.55)}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n.label, n.x, n.y);
      });

      animRef.current = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-60"
      style={{ display: "block" }}
    />
  );
}

// ── Animated counter ───────────────────────────────────────────────────────────

function Counter({ to, duration = 1.5 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0 });

  useEffect(() => {
    if (inView) motionVal.set(to);
  }, [inView, to, motionVal]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v).toString();
    });
  }, [spring]);

  return <span ref={ref}>0</span>;
}

// ── Floating device icon ───────────────────────────────────────────────────────

function FloatingIcon({ icon, style, delay = 0 }: {
  icon: React.ReactNode;
  style: React.CSSProperties;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute hidden lg:flex items-center justify-center rounded-2xl border bg-card/60 backdrop-blur shadow-lg pointer-events-none"
      style={{ width: 56, height: 56, ...style }}
      animate={{ y: [0, -14, 0], rotate: [0, 3, -3, 0] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {icon}
    </motion.div>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  color: string;
}

function FeatureCard({ f, idx }: { f: Feature; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: idx * 0.07 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group"
    >
      <Link href={f.href}>
        <div className="relative h-full rounded-2xl border border-white/10 bg-card/40 backdrop-blur p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:border-white/25 hover:shadow-xl hover:shadow-primary/5">
          {/* Hover gradient wash */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${f.color}`} />
          {/* Icon */}
          <div className={`relative z-10 mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${f.color.replace("bg-gradient-to-br", "")} border border-white/10 shadow-md`}>
            {f.icon}
          </div>
          <h3 className="relative z-10 text-lg font-bold font-display mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
          <p className="relative z-10 text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
          <span className="relative z-10 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Explore <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, color }: {
  icon: React.ReactNode; value: number; label: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.05 }}
      className="relative rounded-2xl border border-white/10 bg-card/40 backdrop-blur p-6 text-center overflow-hidden"
    >
      <div className={`absolute inset-0 opacity-10 ${color}`} />
      <div className="relative z-10">
        <div className="flex justify-center mb-3">{icon}</div>
        <div className="text-4xl font-bold font-mono mb-1">
          <Counter to={value} />
          <span className="text-primary">+</span>
        </div>
        <div className="text-sm text-muted-foreground font-medium">{label}</div>
      </div>
    </motion.div>
  );
}

// ── Tech pill ─────────────────────────────────────────────────────────────────

function TechPill({ label, color }: { label: string; color: string }) {
  return (
    <motion.span
      whileHover={{ scale: 1.08 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </motion.span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const features: Feature[] = [
  {
    icon: <BookOpen className="w-6 h-6 text-cyan-400" />,
    title: "Concepts Library",
    desc: "11 in-depth articles covering sensors, protocols, cloud, security, and more. Track your progress as you learn.",
    href: "/concepts",
    color: "bg-gradient-to-br from-cyan-500/10 to-transparent",
  },
  {
    icon: <GraduationCap className="w-6 h-6 text-violet-400" />,
    title: "Masterclass",
    desc: "Structured learning path from IoT basics to advanced edge computing and TinyML implementations.",
    href: "/learn",
    color: "bg-gradient-to-br from-violet-500/10 to-transparent",
  },
  {
    icon: <PlayCircle className="w-6 h-6 text-emerald-400" />,
    title: "Simulations",
    desc: "Live interactive simulations — MCU logic, RF signal propagation, and MQTT pub/sub messaging.",
    href: "/simulations",
    color: "bg-gradient-to-br from-emerald-500/10 to-transparent",
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-orange-400" />,
    title: "IoT Dashboard",
    desc: "Real-time sensor dashboard with temperature, humidity, air quality, motion and light readings.",
    href: "/dashboard",
    color: "bg-gradient-to-br from-orange-500/10 to-transparent",
  },
  {
    icon: <Layers className="w-6 h-6 text-pink-400" />,
    title: "Knowledge Quiz",
    desc: "Test yourself with categorised questions, get instant feedback, and track your score history.",
    href: "/quiz",
    color: "bg-gradient-to-br from-pink-500/10 to-transparent",
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-yellow-400" />,
    title: "AI Chatbot",
    desc: "Built-in IoT expert covering 20+ topics — sensors, MQTT, edge, TinyML, security and more.",
    href: "/chatbot",
    color: "bg-gradient-to-br from-yellow-500/10 to-transparent",
  },
];

const techPills = [
  { label: "ESP32", color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/5" },
  { label: "Arduino", color: "border-blue-500/30 text-blue-400 bg-blue-500/5" },
  { label: "MQTT", color: "border-violet-500/30 text-violet-400 bg-violet-500/5" },
  { label: "Raspberry Pi", color: "border-red-500/30 text-red-400 bg-red-500/5" },
  { label: "TinyML", color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" },
  { label: "LoRa", color: "border-orange-500/30 text-orange-400 bg-orange-500/5" },
  { label: "Zigbee", color: "border-yellow-500/30 text-yellow-400 bg-yellow-500/5" },
  { label: "AWS IoT", color: "border-pink-500/30 text-pink-400 bg-pink-500/5" },
  { label: "DHT22", color: "border-teal-500/30 text-teal-400 bg-teal-500/5" },
  { label: "Edge AI", color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/5" },
  { label: "FreeRTOS", color: "border-lime-500/30 text-lime-400 bg-lime-500/5" },
  { label: "BLE", color: "border-sky-500/30 text-sky-400 bg-sky-500/5" },
];

export default function Home() {
  const { data: stats, isLoading } = useGetSiteStats();
  const [typed, setTyped] = useState("");
  const phrases = ["Sensors", "Microcontrollers", "MQTT", "Edge AI", "IoT Security"];
  const phraseRef = useRef(0);
  const charRef = useRef(0);
  const deletingRef = useRef(false);

  // Typewriter effect
  useEffect(() => {
    const tick = () => {
      const phrase = phrases[phraseRef.current];
      if (!deletingRef.current) {
        charRef.current++;
        setTyped(phrase.slice(0, charRef.current));
        if (charRef.current === phrase.length) {
          deletingRef.current = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charRef.current--;
        setTyped(phrase.slice(0, charRef.current));
        if (charRef.current === 0) {
          deletingRef.current = false;
          phraseRef.current = (phraseRef.current + 1) % phrases.length;
        }
      }
      setTimeout(tick, deletingRef.current ? 60 : 90);
    };
    const t = setTimeout(tick, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Canvas network bg */}
        <div className="absolute inset-0">
          <IoTCanvas />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-accent/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-chart-3/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Floating device icons */}
        <FloatingIcon icon={<Cpu className="w-6 h-6 text-cyan-400" />} style={{ top: "18%", left: "8%" }} delay={0} />
        <FloatingIcon icon={<Wifi className="w-6 h-6 text-violet-400" />} style={{ top: "28%", right: "9%" }} delay={1.2} />
        <FloatingIcon icon={<Shield className="w-6 h-6 text-emerald-400" />} style={{ bottom: "30%", left: "6%" }} delay={2.4} />
        <FloatingIcon icon={<Brain className="w-6 h-6 text-orange-400" />} style={{ bottom: "28%", right: "7%" }} delay={0.7} />
        <FloatingIcon icon={<Zap className="w-6 h-6 text-yellow-400" />} style={{ top: "55%", left: "14%" }} delay={1.8} />
        <FloatingIcon icon={<BarChart2 className="w-6 h-6 text-pink-400" />} style={{ top: "60%", right: "12%" }} delay={3} />

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm font-medium text-primary backdrop-blur"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            The Complete IoT Learning Platform
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold font-display leading-none mb-6"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-accent">
              All About
            </span>
            <br />
            <span className="text-foreground">IoT</span>
          </motion.h1>

          {/* Typewriter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-muted-foreground mb-4 h-8 flex items-center justify-center gap-2"
          >
            <span>Master</span>
            <span className="text-primary font-semibold min-w-[180px] text-left">
              {typed}<span className="animate-pulse">|</span>
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Interactive simulations, real-time dashboards, concept deep-dives,
            AI chatbot, and quizzes — everything you need to learn IoT from scratch to expert.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <Link href="/concepts">
              <Button size="lg" className="text-lg px-8 h-14 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-shadow rounded-xl">
                Start Learning <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/simulations">
              <Button variant="outline" size="lg" className="text-lg px-8 h-14 border-primary/25 hover:bg-primary/10 rounded-xl backdrop-blur">
                <PlayCircle className="mr-2 w-5 h-5" /> Try Simulations
              </Button>
            </Link>
          </motion.div>

          {/* Tech pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto"
          >
            {techPills.map((p) => <TechPill key={p.label} {...p} />)}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground/50 text-xs"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-muted-foreground/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-muted-foreground/40" />
          </motion.div>
          scroll
        </motion.div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-24 max-w-5xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-3">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">master IoT</span>
          </h2>
          <p className="text-muted-foreground">All content built-in — no sign-up, no paywall.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-card/30 animate-pulse" />
            ))
          ) : stats ? (
            <>
              <StatCard icon={<BookOpen className="w-8 h-8 text-cyan-400" />} value={stats.totalConcepts} label="IoT Concepts" color="bg-cyan-500" />
              <StatCard icon={<Layers className="w-8 h-8 text-violet-400" />} value={stats.totalCategories} label="Categories" color="bg-violet-500" />
              <StatCard icon={<Cpu className="w-8 h-8 text-emerald-400" />} value={20} label="Chatbot Topics" color="bg-emerald-500" />
              <StatCard icon={<Zap className="w-8 h-8 text-orange-400" />} value={stats.totalQuestionsAnswered ?? 0} label="Quizzes Answered" color="bg-orange-500" />
            </>
          ) : null}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-24 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            What's inside
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
            Six ways to learn IoT
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From reading to doing — every section is packed with practical, hands-on content.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => <FeatureCard key={f.title} f={f} idx={i} />)}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
              Your learning journey
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Three steps from beginner to IoT engineer.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-10 left-[16.5%] right-[16.5%] h-0.5 bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40" />

            {[
              { step: "01", icon: <BookOpen className="w-7 h-7" />, title: "Learn the theory", desc: "Read structured concept articles with animations, key takeaways, and real-world context.", color: "from-cyan-500 to-blue-500" },
              { step: "02", icon: <PlayCircle className="w-7 h-7" />, title: "Simulate & explore", desc: "Run interactive simulations and study live dashboards to see how real IoT systems work.", color: "from-violet-500 to-purple-500" },
              { step: "03", icon: <Zap className="w-7 h-7" />, title: "Test your knowledge", desc: "Take quizzes, challenge the AI chatbot, and track your improvement with score history.", color: "from-orange-500 to-pink-500" },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className={`mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg text-white relative z-10`}>
                  {s.icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">{s.step}</span>
                </div>
                <h3 className="text-xl font-bold font-display mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-24 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-10 md:p-16 text-center"
        >
          {/* Corner glow */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <span className="text-5xl mb-6 block">🚀</span>
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Ready to become an IoT expert?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Start with the basics or jump straight into advanced topics. Everything is free, always.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/concepts">
                <Button size="lg" className="px-8 h-13 text-base shadow-xl shadow-primary/25 rounded-xl">
                  Explore Concepts <ChevronRight className="ml-2" />
                </Button>
              </Link>
              <Link href="/chatbot">
                <Button variant="outline" size="lg" className="px-8 h-13 text-base rounded-xl border-primary/20 hover:bg-primary/10">
                  <MessageSquare className="mr-2 w-4 h-4" /> Ask the AI
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
