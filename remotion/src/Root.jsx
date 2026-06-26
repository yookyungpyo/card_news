import { Composition } from 'remotion';
import { Reel, CARD_FRAMES, TRANSITION_FRAMES } from './Reel';
import { slides } from './deck';

// total = sum(card durations) - overlap from each transition
const total =
  slides.length * CARD_FRAMES - (slides.length - 1) * TRANSITION_FRAMES;

export const RemotionRoot = () => {
  return (
    <Composition
      id="reel"
      component={Reel}
      durationInFrames={total}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
