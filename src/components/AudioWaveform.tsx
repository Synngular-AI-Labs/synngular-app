import React from "react";

interface AudioWaveformProps {
  isPlaying: boolean;
}

/**
 * Animated audio waveform component.
 *
 * Container: width 195px (Fill), height 26px (Hug).
 * ~60 vertical bars whose heights cycle over time when `isPlaying` is true.
 * 12px horizontal padding on each side is applied by the parent container.
 */
const AudioWaveform: React.FC<AudioWaveformProps> = ({ isPlaying }) => {
  // Generate bar data â€“ 60 bars spread across the 195 px width.
  const barCount = 60;
  const svgWidth = 195;
  const svgHeight = 26;
  const barSpacing = svgWidth / barCount; // ~3.25 px per bar slot
  const barWidth = 1.5;

  // Create an initial set of heights and an animation that cycles them.
  const bars = React.useMemo(() => {
    const result: { x: number; height: number; animDelay: string }[] = [];
    for (let i = 0; i < barCount; i++) {
      const x = i * barSpacing + barSpacing / 2;
      // Base height: small random-ish values that look like an audio waveform
      const height = Math.max(
        2,
        Math.round(13 * (0.3 + 0.7 * Math.abs(Math.sin(i * 0.5 + 1.2))))
      );
      // Stagger: wave from left to right
      const animDelay = `${i * 0.04}s`;
      result.push({ x, height, animDelay });
    }
    return result;
  }, []);

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={isPlaying ? "waveform-playing" : ""}
    >
      <style>{`
        .waveform-playing .waveform-bar {
          animation: waveform-pulse 6s ease-in-out infinite;
        }
        @keyframes waveform-pulse {
          0%, 100% { transform: scaleY(1); }
          15% { transform: scaleY(1.8); }
          30% { transform: scaleY(0.6); }
          50% { transform: scaleY(2.2); }
          70% { transform: scaleY(0.9); }
          85% { transform: scaleY(1.5); }
        }
      `}</style>
      {bars.map((bar, idx) => {
        const y = (svgHeight - bar.height) / 2;
        return (
          <line
            key={idx}
            x1={bar.x}
            y1={y}
            x2={bar.x}
            y2={y + bar.height}
            stroke="white"
            strokeWidth={barWidth}
            strokeLinecap="round"
            style={{
              transformOrigin: `${bar.x}px ${svgHeight / 2}px`,
              animationDelay: isPlaying ? bar.animDelay : "0s",
              animationDuration: isPlaying ? `${5.5 + (idx % 5) * 0.5}s` : "0s",
            }}
            className="waveform-bar"
          />
        );
      })}
    </svg>
  );
};

export default AudioWaveform;