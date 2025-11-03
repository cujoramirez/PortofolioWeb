import { useEffect, useMemo, useRef, type CSSProperties, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type ScrollFloatProps = {
  children: string;
  scrollContainerRef?: RefObject<HTMLElement>;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  containerStyle?: CSSProperties;
  textStyle?: CSSProperties;
  immediate?: boolean;
  delay?: number;
};

const ScrollFloat = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
  as = 'h2',
  containerStyle,
  textStyle,
  immediate = false,
  delay = 0,
}: ScrollFloatProps) => {
  const containerRef = useRef<HTMLHeadingElement | null>(null);

  const splitText = useMemo(
    () =>
      children.split('').map((char, index) => {
        if (char === '\n') {
          return <br key={`scroll-float-break-${index}`} />;
        }

        return (
          <span className="inline-block word" key={`scroll-float-char-${index}`} style={{ display: 'inline-block' }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      }),
    [children],
  );

  const textStyleSignature = useMemo(() => JSON.stringify(textStyle ?? {}), [textStyle]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const scroller = scrollContainerRef?.current ?? window;
    const textElement = element.querySelector<HTMLElement>('span');
    const targetElement = textElement ?? element;
    const charElements = targetElement.querySelectorAll<HTMLElement>('.inline-block.word');

    if (charElements.length === 0) {
      return;
    }

    // Ensure gradient is visible and properly inherited
    if (typeof window !== 'undefined') {
      const computedStyle = window.getComputedStyle(targetElement);
      const backgroundImage = computedStyle.backgroundImage;
      
      if (backgroundImage && backgroundImage !== 'none') {
        // Make sure each character can show the gradient
        charElements.forEach((char) => {
          char.style.color = 'inherit';
          char.style.background = 'inherit';
          char.style.backgroundClip = 'inherit';
          char.style.webkitBackgroundClip = 'inherit';
          (char.style as any).webkitTextFillColor = 'inherit';
        });
      }
    }

    // Set initial state
    gsap.set(charElements, {
      willChange: 'opacity, transform',
      opacity: 0,
      yPercent: 120,
      scaleY: 2.3,
      scaleX: 0.7,
      transformOrigin: '50% 0%',
    });

    const animation = gsap.to(charElements, {
      duration: animationDuration,
      ease,
      opacity: 1,
      yPercent: 0,
      scaleY: 1,
      scaleX: 1,
      stagger,
      ...(immediate
        ? { delay }
        : {
            scrollTrigger: {
              trigger: targetElement,
              scroller,
              start: scrollStart,
              end: scrollEnd,
              scrub: true,
            },
          }),
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger, textStyleSignature, immediate, delay]);

  const Tag = as;

  return (
    <Tag
      ref={containerRef}
      className={`my-5 overflow-hidden ${containerClassName}`.trim()}
      style={containerStyle}
    >
      <span
        className={`inline-block text-[clamp(2.2rem,6vw,4rem)] leading-[1.4] ${textClassName}`.trim()}
        style={textStyle}
      >
        {splitText}
      </span>
    </Tag>
  );
};

export default ScrollFloat;
