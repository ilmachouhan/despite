import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { 
  ArrowRight, CheckCircle2, Instagram, ArrowDown, LockKeyhole, 
  Volume2, VolumeX, Eye, ArrowUpRight, Shield, Swords, Sparkles, AlertCircle
} from "lucide-react";
import BrandLogo from "./BrandLogo";

interface CinematicTimelineProps {
  onEnterAdmin: () => void;
}

// Custom client-side Synthesizer for dark atmospheric soundscape using Web Audio API
class TensionSynth {
  private ctx: AudioContext | null = null;
  private droneOsc: OscillatorNode | null = null;
  private pulseOsc: OscillatorNode | null = null;
  private noiseNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private masterGain: GainNode | null = null;

  public isPlaying: boolean = false;

  constructor() {}

  public start() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      
      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime); // keep it elegant and subtle
      this.masterGain.connect(this.ctx.destination);

      // Filter for analog warmth
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.setValueAtTime(120, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(4, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      // 1. Deep Sub Drone (representing internal tension)
      this.droneOsc = this.ctx.createOscillator();
      this.droneOsc.type = "sawtooth";
      this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note
      
      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.droneOsc.connect(droneGain);
      droneGain.connect(this.filter);
      this.droneOsc.start();

      // 2. Slow Rhythmic Heartbeat pulse
      this.pulseOsc = this.ctx.createOscillator();
      this.pulseOsc.type = "sine";
      this.pulseOsc.frequency.setValueAtTime(1.2, this.ctx.currentTime); // LFO rate for volume pulsation
      
      // Modulate low-pass filter frequency with LFO
      const filterModulator = this.ctx.createOscillator();
      filterModulator.type = "sine";
      filterModulator.frequency.setValueAtTime(0.2, this.ctx.currentTime); // very slow sweep
      
      const filterModGain = this.ctx.createGain();
      filterModGain.gain.setValueAtTime(80, this.ctx.currentTime); // modulate up to 200Hz
      
      filterModulator.connect(filterModGain);
      if (this.filter && this.filter.frequency) {
        filterModGain.connect(this.filter.frequency);
      }
      filterModulator.start();

      // Setup micro-noise for analog vinyl crackle feeling
      if (this.ctx.createScriptProcessor) {
        // Safe vintage script processor fallback
        const bufferSize = 4096;
        const scriptProp = this.ctx.createScriptProcessor(bufferSize, 1, 1);
        scriptProp.onaudioprocess = (e) => {
          const output = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() < 0.0003 ? (Math.random() * 2 - 1) * 0.15 : 0;
          }
        };
        const crackleGain = this.ctx.createGain();
        crackleGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        scriptProp.connect(crackleGain);
        crackleGain.connect(this.masterGain);
        this.noiseNode = scriptProp;
      }

      this.isPlaying = true;
    } catch (err) {
      console.warn("Audio Context init blocked by browser policy.", err);
    }
  }

  public updateModulation(percentX: number, percentY: number) {
    if (!this.ctx || !this.filter || !this.isPlaying) return;
    const targetFreq = 80 + (percentX * 240); // 80Hz to 320Hz
    const targetQ = 1 + (percentY * 12); // Q resonance
    
    this.filter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
    this.filter.Q.setTargetAtTime(targetQ, this.ctx.currentTime, 0.2);
  }

  public stop() {
    if (!this.ctx) return;
    try {
      this.droneOsc?.stop();
      this.pulseOsc?.stop();
      this.ctx.close();
    } catch(_) {}
    this.isPlaying = false;
  }

  public playTick() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const actx = this.ctx || new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, actx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.015, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.09);
    } catch (_) {}
  }

  public playSuccess() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const actx = this.ctx || new AudioCtx();
      
      const playTone = (freq: number, delay: number, dur: number) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, actx.currentTime + delay);
        
        gain.gain.setValueAtTime(0, actx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.04, actx.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + delay + dur);
        
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(actx.currentTime + delay);
        osc.stop(actx.currentTime + delay + dur);
      };
      
      playTone(440, 0, 0.2);   // A4
      playTone(554.37, 0.08, 0.2); // C#5
      playTone(659.25, 0.16, 0.3); // E5
      playTone(880, 0.24, 0.4);   // A5
    } catch (_) {}
  }
}

