import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  TrendingUp, 
  PlusCircle, 
  Lightbulb, 
  Clock, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2,
  Zap,
  Calendar
} from "lucide-react";

const COLORS = {
  bg: "#0a0e1a",
  surface: "#111827",
  card: "#161d2e",
  border: "#1e2d45",
  accent: "#00d4ff",
  accentGlow: "#00d4ff33",
  green: "#00e5a0",
  greenGlow: "#00e5a022",
  amber: "#ffb547",
  red: "#ff4d6d",
  text: "#e8f0ff",
  textMuted: "#6b7fa3",
  textDim: "#3a4a6b",
};

const GLUCOSE_DATA = [
  { time: "6am", value: 95, meal: null },
  { time: "7am", value: 110, meal: "Breakfast" },
  { time: "8am", value: 148, meal: null },
  { time: "9am", value: 132, meal: null },
  { time: "10am", value: 105, meal: null },
  { time: "11am", value: 98, meal: null },
  { time: "12pm", value: 118, meal: "Lunch" },
  { time: "1pm", value: 165, meal: null },
  { time: "2pm", value: 142, meal: null },
  { time: "3pm", value: 121, meal: null },
  { time: "4pm", value: 108, meal: null },
  { time: "5pm", value: 103, meal: null },
  { time: "6pm", value: 127, meal: "Dinner" },
  { time: "7pm", value: 158, meal: null },
  { time: "8pm", value: 134, meal: null },
  { time: "9pm", value: 112, meal: null },
];

const MEALS = [
  { name: "Breakfast", time: "7:15 AM", gi: 52, carbs: 45, glucose_impact: "+38", icon: "🥣" },
  { name: "Lunch", time: "12:30 PM", gi: 38, carbs: 62, glucose_impact: "+47", icon: "🥗" },
  { name: "Dinner", time: "6:45 PM", gi: 44, carbs: 58, glucose_impact: "+31", icon: "🍱" },
];

