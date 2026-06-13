import { useState, useEffect, useRef, useCallback } from "react";

// ─── Storage helpers (Claude Artifact Storage API) ────────────────────────────

async function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

async function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── Theme ────────────────────────────────────────────────────────────────────

const T = {
  bg: "#F7F5F2",
  surface: "#FFFFFF",
  border: "#E8E4DE",
  borderActive: "#D4CFC8",
  textPrimary: "#1A1714",
  textSecondary: "#7A746D",
  textMuted: "#B5B0A8",
  navBg: "#EEEAE4",
  navActive: "#FFFFFF",
  timerTrack: "#EAE6E0",
  hint: "#C8C3BB",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const warmups = {
  A: {
    label: "A",
    duration: "5 min",
    target: "Spalle · Schiena · Petto",
    color: "#B8884A",
    colorBg: "#FBF5EC",
    colorBorder: "#E8D5B4",
    steps: [
      { id: "wa1", name: "Rotazione toracica", detail: "Mobilità · Schiena", reps: "10 per lato", timed: false, desc: "In ginocchio con una mano dietro la testa. Ruota il busto verso l'alto aprendo il gomito verso il soffitto. Mantieni le anche ferme. Scioglie la rigidità toracica prima del Row e del Press." },
      { id: "wa2", name: "Arm Circle", detail: "Mobilità · Spalle", reps: "10 avanti + 10 indietro", timed: false, desc: "In piedi, braccia tese lungo i fianchi. Fai cerchi ampi con entrambe le braccia, prima in avanti poi all'indietro. Aumenta l'ampiezza gradualmente. Prepara la cuffia dei rotatori per il Shoulder Press e il Chest Press." },
      { id: "wa3", name: "Band Pull-Apart (o asciugamano)", detail: "Attivazione · Scapole", reps: "15 ripetizioni", timed: false, desc: "Tieni un asciugamano o elastico davanti a te con le braccia tese. Tira verso l'esterno stringendo le scapole, poi ritorna. Attiva il romboide e il trapezio medio — essenziale prima del Bent-over Row." },
      { id: "wa4", name: "Wall Slide", detail: "Attivazione · Spalle", reps: "10 ripetizioni", timed: false, desc: "Schiena e gomiti a contatto con il muro, avambracci verticali. Fai scorrere le braccia verso l'alto mantenendo il contatto col muro. Se senti resistenza, non forzare. Corregge la postura scapolare prima del Shoulder Press." },
      { id: "wa5", name: "Cat-Cow", detail: "Mobilità · Colonna", reps: "30 secondi", timed: true, seconds: 30, desc: "A quattro zampe, mani sotto le spalle e ginocchia sotto le anche. Inspira abbassando la pancia (cow), espira inarcando la schiena verso l'alto (cat). Ritmo lento e controllato. Scalda la colonna prima di tutti i movimenti." },
    ],
  },
  B: {
    label: "B",
    duration: "5 min",
    target: "Anche · Glutei · Quadricipiti",
    color: "#4A8A76",
    colorBg: "#EEF7F4",
    colorBorder: "#B4D9CE",
    steps: [
      { id: "wb1", name: "Hip Circle", detail: "Mobilità · Anche", reps: "10 per lato", timed: false, desc: "In piedi con le mani sui fianchi. Fai cerchi ampi con il bacino, prima in senso orario poi antiorario. Scalda l'articolazione dell'anca prima di Squat, Affondi e Hip Thrust." },
      { id: "wb2", name: "Glute Bridge", detail: "Attivazione · Glutei", reps: "15 ripetizioni", timed: false, desc: "Sdraiato sulla schiena, ginocchia piegate, piedi a terra. Spingi i fianchi verso l'alto contraendo i glutei, tieni 1 secondo in alto poi scendi. Attiva i glutei prima dell'Hip Thrust e del Romanian Deadlift." },
      { id: "wb3", name: "World's Greatest Stretch", detail: "Mobilità · Flessori anca", reps: "5 per lato", timed: false, desc: "Da posizione di affondo, porta il gomito del lato avanzato verso il pavimento accanto al piede, poi ruota aprendo il braccio verso il soffitto. Uno dei migliori esercizi di mobilità per preparare gambe e anche." },
      { id: "wb4", name: "Leg Swing", detail: "Mobilità · Posteriore coscia", reps: "15 per lato", timed: false, desc: "In piedi con una mano sul muro per equilibrio. Oscilla la gamba avanti e indietro in modo controllato, aumentando gradualmente l'ampiezza. Scalda il posteriore coscia prima del Romanian Deadlift." },
      { id: "wb5", name: "Squat a peso corporeo", detail: "Attivazione · Quadricipiti", reps: "15 ripetizioni", timed: false, desc: "Piedi larghezza spalle, punte aperte. Scendi lentamente fino a 90° tenendo le ginocchia in linea con i piedi e il busto eretto. Risali con controllo. Attiva i quadricipiti e prepara le articolazioni per il Goblet Squat." },
    ],
  },
};

const workouts = {
  A: {
    label: "A",
    title: "Parte Superiore",
    subtitle: "Upper Body + Core",
    color: "#B8884A",
    colorBg: "#FBF5EC",
    colorBorder: "#E8D5B4",
    exercises: [
      { id: "a1", name: "Chest Press a Terra", detail: "Petto · Tricipiti", sets: 3, reps: "10-12", desc: "Sdraiato sulla schiena, manubri all'altezza del petto con gomiti a 45°. Spingi verso l'alto fino a braccia quasi tese, poi scendi lentamente. Il pavimento protegge le spalle." },
      { id: "a2", name: "Bent-over Row", detail: "Schiena · Bicipiti", sets: 3, reps: "10-12", desc: "Busto inclinato a 45°, schiena piatta. Tira i manubri verso i fianchi stringendo le scapole — i gomiti vanno indietro, non in fuori. Core attivo per proteggere la schiena bassa." },
      { id: "a3", name: "Shoulder Press", detail: "Spalle", sets: 3, reps: "10-12", desc: "In piedi o seduto, manubri all'altezza delle orecchie con gomiti a 90°. Spingi verso l'alto senza inarcare la schiena lombare. Abbassa lentamente e con controllo." },
      { id: "a4", name: "Bicep Curl", detail: "Bicipiti", sets: 3, reps: "10-12", desc: "In piedi, manubri ai fianchi con palmi in avanti. Porta i manubri verso le spalle flettendo solo il gomito. Non dondolare il busto — il movimento è isolato al gomito." },
      { id: "a5", name: "Tricep Overhead Extension", detail: "Tricipiti", sets: 3, reps: "10-12", desc: "Un manubrio con entrambe le mani sopra la testa. Piega i gomiti abbassando il peso dietro la nuca, poi estendi. Tieni i gomiti vicini alle orecchie per tutto il movimento." },
      { id: "a6", name: "Plank", detail: "Core", sets: 3, reps: "45\"", desc: "Appoggio sugli avambracci e punte dei piedi. Corpo dritto come un'asse: niente sedere in su né in giù. Respira normalmente, contrai l'addome e i glutei." },
    ],
  },
  B: {
    label: "B",
    title: "Parte Inferiore",
    subtitle: "Lower Body + Core",
    color: "#4A8A76",
    colorBg: "#EEF7F4",
    colorBorder: "#B4D9CE",
    exercises: [
      { id: "b1", name: "Goblet Squat", detail: "Quadricipiti · Glutei", sets: 3, reps: "10-12", desc: "Tieni un manubrio verticale davanti al petto. Piedi larghezza spalle, punte leggermente aperte. Scendi come su una sedia, ginocchia in linea con i piedi, schiena dritta. Il peso davanti ti aiuta a stare eretto." },
      { id: "b2", name: "Romanian Deadlift", detail: "Posteriore coscia · Glutei", sets: 3, reps: "10-12", desc: "Manubri davanti alle cosce, piedi larghezza anche. Inclina il busto mantenendo la schiena dritta e le ginocchia leggermente flesse — i manubri scendono lungo le gambe. Senti il tirare nel posteriore coscia, poi risali contraendo i glutei." },
      { id: "b3", name: "Affondi Alternati", detail: "Glutei · Equilibrio", sets: 3, reps: "10-12", desc: "In piedi con manubri ai fianchi. Fai un passo avanti e scendi finché entrambe le ginocchia sono a 90°. Risali e alterna le gambe. Tieni il busto eretto e il core attivo." },
      { id: "b4", name: "Hip Thrust", detail: "Glutei", sets: 3, reps: "10-12", desc: "Schiena appoggiata a un divano o sedia, manubrio sul basso addome. Piedi a terra larghezza spalle. Spingi i fianchi verso l'alto contraendo i glutei fino a formare una linea retta ginocchia-fianchi-spalle. Abbassa lentamente." },
      { id: "b5", name: "Dead Bug", detail: "Core", sets: 3, reps: "10 per lato", desc: "Sdraiato sulla schiena, braccia tese verso il soffitto, ginocchia piegate a 90° sollevate. Abbassa lentamente il braccio destro e la gamba sinistra verso il pavimento senza toccare. Risali e alterna. La schiena bassa deve restare a contatto col pavimento." },
    ],
  },
};

const DAYS_IT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MONTHS_IT = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ─── CheckIcon ────────────────────────────────────────────────────────────────

function CheckIcon({ done, color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="10"
        stroke={done ? color : T.borderActive} strokeWidth="1.5"
        fill={done ? color : "transparent"}
        style={{ transition: "all 0.25s ease" }} />
      {done && <path d="M6.5 11l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

// ─── Set Tracker ──────────────────────────────────────────────────────────────

function SetTracker({ exId, totalSets, color, setsDone, onSetsDone, onAutoToggle, exerciseDone }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      {Array.from({ length: totalSets }).map((_, i) => {
        const completed = i < setsDone;
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              if (completed && i === setsDone - 1) {
                onSetsDone(exId, setsDone - 1);
                if (exerciseDone) onAutoToggle(exId);
              } else if (!completed) {
                const newCount = i + 1;
                onSetsDone(exId, newCount);
                if (newCount === totalSets && !exerciseDone) onAutoToggle(exId);
              }
            }}
            title={completed ? `Serie ${i + 1} completata` : `Segna serie ${i + 1}`}
            style={{
              width: 18, height: 18, borderRadius: "50%",
              border: `1.5px solid ${completed ? color : T.borderActive}`,
              background: completed ? color : "transparent",
              cursor: "pointer", padding: 0, flexShrink: 0,
              transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {completed && (
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M2 4.5l2 2 3-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Exercise Row ─────────────────────────────────────────────────────────────

function ExerciseRow({ ex, done, color, colorBg, onToggle, setsDone, onSetsDone }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      border: "1px solid",
      borderColor: done ? color + "55" : T.border,
      borderRadius: "10px", overflow: "hidden",
      background: done ? colorBg : T.surface,
      transition: "border-color 0.2s ease, background 0.2s ease",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 14px" }}>
        <button onClick={() => onToggle(ex.id)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
          <CheckIcon done={done} color={color} />
        </button>
        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onToggle(ex.id)}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 500, color: done ? T.textMuted : T.textPrimary, textDecoration: done ? "line-through" : "none", textDecorationColor: T.borderActive, transition: "all 0.2s ease", letterSpacing: "0.01em" }}>{ex.name}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: done ? T.textMuted : T.textSecondary, marginTop: "2px" }}>{ex.detail}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: done ? T.textMuted : color, whiteSpace: "nowrap", transition: "all 0.2s ease" }}>
            {ex.sets} × {ex.reps}
          </div>
          <SetTracker exId={ex.id} totalSets={ex.sets} color={color} setsDone={setsDone} onSetsDone={onSetsDone} onAutoToggle={onToggle} exerciseDone={done} />
        </div>
        <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", padding: "2px 6px", cursor: "pointer", color: open ? color : T.textMuted, fontSize: "18px", lineHeight: 1, transition: "transform 0.25s ease, color 0.2s ease", transform: open ? "rotate(90deg)" : "rotate(-90deg)", flexShrink: 0 }}>‹</button>
      </div>
      {open && (
        <div style={{ padding: "12px 14px 14px 50px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: T.textSecondary, lineHeight: 1.65, borderTop: `1px solid ${T.border}` }}>
          {ex.desc}
        </div>
      )}
    </div>
  );
}

// ─── Rest Timer ───────────────────────────────────────────────────────────────

const TIMER_OPTIONS = [45, 60, 90, 120];

function useBeep() {
  const ctxRef = useRef(null);
  const play = useCallback(() => {
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      [0, 0.15, 0.3].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = i === 2 ? 880 : 660;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.3);
      });
    } catch {}
    try { window.navigator.vibrate?.([80, 60, 80, 60, 120]); } catch {}
  }, []);
  return play;
}

function RestTimer({ color }) {
  const [duration, setDuration] = useState(60);
  const [state, setState] = useState("idle");
  const [remaining, setRemaining] = useState(60);
  const intervalRef = useRef(null);
  const beep = useBeep();

  const stop = useCallback(() => { clearInterval(intervalRef.current); }, []);

  const start = () => {
    if (state === "running") { stop(); setState("idle"); setRemaining(duration); return; }
    setState("running"); setRemaining(duration);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); setState("done"); beep(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const reset = () => { stop(); setState("idle"); setRemaining(duration); };
  const changeDuration = (d) => { stop(); setState("idle"); setDuration(d); setRemaining(d); };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const pct = ((duration - remaining) / duration) * 100;
  const r = 18, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "12px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
          <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="22" cy="22" r={r} fill="none" stroke={T.timerTrack} strokeWidth="3" />
            <circle cx="22" cy="22" r={r} fill="none" stroke={state !== "idle" ? color : T.borderActive} strokeWidth="3"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.6s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", fontSize: state === "done" ? "11px" : "12px", color: state === "done" ? color : state === "running" ? T.textPrimary : T.textMuted }}>
            {state === "done" ? "✓" : `${remaining}s`}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500, color: state === "done" ? color : T.textSecondary }}>
            {state === "idle" && "Timer riposo"}{state === "running" && "Pausa in corso…"}{state === "done" && "Riprendi!"}
          </div>
          <div style={{ display: "flex", gap: "5px", marginTop: "6px" }}>
            {TIMER_OPTIONS.map(d => (
              <button key={d} onClick={() => changeDuration(d)} style={{
                padding: "2px 7px", borderRadius: "5px", border: "1px solid",
                borderColor: duration === d ? color : T.border,
                background: duration === d ? color + "18" : "transparent",
                color: duration === d ? color : T.textMuted,
                fontFamily: "'DM Mono', monospace", fontSize: "10px",
                cursor: "pointer", transition: "all 0.15s ease",
              }}>{d}s</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={start} style={{ padding: "7px 16px", borderRadius: "8px", border: "none", background: state === "running" ? T.navBg : color, color: state === "running" ? T.textSecondary : "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}>
            {state === "running" ? "Stop" : "Start"}
          </button>
          {state !== "idle" && (
            <button onClick={reset} style={{ padding: "7px 10px", borderRadius: "8px", border: `1px solid ${T.border}`, background: "none", color: T.textSecondary, fontFamily: "'DM Sans', sans-serif", fontSize: "13px", cursor: "pointer" }}>↺</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Warmup Card ─────────────────────────────────────────────────────────────

function WarmupStep({ step, done, color, colorBg, onToggle }) {
  const [open, setOpen] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [remaining, setRemaining] = useState(step.seconds || 0);
  const intervalRef = useRef(null);

  const startTimer = (e) => {
    e.stopPropagation();
    if (timerRunning) { clearInterval(intervalRef.current); setTimerRunning(false); return; }
    setTimerRunning(true);
    setRemaining(step.seconds);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setTimerRunning(false);
          onToggle(step.id);
          try { window.navigator.vibrate?.([100, 50, 100]); } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div style={{
      border: "1px solid", borderColor: done ? color + "55" : T.border,
      borderRadius: "10px", overflow: "hidden",
      background: done ? colorBg : T.surface,
      transition: "border-color 0.2s ease, background 0.2s ease",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px" }}>
        <button onClick={() => onToggle(step.id)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
          <CheckIcon done={done} color={color} />
        </button>
        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onToggle(step.id)}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 500, color: done ? T.textMuted : T.textPrimary, textDecoration: done ? "line-through" : "none", textDecorationColor: T.borderActive, transition: "all 0.2s ease" }}>{step.name}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: done ? T.textMuted : T.textSecondary, marginTop: "2px" }}>{step.detail}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {step.timed && (
            <button onClick={startTimer} style={{
              padding: "4px 10px", borderRadius: "6px", border: "none",
              background: timerRunning ? color : T.navBg,
              color: timerRunning ? "#fff" : T.textSecondary,
              fontFamily: "'DM Mono', monospace", fontSize: "11px",
              cursor: "pointer", transition: "all 0.2s ease", minWidth: 46,
            }}>
              {timerRunning ? `${remaining}s` : `${step.seconds}s`}
            </button>
          )}
          {!step.timed && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: done ? T.textMuted : color, whiteSpace: "nowrap" }}>{step.reps}</span>
          )}
          <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", padding: "2px 6px", cursor: "pointer", color: open ? color : T.textMuted, fontSize: "18px", lineHeight: 1, transition: "transform 0.25s ease, color 0.2s ease", transform: open ? "rotate(90deg)" : "rotate(-90deg)", flexShrink: 0 }}>‹</button>
        </div>
      </div>
      {open && (
        <div style={{ padding: "10px 14px 12px 50px", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: T.textSecondary, lineHeight: 1.65, borderTop: `1px solid ${T.border}` }}>
          {step.desc}
        </div>
      )}
    </div>
  );
}

function WarmupCard({ warmup, warmupChecked, onToggle, onSkip }) {
  const total = warmup.steps.length;
  const done = warmup.steps.filter(s => warmupChecked[s.id]).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div style={{ background: T.surface, border: `1px solid ${warmup.colorBorder}`, borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "4px" }}>
        <div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "11px", letterSpacing: "0.15em", color: warmup.color, textTransform: "uppercase", fontWeight: 600 }}>Riscaldamento</span>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: T.textSecondary, marginTop: "3px" }}>
            {warmup.target} · <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px" }}>{warmup.duration}</span>
          </div>
        </div>
        <button onClick={onSkip} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: "8px", color: T.textMuted, fontSize: "11px", fontFamily: "'DM Sans', sans-serif", padding: "5px 10px", cursor: "pointer" }}>salta</button>
      </div>

      {/* Progress bar */}
      <div style={{ margin: "12px 0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: T.textSecondary }}>{done}/{total} esercizi</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: pct === 100 ? warmup.color : T.textMuted }}>{pct}%</span>
        </div>
        <div style={{ height: "3px", background: T.timerTrack, borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: warmup.color, borderRadius: "2px", transition: "width 0.4s ease" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        {warmup.steps.map(step => (
          <WarmupStep key={step.id} step={step} done={!!warmupChecked[step.id]} color={warmup.color} colorBg={warmup.colorBg} onToggle={onToggle} />
        ))}
      </div>

      {pct === 100 && (
        <div style={{ marginTop: "12px", padding: "10px 12px", background: warmup.colorBg, border: `1px solid ${warmup.colorBorder}`, borderRadius: "10px", textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: warmup.color }}>
          ✦ Ottimo — ora sei pronto per l'allenamento
        </div>
      )}
    </div>
  );
}

// ─── Workout Card ─────────────────────────────────────────────────────────────

function WorkoutCard({ workout, checked, onToggle, onReset, setsDone, onSetsDone, onSwitchSession }) {
  const total = workout.exercises.length;
  const done = workout.exercises.filter(e => checked[e.id]).length;
  const pct = Math.round((done / total) * 100);
  const otherLabel = workout.label === "A" ? "B" : "A";

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "6px" }}>
        <div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "11px", letterSpacing: "0.15em", color: workout.color, textTransform: "uppercase", fontWeight: 600 }}>Sessione {workout.label}</span>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: T.textPrimary, fontWeight: 700, marginTop: "4px", lineHeight: 1.2 }}>{workout.title}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: T.textSecondary, marginTop: "3px" }}>{workout.subtitle}</div>
        </div>
        <button onClick={() => onReset(workout.label)} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: "8px", color: T.textMuted, fontSize: "11px", fontFamily: "'DM Sans', sans-serif", padding: "6px 10px", cursor: "pointer" }}>reset</button>
      </div>

      <div style={{ margin: "16px 0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: T.textSecondary }}>{done}/{total} esercizi</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: pct === 100 ? workout.color : T.textMuted }}>{pct}%</span>
        </div>
        <div style={{ height: "3px", background: T.timerTrack, borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: workout.color, borderRadius: "2px", transition: "width 0.4s ease" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {workout.exercises.filter(ex => !checked[ex.id]).map(ex => (
          <ExerciseRow key={ex.id} ex={ex} done={false} color={workout.color} colorBg={workout.colorBg}
            onToggle={onToggle} setsDone={setsDone[ex.id] || 0} onSetsDone={onSetsDone} />
        ))}
        {workout.exercises.some(ex => checked[ex.id]) && (
          <div style={{ marginTop: "4px" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: T.textMuted, marginBottom: "6px", letterSpacing: "0.04em" }}>
              Completati
            </div>
            {workout.exercises.filter(ex => checked[ex.id]).map(ex => (
              <div key={ex.id} style={{ marginBottom: "6px", opacity: 0.5 }}>
                <ExerciseRow ex={ex} done={true} color={workout.color} colorBg={workout.colorBg}
                  onToggle={onToggle} setsDone={setsDone[ex.id] || 0} onSetsDone={onSetsDone} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: "14px", fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: T.hint, textAlign: "center", letterSpacing: "0.04em" }}>
        Tocca ‹ › per vedere la spiegazione · tocca i cerchi per tracciare le serie
      </div>

      {pct === 100 && (
        <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ padding: "12px", background: workout.colorBg, border: `1px solid ${workout.colorBorder}`, borderRadius: "10px", textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: workout.color, letterSpacing: "0.05em" }}>
            ✦ Sessione completata — ottimo lavoro
          </div>
          <button
            onClick={() => onSwitchSession(otherLabel)}
            style={{
              padding: "10px", borderRadius: "10px",
              border: `1px solid ${workouts[otherLabel].colorBorder}`,
              background: workouts[otherLabel].colorBg,
              color: workouts[otherLabel].color,
              fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500,
              cursor: "pointer", transition: "all 0.2s ease", letterSpacing: "0.03em",
            }}
          >
            Vai alla Sessione {otherLabel} · {workouts[otherLabel].title} →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function Calendar({ completions, selectedDay, onSelectDay, onResetDay }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;
  const todayKey = toDateKey(today);

  const isFutureDay = (dayNum) => {
    const d = new Date(viewYear, viewMonth, dayNum);
    d.setHours(23, 59, 59, 999);
    return d > today;
  };

  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > lastDay.getDate()) { cells.push(null); continue; }
    const key = toDateKey(new Date(viewYear, viewMonth, dayNum));
    cells.push({ dayNum, key, dots: completions[key] || [], future: isFutureDay(dayNum) });
  }

  const monthKeys = Object.keys(completions).filter(k => k.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`));
  const countA = monthKeys.filter(k => completions[k].includes("A")).length;
  const countB = monthKeys.filter(k => completions[k].includes("B")).length;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", color: T.textMuted, fontSize: "20px", cursor: "pointer", padding: "4px 8px", lineHeight: 1 }}>‹</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: T.textPrimary, fontWeight: 700 }}>{MONTHS_IT[viewMonth]}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: T.textMuted, marginTop: "2px" }}>{viewYear}</div>
        </div>
        <button onClick={nextMonth} style={{ background: "none", border: "none", color: T.textMuted, fontSize: "20px", cursor: "pointer", padding: "4px 8px", lineHeight: 1 }}>›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "6px" }}>
        {DAYS_IT.map(d => (
          <div key={d} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: T.textMuted, textAlign: "center", paddingBottom: "4px" }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const isToday = cell.key === todayKey;
          const isSelected = cell.key === selectedDay;
          const hasDots = cell.dots.length > 0;
          return (
            <div
              key={cell.key}
              onClick={() => {
                if (cell.future || !hasDots) return;
                onSelectDay(isSelected ? null : cell.key);
              }}
              style={{
                aspectRatio: "1", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", borderRadius: "8px",
                background: isSelected ? "#FFF0EE" : isToday ? T.navBg : "transparent",
                border: `1px solid ${isSelected ? "#E8A090" : isToday ? T.borderActive : "transparent"}`,
                gap: "3px", opacity: cell.future ? 0.35 : 1,
                cursor: hasDots && !cell.future ? "pointer" : "default",
                transition: "background 0.15s ease, border-color 0.15s ease",
              }}
            >
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
                color: isSelected ? "#C0392B" : isToday ? T.textPrimary : cell.future ? T.textMuted : T.textSecondary,
                fontWeight: isSelected || isToday ? 600 : 400, lineHeight: 1,
              }}>{cell.dayNum}</span>
              {hasDots && (
                <div style={{ display: "flex", gap: "3px" }}>
                  {cell.dots.map(label => (
                    <div key={label} style={{ width: 6, height: 6, borderRadius: "50%", background: workouts[label].color }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reset giorno selezionato */}
      {selectedDay && completions[selectedDay] && (
        <div style={{
          marginTop: "14px", padding: "12px 14px",
          background: "#FFF8F7", border: "1px solid #F0CECA",
          borderRadius: "10px", display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#9A4A40" }}>
            {selectedDay.split("-").reverse().slice(0,2).join("/")} · {completions[selectedDay].map(l => `Sessione ${l}`).join(" + ")}
          </span>
          <button
            onClick={() => onResetDay(selectedDay)}
            style={{
              padding: "5px 12px", borderRadius: "7px", border: "none",
              background: "#C0392B", color: "#fff",
              fontFamily: "'DM Sans', sans-serif", fontSize: "12px",
              fontWeight: 600, cursor: "pointer",
            }}
          >
            Reset giorno
          </button>
        </div>
      )}

      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${T.border}`, display: "flex", gap: "12px", justifyContent: "center" }}>
        {[{ label: "A", count: countA, color: workouts.A.color }, { label: "B", count: countB, color: workouts.B.color }].map(({ label, count, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: T.textSecondary }}>
              Sessione {label}: <span style={{ color: count > 0 ? color : T.textMuted, fontWeight: 600 }}>{count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hamburger Menu ───────────────────────────────────────────────────────────

function HamburgerMenu({ page, onNavigate }) {
  const [open, setOpen] = useState(false);

  const items = [
    { key: "allenamento",  label: "🏋️  Allenamento"  },
    { key: "riscaldamento", label: "🔥  Riscaldamento" },
    { key: "calendario",   label: "📅  Calendario"    },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 40 }}
        />
      )}

      {/* Hamburger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          padding: "6px", display: "flex", flexDirection: "column",
          gap: "5px", zIndex: 50, position: "relative",
        }}
      >
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            display: "block", width: 22, height: 2,
            background: T.textPrimary, borderRadius: 2,
            transition: "all 0.25s ease",
            transform: open && i === 0 ? "translateY(7px) rotate(45deg)"
                     : open && i === 1 ? "scaleX(0)"
                     : open && i === 2 ? "translateY(-7px) rotate(-45deg)"
                     : "none",
            opacity: open && i === 1 ? 0 : 1,
          }} />
        ))}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0,
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: "12px", padding: "6px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          zIndex: 50, minWidth: 200,
        }}>
          {items.map(item => (
            <button
              key={item.key}
              onClick={() => { onNavigate(item.key); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "10px 14px", borderRadius: "8px", border: "none",
                background: page === item.key ? T.navBg : "transparent",
                color: page === item.key ? T.textPrimary : T.textSecondary,
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                fontWeight: page === item.key ? 500 : 400,
                cursor: "pointer", transition: "background 0.15s ease",
                letterSpacing: "0.02em",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("allenamento");
  const [tab, setTab] = useState("A");
  const [ready, setReady] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null); // dateKey selected in calendar

  const [checked, setChecked] = useState({});
  const [completions, setCompletions] = useState({});
  // loggedToday: { A: "YYYY-MM-DD", B: "YYYY-MM-DD" } — tracks which date each session was logged
  const [loggedToday, setLoggedToday] = useState({});
  const [setsDone, setSetsDone] = useState({});
  const [warmupChecked, setWarmupChecked] = useState({});
  // warmupDone: { A: true/false } — whether warmup was completed or skipped for current session
  const [warmupDone, setWarmupDone] = useState({});
  // undoStack: array of { checked, setsDone } snapshots (max 10)
  const [undoStack, setUndoStack] = useState([]);

  // Load from Claude Artifact Storage on mount
  useEffect(() => {
    (async () => {
      const [c, comp, log, sd, wc] = await Promise.all([
        loadStorage("wk_checked", {}),
        loadStorage("wk_completions", {}),
        loadStorage("wk_logged", {}),
        loadStorage("wk_sets_done", {}),
        loadStorage("wk_warmup_checked", {}),
      ]);
      setChecked(c);
      setCompletions(comp);
      setLoggedToday(log);
      setSetsDone(sd);
      setWarmupChecked(wc);
      setReady(true);
    })();
  }, []);

  // Persist on change (only after initial load)
  useEffect(() => { if (ready) saveStorage("wk_checked", checked); }, [checked, ready]);
  useEffect(() => { if (ready) saveStorage("wk_completions", completions); }, [completions, ready]);
  useEffect(() => { if (ready) saveStorage("wk_logged", loggedToday); }, [loggedToday, ready]);
  useEffect(() => { if (ready) saveStorage("wk_sets_done", setsDone); }, [setsDone, ready]);
  useEffect(() => { if (ready) saveStorage("wk_warmup_checked", warmupChecked); }, [warmupChecked, ready]);

  // Auto-reset exercises if we are on a new day
  useEffect(() => {
    if (!ready) return;
    const todayKey = toDateKey(new Date());
    Object.values(workouts).forEach(w => {
      const lastLogged = loggedToday[w.label];
      // If the session was logged on a previous day, reset exercises (dots stay)
      if (lastLogged && lastLogged !== todayKey) {
        const ids = w.exercises.map(e => e.id);
        const wids = warmups[w.label].steps.map(s => s.id);
        setChecked(prev => { const next = { ...prev }; ids.forEach(id => delete next[id]); return next; });
        setSetsDone(prev => { const next = { ...prev }; ids.forEach(id => delete next[id]); return next; });
        setWarmupChecked(prev => { const next = { ...prev }; wids.forEach(id => delete next[id]); return next; });
        setWarmupDone(prev => { const next = { ...prev }; delete next[w.label]; return next; });
        // Clear loggedToday entry so the session can be re-logged today
        setLoggedToday(prev => { const next = { ...prev }; delete next[w.label]; return next; });
      }
    });
  }, [ready]);

  const toggle = (id) => {
    // Push current state to undo stack before toggling
    setUndoStack(prev => [...prev.slice(-9), { checked: { ...checked }, setsDone: { ...setsDone } }]);
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const handleSetsDone = (exId, count) => {
    setUndoStack(prev => [...prev.slice(-9), { checked: { ...checked }, setsDone: { ...setsDone } }]);
    setSetsDone(prev => ({ ...prev, [exId]: count }));
  };
  const undo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setChecked(last.checked);
    setSetsDone(last.setsDone);
    setUndoStack(prev => prev.slice(0, -1));
  };

  // Auto-log completion + auto-reset exercises after logging
  useEffect(() => {
    if (!ready) return;
    const todayKey = toDateKey(new Date());
    Object.values(workouts).forEach(w => {
      // every() returns true on empty arrays — guard with explicit length check
      const donCount = w.exercises.filter(ex => checked[ex.id]).length;
      const allDone = donCount === w.exercises.length && donCount > 0;
      if (allDone && loggedToday[w.label] !== todayKey) {
        // 1. Add dot to calendar
        setCompletions(prev => {
          const existing = prev[todayKey] || [];
          if (existing.includes(w.label)) return prev;
          return { ...prev, [todayKey]: [...existing, w.label] };
        });
        // 2. Mark as logged today
        setLoggedToday(prev => ({ ...prev, [w.label]: todayKey }));
        // 3. Auto-reset exercises + warmup so the card is clean for next session
        const ids = w.exercises.map(e => e.id);
        const wids = warmups[w.label].steps.map(s => s.id);
        setTimeout(() => {
          setChecked(prev => { const next = { ...prev }; ids.forEach(id => delete next[id]); return next; });
          setSetsDone(prev => { const next = { ...prev }; ids.forEach(id => delete next[id]); return next; });
          setWarmupChecked(prev => { const next = { ...prev }; wids.forEach(id => delete next[id]); return next; });
          setWarmupDone(prev => { const next = { ...prev }; delete next[w.label]; return next; });
        }, 1800); // small delay so the user sees 100% before reset
      }
    });
  }, [checked, ready]);

  // Reset only exercises + warmup for a session — dots/completions are NOT touched
  const resetExercises = (label) => {
    const ids = workouts[label].exercises.map(e => e.id);
    const wids = warmups[label].steps.map(s => s.id);
    setChecked(prev => { const next = { ...prev }; ids.forEach(id => delete next[id]); return next; });
    setSetsDone(prev => { const next = { ...prev }; ids.forEach(id => delete next[id]); return next; });
    setWarmupChecked(prev => { const next = { ...prev }; wids.forEach(id => delete next[id]); return next; });
    setWarmupDone(prev => { const next = { ...prev }; delete next[label]; return next; });
    setUndoStack([]);
  };

  // Reset a single day's dot from the calendar
  const resetDay = (dateKey) => {
    setCompletions(prev => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });
    // Also clear loggedToday entries for that day so session can be re-logged
    setLoggedToday(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(label => { if (next[label] === dateKey) delete next[label]; });
      return next;
    });
    setSelectedDay(null);
  };

  const resetAll = async () => {
    setChecked({});
    setCompletions({});
    setLoggedToday({});
    setSetsDone({});
    setWarmupChecked({});
    setWarmupDone({});
    setSelectedDay(null);
    await Promise.all([
      saveStorage("wk_checked", {}),
      saveStorage("wk_completions", {}),
      saveStorage("wk_logged", {}),
      saveStorage("wk_sets_done", {}),
      saveStorage("wk_warmup_checked", {}),
    ]);
    setConfirmReset(false);
  };

  const workout = workouts[tab];

  if (!ready) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: T.textMuted }}>Caricamento…</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 0 48px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&family=DM+Mono&display=swap" rel="stylesheet" />

      {/* Top bar */}
      <div style={{
        width: "100%", background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", boxSizing: "border-box",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <HamburgerMenu page={page} onNavigate={setPage} />
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: T.textPrimary, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
            Il Mio Allenamento
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: T.textMuted, letterSpacing: "0.04em" }}>
            2 sessioni · manubri · 30–40 min
          </div>
        </div>
        {/* Undo button */}
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Annulla ultima azione"
          style={{
            background: "none", border: "none", cursor: undoStack.length > 0 ? "pointer" : "default",
            padding: "6px", display: "flex", alignItems: "center", justifyContent: "center",
            opacity: undoStack.length > 0 ? 1 : 0.25, transition: "opacity 0.2s ease",
            color: T.textPrimary, fontSize: "18px", lineHeight: 1,
          }}
          aria-label="Annulla"
        >
          ↩
        </button>
      </div>

      {/* Content */}
      <div style={{ width: "100%", maxWidth: "480px", padding: "20px 16px 0", display: "flex", flexDirection: "column", gap: "14px", boxSizing: "border-box" }}>
        {page === "allenamento" && (
          <>
            <RestTimer color={workout.color} />
            <div style={{ display: "flex", gap: "6px", background: T.navBg, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "4px" }}>
              {Object.values(workouts).map(w => {
                const allDone = w.exercises.every(ex => checked[ex.id]);
                const active = tab === w.label;
                return (
                  <button key={w.label} onClick={() => setTab(w.label)} style={{
                    flex: 1, padding: "8px 0", borderRadius: "9px", border: "none",
                    background: active ? w.color : "transparent",
                    color: active ? "#fff" : T.textSecondary,
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "14px",
                    cursor: "pointer", transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    boxShadow: active ? `0 1px 4px ${w.color}55` : "none",
                  }}>
                    Sessione {w.label}
                    {allDone && <span style={{ fontSize: "10px" }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <WorkoutCard
              workout={workout}
              checked={checked}
              onToggle={toggle}
              onReset={resetExercises}
              setsDone={setsDone}
              onSetsDone={handleSetsDone}
              onSwitchSession={(label) => setTab(label)}
            />
          </>
        )}

        {page === "riscaldamento" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Session tab switcher */}
            <div style={{ display: "flex", gap: "6px", background: T.navBg, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "4px" }}>
              {Object.values(warmups).map(w => {
                const allDone = w.steps.every(s => warmupChecked[s.id]);
                const active = tab === w.label;
                return (
                  <button key={w.label} onClick={() => setTab(w.label)} style={{
                    flex: 1, padding: "8px 0", borderRadius: "9px", border: "none",
                    background: active ? w.color : "transparent",
                    color: active ? "#fff" : T.textSecondary,
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "14px",
                    cursor: "pointer", transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    boxShadow: active ? `0 1px 4px ${w.color}55` : "none",
                  }}>
                    Sessione {w.label}
                    {allDone && <span style={{ fontSize: "10px" }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <WarmupCard
              warmup={warmups[tab]}
              warmupChecked={warmupChecked}
              onToggle={(id) => setWarmupChecked(prev => ({ ...prev, [id]: !prev[id] }))}
              onSkip={() => setWarmupDone(prev => ({ ...prev, [tab]: true }))}
            />
          </div>
        )}

        {page === "calendario" && (
          <>
            <Calendar
              completions={completions}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              onResetDay={resetDay}
            />

            {/* Reset all data */}
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                style={{
                  width: "100%", padding: "12px", borderRadius: "12px",
                  border: `1px solid ${T.border}`, background: T.surface,
                  color: T.textMuted, fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px", cursor: "pointer", transition: "all 0.2s ease",
                  marginTop: "4px",
                }}
              >
                Azzera tutti i dati
              </button>
            ) : (
              <div style={{
                background: T.surface, border: `1px solid #E8C8C8`,
                borderRadius: "12px", padding: "16px", textAlign: "center",
                display: "flex", flexDirection: "column", gap: "10px",
              }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: T.textSecondary, lineHeight: 1.5 }}>
                  Questa azione cancellerà tutti gli allenamenti e lo storico. Non è reversibile.
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setConfirmReset(false)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "9px",
                      border: `1px solid ${T.border}`, background: "none",
                      color: T.textSecondary, fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px", cursor: "pointer",
                    }}
                  >
                    Annulla
                  </button>
                  <button
                    onClick={resetAll}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "9px",
                      border: "none", background: "#C0392B",
                      color: "#fff", fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px", fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    Sì, azzera tutto
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}