export default function CinematicTimeline({ onEnterAdmin }: CinematicTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<TensionSynth>(new TensionSynth());
  
  // Interactive Soundscape activation state
  const [soundActive, setSoundActive] = useState(false);
  const [coords, setCoords] = useState({ x: 0.5, y: 0.5 });
  const [realtimeAttendees, setRealtimeAttendees] = useState(2412);

  // Track scroll position for high end responsive styling
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Background crimson light transforms
  const backgroundRedIntensity = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], ["rgba(225,29,72,0.06)", "rgba(225,29,72,0.12)", "rgba(225,29,72,0.16)", "rgba(225,29,72,0.22)", "rgba(225,29,72,0.28)"]);

  // Custom hero image upload states and handlers
  const [customHeroUrl, setCustomHeroUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    // Check if custom hero is available
    const checkCustomHero = async () => {
      try {
        const res = await fetch("/api/admin/hero-status");
        const data = await res.json();
        if (data.hasCustomImage) {
          setCustomHeroUrl(`/api/hero-image.png?t=${Date.now()}`);
        }
      } catch (err) {
        console.error("Error setting custom hero status:", err);
      }
    };
    checkCustomHero();
  }, []);

  const handleDirectHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file.");
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await fetch("/api/admin/upload-hero", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64String }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setCustomHeroUrl(`/api/hero-image.png?t=${Date.now()}`);
          synthRef.current.playSuccess();
        } else {
          setUploadError(data.error || "Failed to upload custom image.");
        }
      } catch (err) {
        setUploadError("Could not connect to the upload server.");
      } finally {
        setIsUploadingImage(false);
      }
    };

    reader.onerror = () => {
      setUploadError("Error reading image file.");
      setIsUploadingImage(false);
    };

    reader.readAsDataURL(file);
  };

  // Email form states
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [successInfo, setSuccessInfo] = useState({ memberNum: 0, message: "" });
  const [errorText, setErrorText] = useState("");

  // Live registration ticking simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeAttendees(prev => prev + (Math.random() < 0.3 ? 1 : 0));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseEnterElement = () => {
    synthRef.current.playTick();
  };

  const handleToggleSound = () => {
    if (!soundActive) {
      synthRef.current.start();
      setSoundActive(true);
    } else {
      synthRef.current.stop();
      setSoundActive(false);
    }
  };

  // Track mouse coordinates over the screen for soundscape frequency modulation
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setCoords({ x, y });
    if (soundActive) {
      synthRef.current.updateModulation(x, y);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorText("Provide a genuine receipt (valid email).");
      return;
    }

    setIsSubmitting(true);
    setErrorText("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "landing_page" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHasSubscribed(true);
        synthRef.current.playSuccess();
        const foundingNum = 1842 + (data.count || 1);
        setSuccessInfo({
          memberNum: foundingNum,
          message: data.message
        });
      } else {
        setErrorText(data.error || "A secure connection error occurred.");
      }
    } catch (err) {
      setErrorText("Communication failed. Server is currently locked.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#030303] text-zinc-100 overflow-hidden scroll-smooth font-serif selection:bg-rose-600 selection:text-white"
      id="cinematic_reality"
    >
      {/* 2026 Film Grain Overlay for atmospheric grit */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] z-50 mix-blend-overlay" />
      
      {/* Dynamic Red Gradient Background Aura */}
      <motion.div 
        className="fixed inset-0 pointer-events-none z-0 opacity-90 transition-colors duration-1000"
        style={{ background: backgroundRedIntensity }}
      />

      {/* Static hero image backdrop stays locked while all text scrolls over it */}
      <img
        src="/assets/hero.png"
        alt="Despite static hero backdrop"
        className="fixed inset-0 w-full h-full object-cover opacity-85 brightness-[0.72] contrast-125 saturate-150 pointer-events-none select-none z-0"
        draggable={false}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-black/45 via-black/15 to-black/62" />

      {/* Cinematic Frame Border Letterbox */}
      <div className="fixed inset-0 pointer-events-none border-[12px] md:border-[20px] border-black z-40" />

      {/* Interactive Soundscape Controller widget */}
      <div className="fixed bottom-6 left-6 md:bottom-10 md:left-10 z-40">
        <button
          onClick={handleToggleSound}
          onMouseEnter={handleMouseEnterElement}
          className={`flex items-center gap-2 px-4 py-2 border rounded-full font-mono text-[9px] tracking-[0.2em] uppercase transition-all backdrop-blur-md cursor-pointer ${
            soundActive 
              ? "bg-rose-950/40 text-rose-400 border-rose-500/50 animate-pulse shadow-md shadow-rose-950" 
              : "bg-zinc-950/20 text-zinc-500 border-zinc-800 hover:border-zinc-500 hover:text-white"
          }`}
          title="Toggle interactive high-contrast sound drone"
        >
          {soundActive ? <Volume2 size={12} className="text-rose-500" /> : <VolumeX size={12} />}
          <span>{soundActive ? "AIRDRONE ACTIVE • SWEEP MOUSE" : "IGNITE THE SILENCE"}</span>
        </button>
      </div>

      {/* Extreme Fine Details corner labels */}
      <div className="fixed right-6 top-6 md:right-10 md:top-10 z-40 flex items-center gap-4">
        <button
          onClick={onEnterAdmin}
          onMouseEnter={handleMouseEnterElement}
          className="font-mono text-[9px] md:text-[10px] tracking-[0.15em] text-zinc-500 hover:text-rose-500 hover:tracking-[0.25em] transition-all flex items-center gap-1.5 uppercase bg-zinc-950/60 border border-zinc-900 rounded px-3 py-1.5 backdrop-blur-md cursor-pointer"
        >
          <LockKeyhole size={10} className="text-zinc-600 group-hover:text-rose-500" />
          Receipt Core
        </button>
      </div>

      {/* Floating Micro indicators for attendees count - keeps it highly engaging */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 font-mono text-[8px] md:text-[9px] tracking-widest text-zinc-500 flex items-center gap-2 bg-black/60 border border-zinc-900 px-3 py-1.5 rounded backdrop-blur-md select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
        <span className="text-zinc-400 font-bold">{realtimeAttendees}</span>
        <span>REBELS RECORDED</span>
      </div>

      {/* Opening: Pitch Black Silence */}
      <section className="relative min-h-[72vh] flex flex-col items-center justify-center bg-black/35 backdrop-blur-[1px] px-6 select-none border-b border-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/60 z-0 pointer-events-none" />
        <div className="relative z-10 max-w-4xl text-center space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-3xl sm:text-5xl md:text-6xl font-serif italic font-light tracking-tight text-white/90 leading-tight"
          >
            &ldquo;You were supposed to fail.&rdquo;
          </motion.h2>
          <div className="pt-8">
            <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-zinc-600 block animate-pulse">Scroll down to confront truth</span>
          </div>
        </div>
      </section>

      {/* The Rigged Game */}
      <section className="relative min-h-[72vh] flex flex-col items-center justify-center bg-black/35 backdrop-blur-[1px] px-6 select-none border-b border-zinc-950">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(10,5,5,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(10,5,5,0.4)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25" />
        <div className="relative z-10 max-w-3xl text-center space-y-8">
          <div className="space-y-4">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 1 }}
              className="text-lg sm:text-2xl md:text-3xl font-serif text-zinc-300 italic leading-relaxed text-justify sm:text-center"
            >
              &ldquo;The algorithm was engineered to keep you scrolling. The system was designed to keep you obedient. Comfort was weaponized to quietly bury your ambition.&rdquo;
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.3, duration: 1 }}
            className="border-t border-zinc-900/60 pt-6 max-w-xl mx-auto"
          >
            <p className="text-sm md:text-md text-zinc-500 font-mono tracking-wide uppercase leading-relaxed font-light">
              They told you to be realistic. People smiled when you stumbled, waiting for the &ldquo;I told you so.&rdquo;
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Pivot */}
      <section className="relative min-h-[72vh] flex flex-col items-center justify-center bg-black/35 backdrop-blur-[1px] px-6 select-none border-b border-zinc-950">
        <div className="absolute inset-x-0 top-1/4 bottom-1/4 bg-red-950/5 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl text-center space-y-8">
          <div className="space-y-4">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 1 }}
              className="text-lg sm:text-2xl md:text-3xl font-serif text-zinc-100 italic leading-relaxed text-center"
            >
              &ldquo;When the group chat went quiet, you kept building. When the code broke, you didn&apos;t sleep. When the world told you &ldquo;no,&rdquo; you stopped asking for permission.&rdquo;
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            className="inline-block bg-zinc-950 border border-rose-950/50 px-6 py-2.5 rounded font-mono text-xs tracking-widest text-rose-400 uppercase"
          >
            MOTIVATION LEFT MONTHS AGO. YOU STAYED.
          </motion.div>
        </div>
      </section>

      {/* The Validation */}
      <section className="relative min-h-[72vh] flex flex-col items-center justify-center bg-black/38 backdrop-blur-[1px] px-6 select-none border-b border-zinc-950">
        <div className="relative z-10 max-w-4xl text-center space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1.05 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="space-y-8"
          >
            <p className="text-xl sm:text-3xl md:text-4xl font-sans font-black italic tracking-wide text-white uppercase text-justify sm:text-center leading-snug">
              &ldquo;You got rejected enough times to become dangerous. You ran out of reasons to quit. You stopped explaining, and suddenly, everything changed.&rdquo;
            </p>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.4 }}
            className="text-xs sm:text-sm font-mono tracking-widest text-zinc-500 uppercase max-w-md mx-auto"
          >
            They call it luck now. Let them. They missed the first thousand days.
          </motion.p>
        </div>
      </section>

      {/* The Constitution of Despite */}
      <section className="relative min-h-[72vh] flex flex-col items-center justify-center bg-black/35 backdrop-blur-[1px] px-6 select-none border-b border-zinc-950 overflow-hidden">
        {/* Shifting background red haze filling the edges */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.08)_0%,_rgba(0,0,0,1)_80%)] md:bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.12)_0%,_rgba(0,0,0,1)_70%)] animate-pulse pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl text-center space-y-10">
          <div className="space-y-4">
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              className="text-lg sm:text-2xl md:text-3xl font-serif italic text-zinc-300 leading-relaxed text-justify sm:text-center"
            >
              &ldquo;DESPITE is a mirror. It is the receipts of the relentless. For the anomalies. The builders. The obsessed. The ones who looked at a rigged game, smiled, and played it anyway.&rdquo;
            </motion.p>
          </div>

          <div className="pt-6 relative z-10 flex flex-col items-center">
            <div className="h-[1px] w-24 bg-rose-955/60 mb-8" />
            
            {/* The Climax Logo Slam */}
            <motion.div
              initial={{ scale: 2.2, opacity: 0, filter: "brightness(0)" }}
              whileInView={{ scale: 1, opacity: 1, filter: "brightness(1)" }}
              viewport={{ once: false, margin: "-5%" }}
              transition={{ type: "spring", damping: 12, stiffness: 100 }}
              className="transform hover:scale-105 transition-transform cursor-pointer"
            >
              <BrandLogo size="lg" slam={true} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Gated Entry */}
      <section id="the_gate" className="min-h-[86vh] relative flex flex-col items-center justify-center px-6 py-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-955 via-black to-black border-t border-zinc-900">
        
        {/* BIG HERO CLIMAX BACKDROP: uploaded hero image */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black opacity-30 pointer-events-none">
          <img 
            src={customHeroUrl || "/assets/hero.png"} 
            className="w-full h-full object-cover shrink-0 select-none brightness-60 contrast-125 saturate-110"
            referrerPolicy="no-referrer"
            alt="Despite hero backdrop"
            draggable={false}
          />
          {/* Vignette layer */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black z-10" />
        </div>

        {/* Custom image controller widget layered inside the structure */}
        <div className="relative z-30 mb-8 flex flex-col items-center">
          <label className="flex items-center gap-2 px-3 py-1.5 border border-rose-500/20 bg-black/95 hover:bg-rose-950/40 hover:border-rose-500 focus-within:border-rose-500 text-rose-450 rounded text-[9px] font-mono tracking-widest uppercase transition-all duration-300 cursor-pointer shadow-lg select-none">
            <Sparkles size={11} className={isUploadingImage ? "animate-spin" : "animate-pulse"} />
            <span>{isUploadingImage ? "LOCKING IMAGE..." : customHeroUrl ? "REPLACE HERO IMAGE" : "SET HERO IMAGE"}</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleDirectHeroUpload}
              disabled={isUploadingImage}
            />
          </label>
          {uploadError && (
            <span className="text-[9px] text-rose-600 bg-black/95 border border-rose-950/50 px-2 py-1 rounded font-mono mt-2 animate-pulse uppercase tracking-wide">
              ERROR: {uploadError}
            </span>
          )}
        </div>

        <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
          
          {/* Header Lines */}
          <div className="space-y-4">
            <motion.h4 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              className="font-serif italic text-2xl md:text-3xl font-light text-zinc-450 tracking-wide"
            >
              Nobody believed you.
            </motion.h4>
            <motion.h4 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ delay: 0.2 }}
              className="font-serif italic text-2xl md:text-3xl font-bold text-white tracking-wide"
            >
              You didn&apos;t need them to.
            </motion.h4>
          </div>

          {/* Core Supreme-Style Logo Badge */}
          <div className="py-2 flex justify-center">
            <BrandLogo size="massive" slam={false} />
          </div>

          {/* Already written line */}
          <div className="space-y-4">
            <h3 className="font-sans font-black text-xl sm:text-2xl uppercase tracking-widest text-zinc-100">
              &ldquo;Despite is for the ones who did it.&rdquo;
            </h3>
          </div>

          {/* ONE SHORT PARAGRAPH - Written tight brand thesis */}
          <div className="max-w-xl mx-auto px-4 py-6 bg-zinc-950/80 backdrop-blur-md border border-zinc-900 rounded-lg">
            <p className="text-zinc-300 font-serif text-sm sm:text-md italic leading-relaxed text-justify sm:text-center">
              This isn&apos;t for the dreamers. It&apos;s for the ones who built anyway,<br /><br />
              with no funding, no permission, no one in their corner. The ones called lucky after the fact, and delusional before it. If you&apos;ve ever made something happen despite everything that said you couldn&apos;t<br /><br />
              this is yours.
            </p>
          </div>

          {/* Email Capture stub featuring reasoning & instagram vip lounge integration */}
          <div className="border border-zinc-900 bg-black/90 p-8 rounded-2xl relative overflow-hidden backdrop-blur-3xl shadow-xl max-w-lg mx-auto">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-600 to-transparent" />
            
            <AnimatePresence mode="wait">
              {!hasSubscribed ? (
                <motion.form
                  key="receipt-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  onSubmit={handleSubscribe}
                  className="space-y-6"
                >
                  <p className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
                    Against the odds. Against the advice. Against everything. The world said no. The receipts say otherwise.
                  </p>

                  <div className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      required
                      placeholder="Show Your Receipts"
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={handleMouseEnterElement}
                      className="w-full bg-zinc-950 border border-zinc-850  focus:border-rose-600 focus:ring-1 focus:ring-rose-600 focus:outline-none rounded px-4 py-4 text-center text-xs font-mono text-white tracking-widest placeholder:text-zinc-700 font-bold uppercase transition-all"
                    />
                    
                    {errorText && (
                      <div className="flex items-center justify-center gap-1.5 text-rose-500 text-[10px] font-mono animate-pulse">
                        <AlertCircle size={11} />
                        <span>{errorText}</span>
                      </div>
                    )}
                  </div>

                  {/* Incentives checklist */}
                  <div className="text-left bg-zinc-950/60 p-4 border border-zinc-900 rounded font-mono text-[9px] text-zinc-400 space-y-2">
                    <span className="text-[8.5px] text-rose-500 block uppercase font-bold tracking-wider mb-1">FOUNDING MEMBERSHIP PRIVILEGES Locked:</span>
                    <div className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">✓</span>
                      <span>1. Private high-contrast priority shipping & founding-member pricing.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">✓</span>
                      <span>2. First tier placement on the global digital &ldquo;I did&rdquo; monument wall.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">✓</span>
                      <span>3. Secure early blueprint drops before general batch releases.</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onMouseEnter={handleMouseEnterElement}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-red-650 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-[10px] py-4 rounded tracking-[0.2em] uppercase transition-all duration-300 hover:tracking-[0.25em] shadow-lg shadow-rose-955/40 cursor-pointer text-center"
                  >
                    <span>{isSubmitting ? "TRANSMITTING DATA..." : "VALIDATE AND LOCK SPOT"}</span>
                    <ArrowRight size={14} />
                  </button>

                  <div className="pt-2">
                    <p className="text-[9.5px] font-mono text-zinc-400 leading-normal">
                      By joining the community on our Instagram at the{" "}
                      <a 
                        href="https://ig.me/j/AbZ81XGZAz_n43nA/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-rose-400 hover:text-rose-300 font-bold underline transition-colors"
                      >
                        insta VIP lounge channel
                      </a>
                      , you lock in absolute access tags.
                    </p>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="receipt-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 py-4 text-center font-mono"
                >
                  <div className="inline-flex p-3 rounded-full bg-rose-955/35 border border-rose-900 border-dashed text-rose-500 mb-2 animate-bounce">
                    <CheckCircle2 size={32} />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white tracking-widest uppercase">
                      RECEIPT VALIDATED & RECORDED
                    </h4>
                    <span className="text-[9px] text-rose-500 tracking-widest uppercase block bg-zinc-950 py-1.5 px-4 border border-zinc-900 max-w-xs mx-auto rounded font-bold">
                      ANOMALY LINER TICKET #{String(successInfo.memberNum).padStart(5, "0")}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-serif leading-relaxed px-4">
                    {successInfo.message || "Your credentials have been authenticated. You are registered as an official member of the private lineup."}
                  </p>

                  <div className="pt-4 flex flex-col gap-3 max-w-xs mx-auto">
                    <a
                      href="https://ig.me/j/AbZ81XGZAz_n43nA/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-red-655 text-white font-extrabold text-[9px] py-3.5 rounded tracking-[0.18em] uppercase transition-all shadow-md shadow-rose-950 hover:from-rose-500 hover:to-red-500"
                    >
                      <Instagram size={14} />
                      JOIN INSTAGRAM VIP LOUNGE
                    </a>
                    
                    <button
                      onClick={() => setHasSubscribed(false)}
                      className="text-[9px] text-zinc-550 hover:text-zinc-350 hover:underline transition-all cursor-pointer"
                    >
                      SUBMIT AN ADDITIONAL RECEIPT
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ANONYMOUS COMING SOON RELEASE FLAG */}
          <div className="space-y-1">
            <span className="font-mono text-xl md:text-2xl tracking-[0.4em] font-black text-rose-600 animate-pulse block">
              COMING SOON. XX/XX/XXXX
            </span>
            <span className="font-mono text-[8px] text-zinc-500 tracking-[0.25em] uppercase block">
              RELEASE DATE ANONYMOUS // SECURED UNDER SYSTEM GHOST MODE
            </span>
          </div>

          {/* ================= Proof section: 1-2 powerful stories for the scrolling reader ================= */}
          <div className="pt-12 border-t border-zinc-900 space-y-8 text-left max-w-xl mx-auto">
            <div className="space-y-2 text-center sm:text-left">
              <span className="font-mono text-[9px] tracking-[0.4em] text-rose-500 font-bold uppercase block">THE ANOMALY BLUEPRINTS // PROOF OF BRAND</span>
              <h4 className="text-xl font-sans font-extrabold italic uppercase tracking-wider text-zinc-100">
                Lived Stories of the Relentless
              </h4>
              <p className="text-xs font-serif italic text-zinc-500">
                For the reader who stayed. Real receipts from the ones who built anyway.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Story 1 */}
              <div className="border border-zinc-900 hover:border-rose-950/40 p-6 bg-zinc-950/20 rounded relative transition-all group">
                <span className="absolute top-2 right-3 font-mono text-[7px] text-rose-600/60 uppercase">CASE# 01 // OVERHEATING AT 3AM</span>
                <h5 className="font-sans font-bold text-xs tracking-wider uppercase text-zinc-200 mb-2">The Midnight Wrapper</h5>
                <p className="text-xs font-serif leading-relaxed text-zinc-400 italic text-justify">
                  &ldquo;I was locking in with exactly $8.12 left in my checking account on a Tuesday. The classic group chats had gone completely silent. Everyone had silently predicted my crash. In a 200 sq ft windowless box, my laptop was literally overheating at 3:14 AM. No rich parents, no seed funding, no safety nets. Only a delusion so deep it outlasted the doubt. I rewrote the core API wrapper thirty times, feeling absolutely crazy. Day 234: the subscription gateway pinged. Then it didn&apos;t stop.&rdquo;
                </p>
              </div>

              {/* Story 2 */}
              <div className="border border-zinc-900 hover:border-rose-950/40 p-6 bg-zinc-950/20 rounded relative transition-all group">
                <span className="absolute top-2 right-3 font-mono text-[7px] text-rose-600/60 uppercase">CASE# 02 // GHOST MODE DEPLOYMENT</span>
                <h5 className="font-sans font-bold text-xs tracking-wider uppercase text-zinc-200 mb-2">The Tuesday Anomaly</h5>
                <p className="text-xs font-serif leading-relaxed text-zinc-400 italic text-justify">
                  &ldquo;I dropped out of the traditional system on a dry Tuesday. Moved onto a foam mat on the floor and lived in pure Ghost Mode. People smiled when I stumbled, waiting to deliver the clinical &lsquo;I told you so.&rsquo; Motivation had evaporated months ago. But I stayed anyway. No one knew what I was shipping until the viral baseline triggered, completely bypassing their paid advertising loop. Now under the lights, they call it luck. Let them. They missed the first thousand days in the dark.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Clean Fine Print Footer */}
          <div className="text-center text-[9px] font-mono text-zinc-650 space-y-2 pt-12">
            <p>© 2026 DESPITE® brand alliance. All rights reserved.</p>
            <p className="tracking-widest uppercase text-zinc-700 text-[7px]">
              No network. No bailout. Just the relentless.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