const METRICS = [
  { label: "Time in Range", value: "78%", sub: "Target: 70%+", color: COLORS.green, icon: <Activity className="w-5 h-5" /> },
  { label: "Average Glucose", value: "118", sub: "mg/dL today", color: COLORS.accent, icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Glucose Variability", value: "Low", sub: "CV: 14.2%", color: COLORS.green, icon: <Zap className="w-5 h-5" /> },
  { label: "HbA1c Est.", value: "5.4%", sub: "Normal range", color: COLORS.green, icon: <Activity className="w-5 h-5" /> },
];

function GlucoseChart({ data }: { data: typeof GLUCOSE_DATA }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const min = 70, max = 200;
  const w = 700, h = 160;
  const pad = { l: 10, r: 10, t: 20, b: 10 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const toX = (i: number) => pad.l + (i / (data.length - 1)) * innerW;
  const toY = (v: number) => pad.t + innerH - ((v - min) / (max - min)) * innerH;

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.value)}`).join(" ");
  const areaD = pathD + ` L${toX(data.length - 1)},${h} L${toX(0)},${h} Z`;

  const inRange = (v: number) => v >= 70 && v <= 140;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.3" />
            <stop offset="100%" stopColor={COLORS.accent} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={COLORS.green} />
            <stop offset="50%" stopColor={COLORS.accent} />
            <stop offset="100%" stopColor={COLORS.amber} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Target range band */}
        <rect
          x={pad.l} y={toY(140)}
          width={innerW} height={toY(70) - toY(140)}
          fill={COLORS.green} opacity="0.05"
          rx="2"
        />
        <line x1={pad.l} y1={toY(140)} x2={pad.l + innerW} y2={toY(140)}
          stroke={COLORS.green} strokeWidth="1" strokeDasharray="4,6" opacity="0.3" />
        <line x1={pad.l} y1={toY(70)} x2={pad.l + innerW} y2={toY(70)}
          stroke={COLORS.amber} strokeWidth="1" strokeDasharray="4,6" opacity="0.3" />

        {/* Area fill */}
        <path d={areaD} fill="url(#lineGrad)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="url(#lineColor)" strokeWidth="2.5"
          filter="url(#glow)" strokeLinejoin="round" strokeLinecap="round" />

        {/* Data points */}
        {data.map((d, i) => (
          <g key={i} className="cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}>
            <circle cx={toX(i)} cy={toY(d.value)} r="12" fill="transparent" />
            {d.meal && (
              <circle cx={toX(i)} cy={toY(d.value)} r="5"
                fill={COLORS.amber} filter="url(#glow)" />
            )}
            {hovered === i && (
              <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <circle cx={toX(i)} cy={toY(d.value)} r="5"
                  fill={inRange(d.value) ? COLORS.green : COLORS.red}
                  filter="url(#glow)" />
                <rect x={toX(i) - 28} y={toY(d.value) - 36} width="56" height="28"
                  fill={COLORS.card} rx="6" stroke={COLORS.border} strokeWidth="1" />
                <text x={toX(i)} y={toY(d.value) - 22} textAnchor="middle"
                  fill={inRange(d.value) ? COLORS.green : COLORS.red}
                  fontSize="12" fontWeight="700" className="font-mono">
                  {d.value}
                </text>
                <text x={toX(i)} y={toY(d.value) - 12} textAnchor="middle"
                  fill={COLORS.textMuted} fontSize="9" className="font-mono">
                  {d.time}
                </text>
              </motion.g>
            )}
          </g>
        ))}
      </svg>

      {/* X labels */}
      <div className="flex justify-between mt-1 px-[10px]">
        {data.filter((_, i) => i % 4 === 0).map((d, i) => (
          <span key={i} className="text-[10px] text-[#6b7fa3] font-mono">
            {d.time}
          </span>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ metric, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="bg-[#161d2e] border border-[#1e2d45] rounded-2xl p-5 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${metric.color}, transparent)` }} />
      <div className="text-xl mb-2" style={{ color: metric.color }}>{metric.icon}</div>
      <div className="text-2xl font-extrabold font-mono leading-none" style={{ color: metric.color }}>
        {metric.value}
      </div>
      <div className="text-xs text-[#e8f0ff] mt-1 font-semibold">
        {metric.label}
      </div>
      <div className="text-[11px] text-[#6b7fa3] mt-0.5">
        {metric.sub}
      </div>
    </motion.div>
  );
}

