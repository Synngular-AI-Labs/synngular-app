import React from "react";

interface AudioWaveformProps {
  isPlaying: boolean;
  progress?: number; // 0–1 fraction of audio played
}

// ── Waveform Constants ──────────────────────────────────────────────
const START_PROGRESS = 0;
const WAVEFORM_BAR_COUNT = 60;
const WAVEFORM_SVG_WIDTH = 195;
const WAVEFORM_SVG_HEIGHT = 26;
const WAVEFORM_BAR_WIDTH = 1.5;
const WAVEFORM_MIN_BAR_HEIGHT = 2;
const WAVEFORM_MAX_HEIGHT_SCALE = 13;
const WAVEFORM_BASE_AMPLITUDE = 0.3;
const WAVEFORM_PEAK_AMPLITUDE = 0.7;
const WAVEFORM_FREQUENCY = 0.5;
const WAVEFORM_PHASE_OFFSET = 1.2;
const WAVEFORM_STAGGER_SECONDS = 0.04;
const WAVEFORM_HALF_DIVISOR = 2;
const WAVEFORM_NO_DELAY = "0s";
const WAVEFORM_ANIM_BASE_DURATION = 5.5;
const WAVEFORM_ANIM_MODULUS = 5;
const WAVEFORM_ANIM_DURATION_STEP = 0.5;
const WAVEFORM_ANIMATION_DURATION = "6s";
const WAVEFORM_ANIMATION_TIMING = "ease-in-out";
const WAVEFORM_ANIMATION_ITERATION = "infinite";
const WAVEFORM_VIEWBOX_ORIGIN = "0 0 ";
const WAVEFORM_XMLNS = "http://www.w3.org/2000/svg";
const WAVEFORM_CLASS_PLAYING = "waveform-playing";
const WAVEFORM_CLASS_BAR = "waveform-bar";
const WAVEFORM_STROKE_PLAYED = "white";
const WAVEFORM_STROKE_UNPLAYED = "rgba(255,255,255,0.3)";

// Keyframe definition constants
const KF_PERCENT_START = 0;
const KF_PERCENT_END = 100;
const KF_SCALE_START = 1;
const KF_PERCENT_1 = 15;
const KF_SCALE_1 = 1.8;
const KF_PERCENT_2 = 30;
const KF_SCALE_2 = 0.6;
const KF_PERCENT_3 = 50;
const KF_SCALE_3 = 2.2;
const KF_PERCENT_4 = 70;
const KF_SCALE_4 = 0.9;
const KF_PERCENT_5 = 85;
const KF_SCALE_5 = 1.5;

/**
 * Animated audio waveform component.
 *
 * Container: width 195px (Fill), height 26px (Hug).
 * ~60 vertical bars whose heights cycle over time when `isPlaying` is true.
 * 12px horizontal padding on each side is applied by the parent container.
 */
const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isPlaying,
  progress = START_PROGRESS,
}) => {
  // Generate bar data – WAVEFORM_BAR_COUNT bars spread across the SVG width.
  const barSpacing = WAVEFORM_SVG_WIDTH / WAVEFORM_BAR_COUNT; // ~3.25 px per bar slot

  // Create an initial set of heights and an animation that cycles them.
  const bars = React.useMemo(() => {
    const result: { x: number; height: number; animDelay: string }[] = [];
    for (let i = 0; i < WAVEFORM_BAR_COUNT; i++) {
      const x = i * barSpacing + barSpacing / WAVEFORM_HALF_DIVISOR;
      // Base height: small random-ish values that look like an audio waveform
      const height = Math.max(
        WAVEFORM_MIN_BAR_HEIGHT,
        Math.round(
          WAVEFORM_MAX_HEIGHT_SCALE *
            (WAVEFORM_BASE_AMPLITUDE +
              WAVEFORM_PEAK_AMPLITUDE *
                Math.abs(
                  Math.sin(i * WAVEFORM_FREQUENCY + WAVEFORM_PHASE_OFFSET)
                ))
        )
      );
      // Stagger: wave from left to right
      const animDelay = `${i * WAVEFORM_STAGGER_SECONDS}s`;
      result.push({ x, height, animDelay });
    }
    return result;
  }, [barSpacing]);

  const keyframes = `
    @keyframes waveform-pulse {
      ${KF_PERCENT_START}%, ${KF_PERCENT_END}% { transform: scaleY(${KF_SCALE_START}); }
      ${KF_PERCENT_1}% { transform: scaleY(${KF_SCALE_1}); }
      ${KF_PERCENT_2}% { transform: scaleY(${KF_SCALE_2}); }
      ${KF_PERCENT_3}% { transform: scaleY(${KF_SCALE_3}); }
      ${KF_PERCENT_4}% { transform: scaleY(${KF_SCALE_4}); }
      ${KF_PERCENT_5}% { transform: scaleY(${KF_SCALE_5}); }
    }
  `;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`${WAVEFORM_VIEWBOX_ORIGIN}${WAVEFORM_SVG_WIDTH} ${WAVEFORM_SVG_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns={WAVEFORM_XMLNS}
      aria-hidden="true"
      className={isPlaying ? WAVEFORM_CLASS_PLAYING : ""}
    >
      <style>{`
        .${WAVEFORM_CLASS_PLAYING} .${WAVEFORM_CLASS_BAR} {
          animation: waveform-pulse ${WAVEFORM_ANIMATION_DURATION} ${WAVEFORM_ANIMATION_TIMING} ${WAVEFORM_ANIMATION_ITERATION};
        }
        ${keyframes}
      `}</style>
      {bars.map((bar, idx) => {
        const y = (WAVEFORM_SVG_HEIGHT - bar.height) / WAVEFORM_HALF_DIVISOR;
        const barProgress = idx / WAVEFORM_BAR_COUNT;
        const isPlayed = barProgress <= progress;
        return (
          <line
            key={idx}
            x1={bar.x}
            y1={y}
            x2={bar.x}
            y2={y + bar.height}
            stroke={isPlayed ? WAVEFORM_STROKE_PLAYED : WAVEFORM_STROKE_UNPLAYED}
            strokeWidth={WAVEFORM_BAR_WIDTH}
            strokeLinecap="round"
            style={{
              transformOrigin: `${bar.x}px ${WAVEFORM_SVG_HEIGHT / WAVEFORM_HALF_DIVISOR}px`,
              animationDelay: isPlaying && isPlayed ? bar.animDelay : WAVEFORM_NO_DELAY,
              animationDuration: isPlaying && isPlayed
                ? `${WAVEFORM_ANIM_BASE_DURATION + (idx % WAVEFORM_ANIM_MODULUS) * WAVEFORM_ANIM_DURATION_STEP}s`
                : WAVEFORM_NO_DELAY,
            }}
            className={WAVEFORM_CLASS_BAR}
          />
        );
      })}
    </svg>
  );
};

export default AudioWaveform;