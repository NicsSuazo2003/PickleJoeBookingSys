import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, animate as framerAnimate } from 'framer-motion';

const SESSION_KEY = 'cc_intro_shown';

// Geometric Anchors (SVG viewBox space: 0 0 1100 620)
const START_POINT = { x: 273, y: 405 }; // Directly above 'E'
const BALL_CENTER = { x: 760, y: 375}; // Seated on the right of COURT
const BALL_RADIUS = 46;

// The exact curve the ball flies along — same control points as the visible arc,
// but ending precisely at BALL_CENTER so the ball lands exactly where it rests.
const FLIGHT_PATH = `M ${START_POINT.x} ${START_POINT.y} C 360 120, 680 120, ${BALL_CENTER.x} ${BALL_CENTER.y}`;

// Pickleball dot matrix layout
const BALL_DOTS = [
  { cx: 0, cy: 0, r: 4.8 },
  { cx: -0.36, cy: -0.28, r: 4.2 },
  { cx: 0.36, cy: -0.28, r: 4.2 },
  { cx: -0.38, cy: 0.3, r: 4.2 },
  { cx: 0.38, cy: 0.3, r: 4.2 },
  { cx: 0, cy: -0.45, r: 4.0 },
  { cx: 0, cy: 0.45, r: 4.0 },
  { cx: -0.5, cy: 0.02, r: 4.0 },
  { cx: 0.5, cy: 0.02, r: 4.0 },
  { cx: -0.72, cy: -0.32, r: 3.2 },
  { cx: 0.72, cy: -0.32, r: 3.2 },
  { cx: -0.72, cy: 0.34, r: 3.2 },
  { cx: 0.72, cy: 0.34, r: 3.2 },
  { cx: -0.35, cy: -0.75, r: 3.2 },
  { cx: 0.35, cy: -0.75, r: 3.2 },
  { cx: -0.32, cy: 0.76, r: 3.2 },
  { cx: 0.32, cy: 0.76, r: 3.2 },
  { cx: 0, cy: -0.84, r: 2.8 },
  { cx: 0, cy: 0.84, r: 2.8 },
];

interface IntroSplashProps {
  onComplete?: () => void;
}

/**
 * Drives a point smoothly along a real SVG path using a single continuous
 * eased progress value (0→1), rather than hand-tuned x/y keyframe arrays.
 * This is what removes the stutter: there is exactly one eased transition
 * happening, so there are no per-segment velocity resets ("seams").
 */
function useFlightPosition(delaySec: number, durationSec: number) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [pos, setPos] = useState({ x: START_POINT.x, y: START_POINT.y });
  const progress = useMotionValue(0);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();

    const update = (v: number) => {
      const p = path.getPointAtLength(v * total);
      setPos({ x: p.x, y: p.y });
    };
    update(0);
    const unsubscribe = progress.on('change', update);

    const controls = framerAnimate(progress, 1, {
      delay: delaySec,
      duration: durationSec,
      ease: [0.33, 0, 0.2, 1], // one continuous ease — no per-segment seams
    });

    return () => {
      unsubscribe();
      controls.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { pos, pathRef };
}

