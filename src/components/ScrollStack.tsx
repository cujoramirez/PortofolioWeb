import React, { ReactNode, useLayoutEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';

import { useLenis } from '../hooks/useLenis';

type LenisInstance = InstanceType<typeof Lenis>;

interface LenisScrollEvent {
  animatedScroll?: number;
  scroll: number;
  limit: number;
  velocity: number;
  direction: number;
  progress: number;
}

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div
    className={`scroll-stack-card ${itemClassName}`.trim()}
    style={{
      position: 'relative',
      width: '100%',
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d',
      transformOrigin: 'top center',
    }}
  >
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}) => {
  const { lenis: globalLenis } = useLenis();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<LenisInstance | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef(new Map<number, any>());
  const initialOffsetsRef = useRef<number[]>([]);
  const containerOffsetRef = useRef(0);
  const endElementRef = useRef<HTMLElement | null>(null);
  const isUpdatingRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const appliedScrollTopRef = useRef<number | null>(null);
  const pendingScrollTopRef = useRef<number | null>(null);
  const scheduledFrameRef = useRef<number | null>(null);
  const lenisRAFActiveRef = useRef(false);
  const lenisRAFTimeoutRef = useRef<number | null>(null);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value as string);
  }, []);

  const getScrollData = useCallback(
    (overrideScrollTop?: number) => {
      if (useWindowScroll) {
        const fallbackScroll = globalLenis?.scroll ?? window.scrollY;
        return {
          scrollTop:
            typeof overrideScrollTop === 'number'
              ? overrideScrollTop
              : fallbackScroll,
          containerHeight: window.innerHeight,
          scrollContainer: document.documentElement,
        };
      } else {
        const scroller = scrollerRef.current;
        return {
          scrollTop:
            typeof overrideScrollTop === 'number'
              ? overrideScrollTop
              : scroller
                ? scroller.scrollTop
                : 0,
          containerHeight: scroller ? scroller.clientHeight : 0,
          scrollContainer: scroller,
        };
      }
    },
    [globalLenis, useWindowScroll],
  );

  const updateCardTransforms = useCallback(
    (scrollOverride?: number) => {
      if (!cardsRef.current.length || isUpdatingRef.current) return;

      isUpdatingRef.current = true;
      const { scrollTop, containerHeight } = getScrollData(scrollOverride);

      if (
        appliedScrollTopRef.current !== null &&
        Math.abs(appliedScrollTopRef.current - scrollTop) < 0.05
      ) {
        isUpdatingRef.current = false;
        return;
      }

      const stackPositionPx = parsePercentage(stackPosition, containerHeight);
      const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

      const cachedEndElement = endElementRef.current;
      const endElement = cachedEndElement
        ? cachedEndElement
        : useWindowScroll
          ? (document.querySelector('.scroll-stack-end') as HTMLElement | null)
          : (scrollerRef.current?.querySelector('.scroll-stack-end') as HTMLElement | null);

      if (!cachedEndElement && endElement) {
        endElementRef.current = endElement;
      }

      let endElementTop = 0;
      if (endElement) {
        const endIndex = cardsRef.current.indexOf(endElement);
        const endLayoutTop = containerOffsetRef.current + endElement.offsetTop;

        if (endIndex >= 0) {
          const cachedEndOffset = initialOffsetsRef.current[endIndex];
          const resolvedEndOffset = Number.isFinite(cachedEndOffset) ? cachedEndOffset : endLayoutTop;

          if (!Number.isFinite(cachedEndOffset) || Math.abs(endLayoutTop - resolvedEndOffset) > 1) {
            initialOffsetsRef.current[endIndex] = endLayoutTop;
          }

          endElementTop = initialOffsetsRef.current[endIndex];
        } else {
          endElementTop = endLayoutTop;
        }
      }

      const metrics: Array<{
        card: HTMLElement;
        cardTop: number;
        triggerStart: number;
        triggerEnd: number;
        pinStart: number;
        pinEnd: number;
      }> = [];

      let topCardIndex = 0;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const layoutTop = containerOffsetRef.current + card.offsetTop;
        const cachedOffset = initialOffsetsRef.current[i];
        const cardTop = Number.isFinite(cachedOffset) ? cachedOffset : layoutTop;

        if (!Number.isFinite(cachedOffset) || Math.abs(layoutTop - cardTop) > 1) {
          initialOffsetsRef.current[i] = layoutTop;
        }

        const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
        const triggerEnd = cardTop - scaleEndPositionPx;
        const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
        const pinEnd = endElementTop - containerHeight / 2;

        if (scrollTop >= triggerStart) {
          topCardIndex = i;
        }

        metrics[i] = {
          card,
          cardTop,
          triggerStart,
          triggerEnd,
          pinStart,
          pinEnd,
        };
      });

      metrics.forEach((metric, i) => {
        if (!metric) return;

        const { card, cardTop, triggerStart, triggerEnd, pinStart, pinEnd } = metric;

        const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
        const targetScale = baseScale + i * itemScale;
        const scale = 1 - scaleProgress * (1 - targetScale);
        const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

        const blurDepth = topCardIndex > i ? topCardIndex - i : 0;
        const blur = blurAmount ? Math.max(0, blurDepth * blurAmount) : 0;

        let translateY = 0;
        const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

        if (isPinned) {
          translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
        } else if (scrollTop > pinEnd) {
          translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
        }

        const roundedTransform = {
          translateY: Math.round(translateY * 1000) / 1000,
          scale: Math.round(scale * 1000) / 1000,
          rotation: Math.round(rotation * 100) / 100,
          blur: Math.round(blur * 100) / 100,
        };

        const lastTransform = lastTransformsRef.current.get(i);
        const smoothingFactor = 0.16;
        const smoothedTransform = lastTransform
          ? {
              translateY:
                lastTransform.translateY +
                (roundedTransform.translateY - lastTransform.translateY) * smoothingFactor,
              scale:
                lastTransform.scale +
                (roundedTransform.scale - lastTransform.scale) * smoothingFactor,
              rotation:
                lastTransform.rotation +
                (roundedTransform.rotation - lastTransform.rotation) * smoothingFactor,
              blur:
                lastTransform.blur +
                (roundedTransform.blur - lastTransform.blur) * smoothingFactor,
            }
          : roundedTransform;

        const hasChanged =
          !lastTransform ||
          Math.abs(lastTransform.translateY - smoothedTransform.translateY) > 0.01 ||
          Math.abs(lastTransform.scale - smoothedTransform.scale) > 0.0004 ||
          Math.abs(lastTransform.rotation - smoothedTransform.rotation) > 0.04 ||
          Math.abs(lastTransform.blur - smoothedTransform.blur) > 0.04;

        if (hasChanged) {
          const transform = `translate3d(0, ${smoothedTransform.translateY}px, 0) scale(${smoothedTransform.scale}) rotate(${smoothedTransform.rotation}deg)`;
          const filter = smoothedTransform.blur > 0 ? `blur(${smoothedTransform.blur}px)` : '';

          card.style.transform = transform;
          card.style.filter = filter;

          lastTransformsRef.current.set(i, smoothedTransform);
        }

        if (i === metrics.length - 1) {
          const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
          if (isInView && !stackCompletedRef.current) {
            stackCompletedRef.current = true;
            onStackComplete?.();
          } else if (!isInView && stackCompletedRef.current) {
            stackCompletedRef.current = false;
          }
        }
      });

      appliedScrollTopRef.current = scrollTop;
      isUpdatingRef.current = false;
    },
    [
      itemScale,
      itemStackDistance,
      stackPosition,
      scaleEndPosition,
      baseScale,
      rotationAmount,
      blurAmount,
      useWindowScroll,
      onStackComplete,
      calculateProgress,
      parsePercentage,
      getScrollData,
    ],
  );

  // Coalesce Lenis scroll events so DOM writes happen once per animation frame.
  const flushPendingScroll = useCallback(() => {
    scheduledFrameRef.current = null;
    const pendingValue = pendingScrollTopRef.current;
    pendingScrollTopRef.current = null;

    if (typeof pendingValue === 'number') {
      updateCardTransforms(pendingValue);
    } else {
      updateCardTransforms(lastScrollTopRef.current);
    }
  }, [updateCardTransforms]);

  const handleScroll = useCallback(
    (event?: LenisScrollEvent) => {
      let nextScrollTop = lastScrollTopRef.current;

      if (event) {
        if (typeof event.animatedScroll === 'number') {
          nextScrollTop = event.animatedScroll;
        } else if (typeof event.scroll === 'number') {
          nextScrollTop = event.scroll;
        }
      } else if (useWindowScroll) {
        nextScrollTop = window.scrollY;
      } else if (scrollerRef.current) {
        nextScrollTop = scrollerRef.current.scrollTop;
      }

      const sanitizedScrollTop = Math.max(0, nextScrollTop);

      lastScrollTopRef.current = sanitizedScrollTop;
      pendingScrollTopRef.current = sanitizedScrollTop;

      if (scheduledFrameRef.current === null) {
        scheduledFrameRef.current = requestAnimationFrame(flushPendingScroll);
      }
    },
    [flushPendingScroll, useWindowScroll],
  );

  const startLenisRAF = useCallback(() => {
    if (useWindowScroll) {
      return;
    }
    if (lenisRAFActiveRef.current) return;
    lenisRAFActiveRef.current = true;

    const raf = (time: number) => {
      if (!lenisRAFActiveRef.current) return;
      lenisRef.current?.raf(time);
      animationFrameRef.current = requestAnimationFrame(raf);
    };
    animationFrameRef.current = requestAnimationFrame(raf);
  }, [useWindowScroll]);

  const stopLenisRAF = useCallback(() => {
    if (useWindowScroll) {
      return;
    }
    lenisRAFActiveRef.current = false;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [useWindowScroll]);

  const scheduleLenisRAFStop = useCallback(() => {
    if (useWindowScroll) {
      return;
    }
    if (lenisRAFTimeoutRef.current !== null) {
      clearTimeout(lenisRAFTimeoutRef.current);
    }
    lenisRAFTimeoutRef.current = window.setTimeout(() => {
      stopLenisRAF();
      lenisRAFTimeoutRef.current = null;
    }, 150);
  }, [stopLenisRAF, useWindowScroll]);

  const setupLenis = useCallback(() => {
    if (useWindowScroll) {
      if (!globalLenis) {
        lenisRef.current = null;
        return undefined;
      }

      const handler = (event: LenisScrollEvent) => {
        handleScroll(event);
      };

      globalLenis.on('scroll', handler);
      lenisRef.current = globalLenis;

      return () => {
        globalLenis.off('scroll', handler);
        if (lenisRef.current === globalLenis) {
          lenisRef.current = null;
        }
      };
    }

    const scroller = scrollerRef.current;
    if (!scroller) {
      return undefined;
    }

    const lenis = new Lenis({
      wrapper: scroller,
      content: scroller.querySelector('.scroll-stack-inner') as HTMLElement,
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      gestureOrientation: 'vertical',
      wheelMultiplier: 1,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075,
    });

    const handler = (event: LenisScrollEvent) => {
      startLenisRAF();
      scheduleLenisRAFStop();
      handleScroll(event);
    };

    lenis.on('scroll', handler);

    lenisRef.current = lenis;
    startLenisRAF();

    return () => {
      lenis.off('scroll', handler);
      lenis.destroy();
      if (lenisRef.current === lenis) {
        lenisRef.current = null;
      }
    };
  }, [globalLenis, handleScroll, scheduleLenisRAFStop, startLenisRAF, useWindowScroll]);

  useLayoutEffect(() => {
    if (!useWindowScroll && !scrollerRef.current) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : (scrollerRef.current?.querySelectorAll('.scroll-stack-card') ?? []),
    ) as HTMLElement[];
    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;
    const containerElement = useWindowScroll
      ? (document.querySelector('.scroll-stack-inner') as HTMLElement | null)
      : (scrollerRef.current?.querySelector('.scroll-stack-inner') as HTMLElement | null);

    if (containerElement && useWindowScroll) {
      const rect = containerElement.getBoundingClientRect();
      containerOffsetRef.current = rect.top + window.scrollY;
    } else {
      containerOffsetRef.current = 0;
    }

    const endElement = containerElement?.querySelector('.scroll-stack-end') as HTMLElement | null;
    endElementRef.current = endElement;

    initialOffsetsRef.current = cards.map((card) => containerOffsetRef.current + card.offsetTop);

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
      card.style.webkitTransform = 'translateZ(0)';
      card.style.perspective = '1000px';
      card.style.webkitPerspective = '1000px';
    });

    const teardownLenis = setupLenis();

    const initialScrollTop = useWindowScroll
      ? globalLenis?.scroll ?? window.scrollY
      : scrollerRef.current
        ? scrollerRef.current.scrollTop
        : 0;
    lastScrollTopRef.current = initialScrollTop;
    updateCardTransforms(initialScrollTop);

    return () => {
      if (typeof teardownLenis === 'function') {
        teardownLenis();
      }

      lenisRAFActiveRef.current = false;
      if (lenisRAFTimeoutRef.current !== null) {
        clearTimeout(lenisRAFTimeoutRef.current);
        lenisRAFTimeoutRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (scheduledFrameRef.current) {
        cancelAnimationFrame(scheduledFrameRef.current);
        scheduledFrameRef.current = null;
      }
      pendingScrollTopRef.current = null;
      appliedScrollTopRef.current = null;
      lastScrollTopRef.current = 0;
      endElementRef.current = null;
      if (lenisRef.current && !useWindowScroll) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    globalLenis,
    onStackComplete,
    setupLenis,
    updateCardTransforms,
  ]);

  const containerClassName = useWindowScroll
    ? `relative w-full overflow-visible ${className}`.trim()
    : `relative w-full h-full overflow-y-auto overflow-x-visible ${className}`.trim();

  const containerStyle: React.CSSProperties = useWindowScroll
    ? {
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
      }
    : {
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        willChange: 'scroll-position',
      };

  return (
    <div className={containerClassName} ref={scrollerRef} style={containerStyle}>
      <div
        className="scroll-stack-inner pt-[20vh] px-20 pb-[50rem] min-h-screen"
        style={useWindowScroll ? { pointerEvents: 'auto' } : undefined}
      >
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end w-full h-px" />
      </div>
    </div>
  );
};

export default ScrollStack;