function GlucoseGauge({ value = 118 }) {
  const radius = 70;
  const strokeWidth = 10;
  const cx = 90, cy = 90;
  const startAngle = -220, endAngle = 40;
  const totalDeg = endAngle - startAngle;
  const pct = Math.min((value - 60) / (200 - 60), 1);
  const angle = startAngle + pct * totalDeg;

  const polarToXY = (deg: number, r: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (start: number, end: number, r: number) => {
    const s = polarToXY(start, r);
    const e = polarToXY(end, r);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const needleTip = polarToXY(angle, radius - 5);
  const needleBase1 = polarToXY(angle + 90, 6);
  const needleBase2 = polarToXY(angle - 90, 6);

  const color = value < 70 ? COLORS.amber : value > 140 ? COLORS.red : COLORS.green;

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="130" viewBox="0 0 180 130">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={COLORS.amber} />
            <stop offset="40%" stopColor={COLORS.green} />
            <stop offset="100%" stopColor={COLORS.red} />
          </linearGradient>
          <filter id="needleGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path d={arcPath(startAngle, endAngle, radius)}
          fill="none" stroke={COLORS.border} strokeWidth={strokeWidth} strokeLinecap="round" />

        {/* Value arc */}
        <path d={arcPath(startAngle, angle, radius)}
          fill="none" stroke="url(#gaugeGrad)" strokeWidth={strokeWidth} strokeLinecap="round" />

        {/* Needle */}
        <motion.polygon
          animate={{ points: `${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${cx},${cy} ${needleBase2.x},${needleBase2.y}` }}
          fill={color} filter="url(#needleGlow)" opacity="0.9"
        />
        <circle cx={cx} cy={cy} r="7" fill={COLORS.card} stroke={color} strokeWidth="2" />

        {/* Labels */}
        {[70, 100, 140, 180].map((v) => {
          const p = (v - 60) / 140;
          const a = startAngle + p * totalDeg;
          const pos = polarToXY(a, radius + 16);
          return (
            <text key={v} x={pos.x} y={pos.y + 3} textAnchor="middle"
              fill={COLORS.textDim} fontSize="9" className="font-mono">{v}</text>
          );
        })}
      </svg>

      <div className="text-center -mt-2">
        <div className="text-[42px] font-black font-mono leading-none" style={{ color }}>
          {value}
        </div>
        <div className="text-xs text-[#6b7fa3] tracking-[2px]">MG/DL</div>
        <div className="mt-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider" 
          style={{ background: `${color}22`, border: `1px solid ${color}44`, color }}>
          {value < 70 ? "⚠ LOW" : value > 140 ? "⚠ HIGH" : "✓ IN RANGE"}
        </div>
      </div>
    </div>
  );
}

function InsightCard({ icon, title, body, color, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000, duration: 0.4 }}
      className="flex gap-3.5 p-4 bg-[#161d2e] border border-[#1e2d45] rounded-xl"
    >
      <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg" 
        style={{ background: `${color}18`, border: `1px solid ${color}33`, color }}>
        {icon}
      </div>
      <div>
        <div className="text-[13px] font-bold text-[#e8f0ff]">{title}</div>
        <div className="text-xs text-[#6b7fa3] mt-0.5 leading-relaxed">{body}</div>
      </div>
    </motion.div>
  );
}