export function IntroSplash({ onComplete }: IntroSplashProps) {
  // Lazily read sessionStorage on first render, so a repeat visit starts
  // in 'exited' state and never paints the overlay at all — no flash.
  const [phase, setPhase] = useState<'intro' | 'ready' | 'smashing' | 'exited'>(() =>
    typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) ? 'exited' : 'intro'
  );
  const { pos: ballPos, pathRef } = useFlightPosition(0.8, 1.1);

  useEffect(() => {
    // Already shown this session — just notify the parent, nothing to animate.
    if (phase === 'exited') {
      onComplete?.();
      return;
    }

    sessionStorage.setItem(SESSION_KEY, 'true');

    // Settle into resting state before click trigger
    const readyTimer = setTimeout(() => setPhase('ready'), 2100);

    // Auto-smash if unattended after 5.5s
    const autoSmashTimer = setTimeout(() => {
      setPhase((curr) => (curr === 'ready' || curr === 'intro' ? 'smashing' : curr));
    }, 5500);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(autoSmashTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInteraction = () => {
    if (phase === 'smashing' || phase === 'exited') return;
    setPhase('smashing');
  };

  const isSmashing = phase === 'smashing';

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {phase !== 'exited' && (
        <motion.div
          onClick={handleInteraction}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-[#132219] select-none overflow-hidden"
          role="button"
          aria-label="Click to smash enter"
        >
          <style>
            {`@import url('https://fonts.googleapis.com/css2?family=Michroma&display=swap');`}
          </style>

          {/* Screen Camera Shake on Smash Impact */}
          <motion.div
            className="w-full flex flex-col items-center justify-center"
            animate={
              isSmashing
                ? {
                    x: [0, -18, 18, -10, 10, -4, 0],
                    y: [0, 14, -14, 8, -8, 3, 0],
                    scale: [1, 1.04, 1],
                  }
                : {}
            }
            transition={{ delay: 0.28, duration: 0.55, ease: 'easeOut' }}
          >
            <svg
              viewBox="0 0 1100 620"
              className="w-[min(90vw,720px)] overflow-visible drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
            >
              <defs>
                <mask id="arcMask">
                  <motion.path
                    d={`M ${START_POINT.x} ${START_POINT.y} C 360 120, 680 120, ${BALL_CENTER.x} ${BALL_CENTER.y - 30}`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="50"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      delay: 1.0,
                      duration: 1.05,
                      ease: [0.25, 1, 0.4, 1],
                    }}
                  />
                </mask>

                <linearGradient id="sheen" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                  <stop offset="100%" stopColor="#EDE6D6" stopOpacity="0.85" />
                </linearGradient>
              </defs>

              {/* Hidden reference path — the ball's position is sampled from this each frame */}
              <path ref={pathRef} d={FLIGHT_PATH} fill="none" stroke="none" />

              {/* 1. Wordmark */}
              <motion.text
                x="550"
                y="480"
                textAnchor="middle"
                initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={
                  isSmashing
                    ? { opacity: 0, scale: 0.92, filter: 'blur(8px)' }
                    : { opacity: 1, y: 0, filter: 'blur(0px)' }
                }
                transition={
                  isSmashing
                    ? { duration: 0.35, ease: 'easeIn' }
                    : { delay: 0.25, duration: 0.75, ease: [0.16, 1, 0.3, 1] }
                }
                fill="url(#sheen)"
                style={{
                  fontFamily: "'Michroma', sans-serif",
                  fontSize: '52px',
                  fontWeight: 700,
                  letterSpacing: '0.24em',
                }}
              >
                CENTER COURT
              </motion.text>

              {/* 2. Tapered Arc Swoosh */}
              <motion.path
                d={`M ${START_POINT.x} ${START_POINT.y} 
                   C 360 115, 680 115, ${BALL_CENTER.x} ${BALL_CENTER.y - 45} 
                   L ${BALL_CENTER.x - 20} ${BALL_CENTER.y - 25} 
                   C 670 140, 370 140, ${START_POINT.x} ${START_POINT.y} Z`}
                fill="url(#sheen)"
                mask="url(#arcMask)"
                animate={isSmashing ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.25 }}
              />

              {/* 3. Left Serve Impact Flash */}
              <motion.circle
                cx={START_POINT.x}
                cy={START_POINT.y}
                initial={{ r: 4, opacity: 0 }}
                animate={{
                  r: [4, 42],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  delay: 0.76,
                  duration: 0.5,
                  ease: 'easeOut',
                }}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3"
              />

              {/* 4. Left Serve Paddle */}
              <motion.g
                initial={{
                  opacity: 0,
                  x: START_POINT.x - 55,
                  y: START_POINT.y + 40,
                  rotate: -48,
                }}
                animate={{
                  opacity: [0, 0.95, 1, 1, 0],
                  x: [
                    START_POINT.x - 55,
                    START_POINT.x - 45,
                    START_POINT.x - 12,
                    START_POINT.x + 10,
                    START_POINT.x + 25,
                  ],
                  y: [
                    START_POINT.y + 40,
                    START_POINT.y + 30,
                    START_POINT.y + 8,
                    START_POINT.y - 12,
                    START_POINT.y - 20,
                  ],
                  rotate: [-48, -40, -12, 18, 28],
                }}
                transition={{
                  delay: 0.4,
                  duration: 0.95,
                  times: [0, 0.32, 0.44, 0.7, 1],
                  ease: [0.25, 1, 0.5, 1],
                }}
                style={{ transformOrigin: 'bottom center' }}
              >
                <rect x="-18" y="-56" width="36" height="50" rx="11" fill="#FFFFFF" fillOpacity="0.95" />
                <rect x="-18" y="-56" width="36" height="50" rx="11" fill="none" stroke="#EDE6D6" strokeWidth="2.5" />
                <path d="M -10 -6 L -5 8 L 5 8 L 10 -6 Z" fill="#FFFFFF" fillOpacity="0.8" />
                <rect x="-4.5" y="8" width="9" height="26" rx="3.5" fill="#EDE6D6" />
                <line x1="-4" y1="14" x2="4" y2="14" stroke="#132219" strokeWidth="1.2" strokeOpacity="0.4" />
                <line x1="-4" y1="20" x2="4" y2="20" stroke="#132219" strokeWidth="1.2" strokeOpacity="0.4" />
                <line x1="-4" y1="26" x2="4" y2="26" stroke="#132219" strokeWidth="1.2" strokeOpacity="0.4" />
              </motion.g>

              {/* 5. Smash Paddle #2 */}
              {isSmashing && (
                <motion.g
                  initial={{
                    opacity: 0,
                    x: BALL_CENTER.x + 120,
                    y: BALL_CENTER.y - 150,
                    rotate: 70,
                    scale: 1.15,
                  }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    x: [
                      BALL_CENTER.x + 120,
                      BALL_CENTER.x + 60,
                      BALL_CENTER.x - 25,
                      BALL_CENTER.x - 90,
                    ],
                    y: [
                      BALL_CENTER.y - 150,
                      BALL_CENTER.y - 30,
                      BALL_CENTER.y + 35,
                      BALL_CENTER.y + 90,
                    ],
                    rotate: [70, 30, -30, -60],
                    scale: [1.15, 1.2, 1.35, 1.45],
                  }}
                  transition={{
                    duration: 0.62,
                    times: [0, 0.35, 0.6, 1],
                    ease: [0.2, 0.9, 0.3, 1],
                  }}
                  style={{ transformOrigin: 'top center' }}
                >
                  <rect x="-24" y="-70" width="48" height="66" rx="14" fill="#FFFFFF" />
                  <rect x="-24" y="-70" width="48" height="66" rx="14" fill="none" stroke="#EDE6D6" strokeWidth="3" />
                  <path d="M -14 -4 L -7 12 L 7 12 L 14 -4 Z" fill="#FFFFFF" />
                  <rect x="-6" y="12" width="12" height="34" rx="4" fill="#EDE6D6" />
                  <line x1="-5" y1="20" x2="5" y2="20" stroke="#132219" strokeWidth="1.5" strokeOpacity="0.4" />
                  <line x1="-5" y1="28" x2="5" y2="28" stroke="#132219" strokeWidth="1.5" strokeOpacity="0.4" />
                  <line x1="-5" y1="36" x2="5" y2="36" stroke="#132219" strokeWidth="1.5" strokeOpacity="0.4" />
                </motion.g>
              )}

              {/* 6. Smash Shockwave */}
              {isSmashing && (
                <motion.circle
                  cx={BALL_CENTER.x}
                  cy={BALL_CENTER.y}
                  initial={{ r: 10, opacity: 0.95 }}
                  animate={{ r: 180, opacity: 0 }}
                  transition={{ delay: 0.28, duration: 0.55, ease: 'easeOut' }}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="5"
                />
              )}

              {/* 7. Ball — intro flight now rides the real curve via useFlightPosition,
                     so position updates every frame with zero keyframe seams.
                     Scale/rotate stay as simple 2-keyframe animations (start → end),
                     which never suffer the segment-seam issue since there's only one
                     eased transition, not several stitched together. */}
              {!isSmashing ? (
                <motion.g style={{ x: ballPos.x, y: ballPos.y }}>
                  <motion.g
                    initial={{ scale: 0.35, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 180, opacity: 1 }}
                    transition={{
                      delay: 0.8,
                      duration: 1.1,
                      opacity: { delay: 0.8, duration: 0.15 },
                      scale: { delay: 0.8, duration: 1.1, ease: [0.34, 1.56, 0.64, 1] },
                      rotate: { delay: 0.8, duration: 1.1, ease: [0.33, 0, 0.2, 1] },
                    }}
                    style={{ transformOrigin: '0px 0px' }}
                  >
                    <circle cx={0} cy={0} r={BALL_RADIUS} fill="#FFFFFF" />
                    {BALL_DOTS.map((dot, i) => (
                      <circle
                        key={i}
                        cx={dot.cx * BALL_RADIUS}
                        cy={dot.cy * BALL_RADIUS}
                        r={dot.r}
                        fill="#132219"
                      />
                    ))}
                  </motion.g>
                </motion.g>
              ) : (
                /* Screen-Eating 3D Smash */
                <motion.g
                  initial={{
                    x: BALL_CENTER.x,
                    y: BALL_CENTER.y,
                    scale: 1,
                    rotate: 0,
                  }}
                  animate={{
                    x: [BALL_CENTER.x, BALL_CENTER.x - 30, 550], // Smashes toward camera center
                    y: [BALL_CENTER.y, BALL_CENTER.y + 20, 310],
                    scale: [1, 0.85, 3.5, 45], // Consumes screen
                    rotate: [0, -35, 120, 260],
                  }}
                  transition={{
                    delay: 0.28,
                    duration: 1.15,
                    times: [0, 0.12, 0.55, 1],
                    ease: [0.16, 0.85, 0.3, 1],
                  }}
                  onAnimationComplete={() => {
                    setPhase('exited');
                    onComplete?.();
                  }}
                >
                  <circle cx={0} cy={0} r={BALL_RADIUS} fill="#FFFFFF" />
                  {BALL_DOTS.map((dot, i) => (
                    <circle
                      key={i}
                      cx={dot.cx * BALL_RADIUS}
                      cy={dot.cy * BALL_RADIUS}
                      r={dot.r}
                      fill="#132219"
                    />
                  ))}
                </motion.g>
              )}
            </svg>

            {/* Tap Prompt CTA */}
<motion.div
  initial={{ opacity: 0 }}
  animate={
    isSmashing
      ? { opacity: 0 }
      : {
          opacity: [0.4, 0.9, 0.4],
          scale: [1, 1.04, 1],
        }
  }
  transition={
    isSmashing
      ? { duration: 0.2 }
      : { delay: 2.2, duration: 1.8, repeat: Infinity }
  }
  className="mt-6 flex flex-col items-center gap-1.5"
>
  <span className="text-xs font-semibold uppercase tracking-[0.32em] text-white/90">
    TAP YOUR WAY TO GAME TIME
  </span>
</motion.div>
          </motion.div>

          {/* Full Screen Impact Flash Transition */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isSmashing ? { opacity: [0, 0, 0.9, 1] } : { opacity: 0 }}
            transition={{
              delay: 0.28,
              duration: 1.1,
              times: [0, 0.45, 0.85, 1],
              ease: 'easeIn',
            }}
            className="pointer-events-none fixed inset-0 bg-white"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}