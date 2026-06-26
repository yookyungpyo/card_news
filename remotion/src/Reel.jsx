import { useEffect, useState } from 'react';
import {
  AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, delayRender, continueRender,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slides, theme, meta } from './deck';

export const CARD_FRAMES = 95;       // ~3.2s per card
export const TRANSITION_FRAMES = 18; // ~0.6s cross-fade

const FONT = "'Pretendard', sans-serif";
const PAD = 96;

// inline *…* emphasis -> handwriting span
const renderInline = (line) =>
  line.split(/(\*[^*]+\*)/g).filter(Boolean).map((p, i) =>
    p.startsWith('*') && p.endsWith('*') ? (
      <span key={i} style={{ fontFamily: "'HandKR', sans-serif", color: theme.primary, fontSize: '1.34em', lineHeight: 1 }}>
        {p.slice(1, -1)}
      </span>
    ) : (
      <span key={i}>{p}</span>
    )
  );

const RichLines = ({ text, style }) =>
  text.split('\n').map((ln, i) => (
    <div key={i} style={style}>{renderInline(ln)}</div>
  ));

const Scene = ({ slide, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = (d) => interpolate(frame, [d, d + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rise = (d, dist = 46) => interpolate(frame, [d, d + 16], [dist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const charSpring = spring({ frame: frame - 6, fps, config: { damping: 16, mass: 0.7 } });

  const isContent = slide.type === 'content';
  const badge = slide.badge || (slide.type === 'outro' ? meta.topic : null);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: theme.text }}>
      {/* background */}
      <AbsoluteFill style={{
        background: `radial-gradient(1400px 900px at 82% 8%, ${theme.bgAccent} 0%, transparent 55%), ${theme.bg}`,
      }} />
      {/* accent top-right bar */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 260, height: 14, background: theme.primary }} />

      {/* badge */}
      {badge && (
        <div style={{
          position: 'absolute', top: 150, left: PAD,
          opacity: fadeIn(0), transform: `translateY(${rise(0, 24)}px)`,
        }}>
          <span style={{
            background: theme.primary, color: '#fff', fontWeight: 800, fontSize: 34,
            letterSpacing: 1, padding: '16px 32px', borderRadius: 999,
          }}>{badge}</span>
        </div>
      )}

      {/* pager for content */}
      {isContent && (
        <div style={{ position: 'absolute', top: 158, right: PAD, fontSize: 34, fontWeight: 800, color: theme.textDim, opacity: fadeIn(2) }}>
          <span style={{ color: theme.primary }}>{idx}</span> / {slides.length - 2}
        </div>
      )}

      {/* main text block */}
      <div style={{ position: 'absolute', left: PAD, right: PAD, top: 760 }}>
        {isContent && (
          <div style={{
            width: 150, height: 150, borderRadius: 36, marginBottom: 40,
            background: 'rgba(43,76,126,0.10)', border: `2px solid ${theme.primary}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 84,
            opacity: fadeIn(4), transform: `scale(${interpolate(charSpring, [0, 1], [0.7, 1])})`,
          }}>{slide.icon}</div>
        )}

        {(slide.type === 'cover' || slide.type === 'outro') && (
          <div style={{ opacity: fadeIn(4), transform: `translateY(${rise(4)}px)` }}>
            <RichLines text={slide.title} style={{ fontSize: 110, fontWeight: 900, lineHeight: 1.16, letterSpacing: -2 }} />
          </div>
        )}

        {isContent && (
          <>
            <div style={{ width: 84, height: 9, background: theme.primary, borderRadius: 5, marginBottom: 34, opacity: fadeIn(6) }} />
            <div style={{ opacity: fadeIn(8), transform: `translateY(${rise(8)}px)` }}>
              <RichLines text={slide.heading} style={{ fontSize: 80, fontWeight: 900, lineHeight: 1.18, letterSpacing: -1 }} />
            </div>
            <div style={{ marginTop: 40, opacity: fadeIn(16) }}>
              <RichLines text={slide.body} style={{ fontSize: 47, lineHeight: 1.55, color: theme.textDim, fontWeight: 500 }} />
            </div>
          </>
        )}

        {slide.type === 'cover' && (
          <div style={{ marginTop: 44, opacity: fadeIn(16) }}>
            <RichLines text={slide.subtitle} style={{ fontSize: 46, color: theme.textDim, fontWeight: 600, lineHeight: 1.4 }} />
          </div>
        )}
        {slide.type === 'outro' && (
          <div style={{ marginTop: 50, opacity: fadeIn(16) }}>
            <RichLines text={slide.cta} style={{ fontSize: 46, color: theme.primary, fontWeight: 800, lineHeight: 1.4 }} />
          </div>
        )}
      </div>

      {/* character — kept modest in size so the ~100px pose art stays crisp */}
      <Img
        src={staticFile('poses/' + slide.pose)}
        style={{
          position: 'absolute', bottom: 190,
          height: slide.type === 'cover' ? 400 : slide.type === 'outro' ? 360 : 290,
          [slide.pos === 'bl' ? 'left' : 'right']: 64,
          transform: `${slide.flip ? 'scaleX(-1) ' : ''}scale(${charSpring}) translateY(${interpolate(charSpring, [0, 1], [40, 0])}px)`,
          transformOrigin: 'bottom center',
          filter: 'drop-shadow(0 14px 32px rgba(0,0,0,0.24))',
        }}
      />

      {/* footer */}
      <div style={{
        position: 'absolute', left: PAD, right: PAD, bottom: 120,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 32, fontWeight: 700, color: theme.textDim, opacity: fadeIn(10),
      }}>
        <span>{meta.brand}</span>
        <span>{meta.contact}</span>
      </div>
    </AbsoluteFill>
  );
};

export const Reel = () => {
  const [handle] = useState(() => delayRender('load-fonts'));
  useEffect(() => {
    Promise.all([
      new FontFace('Pretendard', `url(${staticFile('fonts/PretendardVariable.woff2')}) format('woff2')`).load(),
      new FontFace('HandKR', `url(${staticFile('fonts/NanumPenScript-Regular.ttf')}) format('truetype')`).load(),
    ])
      .then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(handle); })
      .catch(() => continueRender(handle));
  }, [handle]);

  const children = [];
  slides.forEach((s, i) => {
    children.push(
      <TransitionSeries.Sequence key={`s${i}`} durationInFrames={CARD_FRAMES}>
        <Scene slide={s} idx={s.index} />
      </TransitionSeries.Sequence>
    );
    if (i < slides.length - 1) {
      children.push(
        <TransitionSeries.Transition
          key={`t${i}`}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
          presentation={fade()}
        />
      );
    }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <TransitionSeries>{children}</TransitionSeries>
    </AbsoluteFill>
  );
};