export default function GlucoScan() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [liveGlucose, setLiveGlucose] = useState(118);
  const [trend, setTrend] = useState("stable");
  const [scanning, setScanning] = useState(false);
  const [logEntry, setLogEntry] = useState({ meal: "", carbs: "", notes: "" });
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveGlucose(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = Math.max(70, Math.min(180, prev + delta));
        setTrend(delta > 1 ? "rising" : delta < -1 ? "falling" : "stable");
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2000);
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <Activity className="w-4 h-4" /> },
    { id: "trends", label: "Trends", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "meals", label: "Meals", icon: <PlusCircle className="w-4 h-4" /> },
    { id: "insights", label: "Insights", icon: <Lightbulb className="w-4 h-4" /> },
  ];

  const trendIcon = trend === "rising" ? <TrendingUp className="w-5 h-5" /> : trend === "falling" ? <TrendingUp className="w-5 h-5 rotate-180" /> : <ChevronRight className="w-5 h-5" />;
  const trendColor = trend === "rising" ? COLORS.amber : trend === "falling" ? COLORS.accent : COLORS.green;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#e8f0ff] flex flex-col font-sans selection:bg-[#00d4ff]/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2d45; border-radius: 2px; }

        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }
      `}</style>

      {/* Header */}
      <header className="px-6 pt-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-br from-[#00d4ff] to-[#00e5a0] bg-clip-text text-transparent">
            GlucoScan
          </h1>
          <p className="text-[11px] text-[#6b7fa3] tracking-[1.5px] mt-0.5 uppercase font-bold">
            Metabolic Intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00e5a0] animate-[pulse-ring_2s_ease-in-out_infinite] shadow-[0_0_8px_#00e5a0]" />
            <span className="text-[11px] text-[#00e5a0] font-mono font-bold">LIVE</span>
          </div>

          <div className="px-3 py-1.5 bg-[#161d2e] border border-[#1e2d45] rounded-full text-xs text-[#6b7fa3] flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            March 3, 2026
          </div>
        </div>
      </header>

      {/* Nav tabs */}
      <nav className="flex gap-1 px-6 py-4 border-b border-[#1e2d45]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
              activeTab === tab.id 
                ? "bg-[#00d4ff] text-[#0a0e1a]" 
                : "text-[#6b7fa3] hover:bg-[#161d2e]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 px-6 py-5 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-5"
          >
            {/* DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <>
                {/* Hero: current reading + scan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gauge card */}
                  <div className="bg-[#161d2e] border border-[#1e2d45] rounded-[20px] p-6 flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/50 to-transparent" />
                    <div className="text-[11px] text-[#6b7fa3] tracking-[2px] mb-2 font-mono uppercase">
                      Current Glucose
                    </div>
                    <GlucoseGauge value={liveGlucose} />
                    <div className="mt-3 flex items-center gap-2 text-[13px] font-semibold" style={{ color: trendColor }}>
                      {trendIcon}
                      {trend === "stable" ? "Stable" : trend === "rising" ? "Rising" : "Falling"}
                      <span className="text-[#6b7fa3] text-[11px] ml-1 font-normal">
                        · Updated 3s ago
                      </span>
                    </div>
                  </div>

                  {/* Scan button */}
                  <div className="bg-[#161d2e] border border-[#1e2d45] rounded-[20px] p-6 flex flex-col items-center justify-center gap-4">
                    <div className="text-xs text-[#6b7fa3] text-center tracking-wider uppercase">
                      Manual Scan
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleScan}
                      className={`w-24 h-24 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 relative ${
                        scanning 
                          ? "border-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.2)]" 
                          : "border-[#1e2d45]"
                      }`}
                      style={{ 
                        background: scanning 
                          ? `radial-gradient(circle, ${COLORS.accentGlow}, ${COLORS.card})` 
                          : `radial-gradient(circle, ${COLORS.accentGlow}, transparent)` 
                      }}
                    >
                      {scanning && (
                        <div className="absolute -inset-2.5 rounded-full border-2 border-[#00d4ff]/30 animate-[pulse-ring_1s_ease-in-out_infinite]" />
                      )}
                      <div className={`text-3xl ${scanning ? "animate-spin" : ""}`}>
                        {scanning ? <Zap className="w-8 h-8 text-[#00d4ff]" /> : <Activity className="w-8 h-8 text-[#6b7fa3]" />}
                      </div>
                      <span className={`text-[10px] font-mono mt-1 ${scanning ? "text-[#00d4ff]" : "text-[#6b7fa3]"}`}>
                        {scanning ? "SCANNING" : "SCAN"}
                      </span>
                    </motion.button>

                    <div className="text-center">
                      <div className="text-[11px] text-[#6b7fa3]">
                        Last scan: 2 min ago
                      </div>
                      <div className="text-[11px] text-[#6b7fa3] mt-0.5">
                        Sensor: Day 4/14
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {METRICS.map((m, i) => (
                    <MetricCard key={i} metric={m} delay={i * 100} />
                  ))}
                </div>

                {/* Today's chart preview */}
                <div className="bg-[#161d2e] border border-[#1e2d45] rounded-[20px] p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-bold">Today's Pattern</h3>
                      <p className="text-[11px] text-[#6b7fa3] mt-0.5">
                        <span className="text-[#ffb547]">● </span>Meal spikes marked
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("trends")}
                      className="px-3 py-1.5 border border-[#1e2d45] rounded-lg text-[#00d4ff] text-xs hover:bg-[#1e2d45] transition-colors"
                    >
                      Full view →
                    </button>
                  </div>
                  <GlucoseChart data={GLUCOSE_DATA} />
                </div>
              </>
            )}

            {/* TRENDS TAB */}
            {activeTab === "trends" && (
              <>
                <div className="bg-[#161d2e] border border-[#1e2d45] rounded-[20px] p-6">
                  <h3 className="text-base font-bold mb-1">24-Hour Glucose Curve</h3>
                  <p className="text-xs text-[#6b7fa3] mb-5">
                    Green band = target range (70–140 mg/dL)
                  </p>
                  <GlucoseChart data={GLUCOSE_DATA} />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Peak", value: "165", unit: "mg/dL", sub: "1:00 PM post-lunch", color: COLORS.amber },
                    { label: "Trough", value: "95", unit: "mg/dL", sub: "6:00 AM fasting", color: COLORS.accent },
                    { label: "Std Dev", value: "±18", unit: "mg/dL", sub: "Low variability", color: COLORS.green },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#161d2e] border border-[#1e2d45] rounded-2xl p-4 text-center">
                      <div className="text-2xl font-extrabold font-mono" style={{ color: s.color }}>
                        {s.value}
                      </div>
                      <div className="text-[10px] text-[#6b7fa3] font-mono uppercase">{s.unit}</div>
                      <div className="text-xs font-bold text-[#e8f0ff] mt-1">{s.label}</div>
                      <div className="text-[10px] text-[#6b7fa3] mt-0.5">{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Weekly summary bars */}
                <div className="bg-[#161d2e] border border-[#1e2d45] rounded-[20px] p-6">
                  <h3 className="text-sm font-bold mb-5">7-Day Time in Range</h3>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { day: "Mon", pct: 82 },
                      { day: "Tue", pct: 74 },
                      { day: "Wed", pct: 91 },
                      { day: "Thu", pct: 68 },
                      { day: "Fri", pct: 85 },
                      { day: "Sat", pct: 77 },
                      { day: "Sun", pct: 78 },
                    ].map((d, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 text-[11px] text-[#6b7fa3] font-mono flex-shrink-0">{d.day}</div>
                        <div className="flex-1 h-2 bg-[#1e2d45] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${d.pct}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="h-full rounded-full"
                            style={{ 
                              background: d.pct >= 70 
                                ? `linear-gradient(90deg, ${COLORS.green}, ${COLORS.accent})` 
                                : `linear-gradient(90deg, ${COLORS.amber}, ${COLORS.red})` 
                            }}
                          />
                        </div>
                        <div className="w-9 text-xs font-bold font-mono text-right" style={{ color: d.pct >= 70 ? COLORS.green : COLORS.amber }}>
                          {d.pct}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* MEALS TAB */}
            {activeTab === "meals" && (
              <>
                {/* Log a meal */}
                <div className="bg-[#161d2e] border border-[#1e2d45] rounded-[20px] p-6">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-[#00d4ff]" />
                    Log a Meal
                  </h3>
                  <div className="flex flex-col gap-3">
                    <input
                      value={logEntry.meal}
                      onChange={e => setLogEntry(p => ({ ...p, meal: e.target.value }))}
                      placeholder="What did you eat?"
                      className="bg-[#111827] border border-[#1e2d45] rounded-xl px-4 py-3 text-[#e8f0ff] text-sm focus:border-[#00d4ff] transition-colors outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={logEntry.carbs}
                        onChange={e => setLogEntry(p => ({ ...p, carbs: e.target.value }))}
                        placeholder="Carbs (g)"
                        type="number"
                        className="bg-[#111827] border border-[#1e2d45] rounded-xl px-4 py-3 text-[#e8f0ff] text-sm focus:border-[#00d4ff] transition-colors outline-none"
                      />
                      <input
                        value={logEntry.notes}
                        onChange={e => setLogEntry(p => ({ ...p, notes: e.target.value }))}
                        placeholder="Notes"
                        className="bg-[#111827] border border-[#1e2d45] rounded-xl px-4 py-3 text-[#e8f0ff] text-sm focus:border-[#00d4ff] transition-colors outline-none"
                      />
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { 
                        setLogged(true); 
                        setLogEntry({ meal: "", carbs: "", notes: "" }); 
                        setTimeout(() => setLogged(false), 3000); 
                      }}
                      className="bg-gradient-to-r from-[#00d4ff] to-[#00e5a0] rounded-xl py-3 text-[#0a0e1a] text-sm font-bold transition-opacity hover:opacity-90"
                    >
                      {logged ? "✓ Logged!" : "Log Meal"}
                    </motion.button>
                  </div>
                </div>

                {/* Today's meals */}
                <h3 className="text-sm font-bold">Today's Meals</h3>
                <div className="flex flex-col gap-3">
                  {MEALS.map((meal, i) => (
                    <div key={i} className="bg-[#161d2e] border border-[#1e2d45] rounded-2xl p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-2xl">
                        {meal.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[15px] font-bold">{meal.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#6b7fa3] mt-0.5">
                          <Clock className="w-3 h-3" />
                          {meal.time} · {meal.carbs}g carbs
                        </div>
                        <div className="mt-2 flex gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/20">
                            GI {meal.gi}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffb547]/10 text-[#ffb547] border border-[#ffb547]/20">
                            Peak {meal.glucose_impact} mg/dL
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-[#00d4ff] font-mono">
                          {meal.carbs}g
                        </div>
                        <div className="text-[10px] text-[#6b7fa3] uppercase font-bold">carbs</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* INSIGHTS TAB */}
            {activeTab === "insights" && (
              <>
                <div className="mb-1">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#00d4ff]" />
                    AI Insights
                  </h3>
                  <p className="text-xs text-[#6b7fa3] mt-1">
                    Personalized analysis from your glucose data
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    {
                      icon: <CheckCircle2 className="w-5 h-5" />,
                      title: "Excellent post-dinner control",
                      body: "Your glucose spike after dinner was only +31 mg/dL — significantly better than your weekly average of +44. The lower-GI meal likely contributed.",
                      color: COLORS.green,
                      delay: 0,
                    },
                    {
                      icon: <AlertCircle className="w-5 h-5" />,
                      title: "Watch lunch carb loads",
                      body: "Lunch consistently produces your highest daily spikes (+47 avg). Consider spacing carbs across smaller portions or adding fiber to slow absorption.",
                      color: COLORS.amber,
                      delay: 100,
                    },
                    {
                      icon: <Activity className="w-5 h-5" />,
                      title: "Strong fasting baseline",
                      body: "Your 6 AM fasting glucose of 95 mg/dL is in the optimal range. Consistent sleep patterns are likely supporting healthy morning insulin sensitivity.",
                      color: COLORS.accent,
                      delay: 200,
                    },
                    {
                      icon: <TrendingUp className="w-5 h-5" />,
                      title: "7-day trend improving",
                      body: "Time in range has increased from 71% to 78% over the past 7 days. Your dietary changes on Wednesday appear to have had lasting positive effects.",
                      color: COLORS.green,
                      delay: 300,
                    },
                    {
                      icon: <Zap className="w-5 h-5" />,
                      title: "Low glucose variability",
                      body: "A CV of 14.2% indicates very stable glucose throughout the day. Values under 36% are considered low-risk for metabolic complications.",
                      color: COLORS.green,
                      delay: 400,
                    },
                  ].map((insight, i) => (
                    <InsightCard key={i} {...insight} />
                  ))}
                </div>

                {/* Score card */}
                <div className="bg-gradient-to-br from-[#161d2e] to-[#111827] border border-[#00e5a0]/30 rounded-[20px] p-6 text-center relative overflow-hidden mt-2">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00e5a0] to-[#00d4ff]" />
                  <div className="text-[11px] text-[#6b7fa3] tracking-[2px] mb-3 uppercase font-bold">
                    Today's Metabolic Score
                  </div>
                  <div className="text-7xl font-black font-mono bg-gradient-to-br from-[#00e5a0] to-[#00d4ff] bg-clip-text text-transparent leading-none">
                    84
                  </div>
                  <div className="text-[13px] text-[#00e5a0] font-bold mt-3">
                    Good · Top 23% of users
                  </div>
                  <p className="text-xs text-[#6b7fa3] mt-3 max-w-[280px] mx-auto leading-relaxed">
                    Based on time in range, meal response, fasting levels, and glucose variability.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer / Bottom spacing */}
      <footer className="h-6" />
    </div>
  );
}
