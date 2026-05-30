import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type CSSProperties,
  type ComponentPropsWithoutRef,
} from 'react';
import {
  motion,
  AnimatePresence,
  type Transition,
  type VariantLabels,
  type Target,
  type TargetAndTransition,
  type HTMLMotionProps,
  type MotionStyle,
} from 'framer-motion';

export interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

export interface RotatingTextProps extends Omit<HTMLMotionProps<'span'>, 'children'> {
  texts: string[];
  transition?: Transition;
  initial?: boolean | Target | VariantLabels;
  animate?: boolean | VariantLabels | TargetAndTransition;
  exit?: Target | VariantLabels;
  animatePresenceMode?: 'sync' | 'wait';
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: 'characters' | 'words' | 'lines' | string;
  onNext?: (index: number) => void;
  mainStyle?: CSSProperties;
  splitLevelStyle?: CSSProperties;
  elementLevelStyle?: CSSProperties;
}

const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: 'spring', damping: 25, stiffness: 300 },
      initial = { y: '100%', opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: '-120%', opacity: 0 },
      animatePresenceMode = 'wait',
      animatePresenceInitial = false,
      rotationInterval = 2000,
      staggerDuration = 0,
      staggerFrom = 'first',
      loop = true,
      auto = true,
      splitBy = 'characters',
      onNext,
      mainStyle,
      splitLevelStyle,
      elementLevelStyle,
      ...rest
    },
    ref,
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const splitIntoCharacters = useCallback((text: string): string[] => {
      const IntlWithSegmenter = Intl as typeof Intl & {
        Segmenter?: new (
          locales?: string | string[],
          options?: { granularity?: 'grapheme' | 'word' | 'sentence' },
        ) => { segment: (input: string) => Iterable<{ segment: string }> };
      };

      if (typeof Intl !== 'undefined' && typeof IntlWithSegmenter.Segmenter === 'function') {
        try {
          const segmenter = new IntlWithSegmenter.Segmenter('en', { granularity: 'grapheme' });
          return Array.from(segmenter.segment(text), (segment) => (segment as { segment: string }).segment);
        } catch {
          return Array.from(text);
        }
      }
      return Array.from(text);
    }, []);

    const elements = useMemo(() => {
      if (texts.length === 0) {
        return [] as Array<{ characters: string[]; needsSpace: boolean }>;
      }

      const currentText = texts[currentTextIndex] ?? '';

      if (splitBy === 'characters') {
        const words = currentText.split(' ');
        return words.map((word, index) => ({
          characters: splitIntoCharacters(word),
          needsSpace: index !== words.length - 1,
        }));
      }

      if (splitBy === 'words') {
        const words = currentText.split(' ');
        return words.map((word, index) => ({
          characters: [word],
          needsSpace: index !== words.length - 1,
        }));
      }

      if (splitBy === 'lines') {
        const lines = currentText.split('\n');
        return lines.map((line, index) => ({
          characters: [line],
          needsSpace: index !== lines.length - 1,
        }));
      }

      const parts = currentText.split(splitBy);
      return parts.map((part, index) => ({
        characters: [part],
        needsSpace: index !== parts.length - 1,
      }));
    }, [texts, currentTextIndex, splitBy, splitIntoCharacters]);

    const totalCharacters = useMemo(
      () => elements.reduce((sum, word) => sum + word.characters.length, 0),
      [elements],
    );

    const getStaggerDelay = useCallback(
      (index: number, totalChars: number): number => {
        if (staggerFrom === 'first') {
          return index * staggerDuration;
        }
        if (staggerFrom === 'last') {
          return (totalChars - 1 - index) * staggerDuration;
        }
        if (staggerFrom === 'center') {
          const center = Math.floor(totalChars / 2);
          return Math.abs(center - index) * staggerDuration;
        }
        if (staggerFrom === 'random') {
          const randomIndex = Math.floor(Math.random() * totalChars);
          return Math.abs(randomIndex - index) * staggerDuration;
        }
        return Math.abs(Number(staggerFrom) - index) * staggerDuration;
      },
      [staggerFrom, staggerDuration],
    );

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
        if (onNext) {
          onNext(newIndex);
        }
      },
      [onNext],
    );

    const next = useCallback(() => {
      if (texts.length === 0) {
        return;
      }
      const isLast = currentTextIndex === texts.length - 1;
      const nextIndex = isLast ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
      if (nextIndex !== currentTextIndex) {
        handleIndexChange(nextIndex);
      }
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
      if (texts.length === 0) {
        return;
      }
      const isFirst = currentTextIndex === 0;
      const prevIndex = isFirst ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1;
      if (prevIndex !== currentTextIndex) {
        handleIndexChange(prevIndex);
      }
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
      (index: number) => {
        if (texts.length === 0) {
          return;
        }
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) {
          handleIndexChange(validIndex);
        }
      },
      [texts.length, currentTextIndex, handleIndexChange],
    );

    const reset = useCallback(() => {
      if (currentTextIndex !== 0) {
        handleIndexChange(0);
      }
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(
      ref,
      () => ({
        next,
        previous,
        jumpTo,
        reset,
      }),
      [next, previous, jumpTo, reset],
    );

    useEffect(() => {
      if (!auto || texts.length <= 1) {
        return undefined;
      }
      const intervalId = window.setInterval(next, rotationInterval);
      return () => window.clearInterval(intervalId);
    }, [next, rotationInterval, auto, texts.length]);

    const { style: restStyle, ...restSpanProps } = rest as HTMLMotionProps<'span'>;

    if (texts.length === 0) {
      return null;
    }

    let runningCharacterIndex = 0;

    return (
      <motion.span
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          whiteSpace: 'pre-wrap',
          position: 'relative',
          ...mainStyle,
          ...((restStyle as CSSProperties) ?? {}),
        }}
        layout
        transition={transition}
        {...restSpanProps}
      >
        <span style={visuallyHidden}>{texts[currentTextIndex]}</span>
        <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
          <motion.span
            key={currentTextIndex}
            style={{
              display: splitBy === 'lines' ? 'flex' : 'inline-flex',
              flexDirection: splitBy === 'lines' ? 'column' : 'row',
              flexWrap: splitBy === 'lines' ? 'nowrap' : 'wrap',
              whiteSpace: 'pre-wrap',
              position: 'relative',
              ...splitLevelStyle,
            }}
            layout
            aria-hidden="true"
          >
            {elements.map((wordObj, wordIndex) => {
              const wordStartIndex = runningCharacterIndex;
              runningCharacterIndex += wordObj.characters.length;

              return (
                <span
                  key={`word-${wordIndex}`}
                  style={{
                    display: 'inline-flex',
                    overflow: 'hidden',
                    position: 'relative',
                    ...splitLevelStyle,
                  }}
                >
                  {wordObj.characters.map((character, charIndex) => {
                    const absoluteIndex = wordStartIndex + charIndex;
                    return (
                      <motion.span
                        key={`char-${character}-${absoluteIndex}`}
                        initial={initial}
                        animate={animate}
                        exit={exit}
                        transition={{
                          ...transition,
                          delay: getStaggerDelay(absoluteIndex, totalCharacters),
                        }}
                        style={{
                          display: 'inline-block',
                          ...elementLevelStyle,
                        }}
                      >
                        {character}
                      </motion.span>
                    );
                  })}
                  {wordObj.needsSpace ? <span style={{ whiteSpace: 'pre' }}> </span> : null}
                </span>
              );
            })}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    );
  },
);RotatingText.displayName = 'RotatingText';
export default RotatingText;
