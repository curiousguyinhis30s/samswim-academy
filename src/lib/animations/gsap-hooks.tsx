'use client';

import React, {
  useRef,
  useCallback,
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// ============================================================================
// TYPES
// ============================================================================

interface BaseAnimationProps {
  delay?: number;
  duration?: number;
  ease?: string;
  children: ReactNode;
  className?: string;
}

interface FadeInProps extends BaseAnimationProps {
  y?: number;
  once?: boolean;
  start?: string;
}

interface SlideInProps extends BaseAnimationProps {
  direction?: 'left' | 'right';
  distance?: number;
  once?: boolean;
  start?: string;
}

interface ScaleInProps extends BaseAnimationProps {
  fromScale?: number;
  once?: boolean;
  start?: string;
}

interface StaggerChildrenProps extends BaseAnimationProps {
  stagger?: number;
  y?: number;
  once?: boolean;
  start?: string;
}

interface WaveTextProps extends Omit<BaseAnimationProps, 'children'> {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  stagger?: number;
  y?: number;
  once?: boolean;
  start?: string;
}

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  rippleColor?: string;
  rippleDuration?: number;
  rippleScale?: number;
}

interface FloatingElementProps extends BaseAnimationProps {
  amplitude?: number;
  frequency?: number;
  rotationAmplitude?: number;
}

// ============================================================================
// FADEIN COMPONENT
// Fade + slide up on scroll trigger
// ============================================================================

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps & HTMLAttributes<HTMLDivElement>>(
  (
    {
      children,
      delay = 0,
      duration = 0.8,
      ease = 'power3.out',
      y = 40,
      once = true,
      start = 'top 85%',
      className = '',
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
      () => {
        if (!containerRef.current) return;

        gsap.fromTo(
          containerRef.current,
          {
            opacity: 0,
            y,
          },
          {
            opacity: 1,
            y: 0,
            duration,
            delay,
            ease,
            scrollTrigger: {
              trigger: containerRef.current,
              start,
              toggleActions: once ? 'play none none none' : 'play reverse play reverse',
            },
          }
        );
      },
      { scope: containerRef, dependencies: [delay, duration, ease, y, once, start] }
    );

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={className}
        style={{ opacity: 0 }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FadeIn.displayName = 'FadeIn';

// ============================================================================
// SLIDEIN COMPONENT
// Slide from left/right with direction prop
// ============================================================================

export const SlideIn = forwardRef<HTMLDivElement, SlideInProps & HTMLAttributes<HTMLDivElement>>(
  (
    {
      children,
      direction = 'left',
      distance = 100,
      delay = 0,
      duration = 0.8,
      ease = 'power3.out',
      once = true,
      start = 'top 85%',
      className = '',
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
      () => {
        if (!containerRef.current) return;

        const xValue = direction === 'left' ? -distance : distance;

        gsap.fromTo(
          containerRef.current,
          {
            opacity: 0,
            x: xValue,
          },
          {
            opacity: 1,
            x: 0,
            duration,
            delay,
            ease,
            scrollTrigger: {
              trigger: containerRef.current,
              start,
              toggleActions: once ? 'play none none none' : 'play reverse play reverse',
            },
          }
        );
      },
      { scope: containerRef, dependencies: [direction, distance, delay, duration, ease, once, start] }
    );

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={className}
        style={{ opacity: 0 }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SlideIn.displayName = 'SlideIn';

// ============================================================================
// SCALEIN COMPONENT
// Scale from 0 to 1 on scroll
// ============================================================================

export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps & HTMLAttributes<HTMLDivElement>>(
  (
    {
      children,
      fromScale = 0,
      delay = 0,
      duration = 0.8,
      ease = 'back.out(1.7)',
      once = true,
      start = 'top 85%',
      className = '',
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
      () => {
        if (!containerRef.current) return;

        gsap.fromTo(
          containerRef.current,
          {
            opacity: 0,
            scale: fromScale,
          },
          {
            opacity: 1,
            scale: 1,
            duration,
            delay,
            ease,
            scrollTrigger: {
              trigger: containerRef.current,
              start,
              toggleActions: once ? 'play none none none' : 'play reverse play reverse',
            },
          }
        );
      },
      { scope: containerRef, dependencies: [fromScale, delay, duration, ease, once, start] }
    );

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={className}
        style={{ opacity: 0, transform: `scale(${fromScale})` }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScaleIn.displayName = 'ScaleIn';

// ============================================================================
// STAGGERCHILDREN COMPONENT
// Stagger animate children
// ============================================================================

export const StaggerChildren = forwardRef<
  HTMLDivElement,
  StaggerChildrenProps & HTMLAttributes<HTMLDivElement>
>(
  (
    {
      children,
      stagger = 0.1,
      y = 30,
      delay = 0,
      duration = 0.6,
      ease = 'power3.out',
      once = true,
      start = 'top 85%',
      className = '',
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
      () => {
        if (!containerRef.current) return;

        const childElements = containerRef.current.children;
        if (childElements.length === 0) return;

        gsap.fromTo(
          childElements,
          {
            opacity: 0,
            y,
          },
          {
            opacity: 1,
            y: 0,
            duration,
            delay,
            ease,
            stagger,
            scrollTrigger: {
              trigger: containerRef.current,
              start,
              toggleActions: once ? 'play none none none' : 'play reverse play reverse',
            },
          }
        );
      },
      { scope: containerRef, dependencies: [stagger, y, delay, duration, ease, once, start] }
    );

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={className}
        {...props}
      >
        {React.Children.map(children, (child) => (
          <div style={{ opacity: 0 }}>{child}</div>
        ))}
      </div>
    );
  }
);

StaggerChildren.displayName = 'StaggerChildren';

// ============================================================================
// WAVETEXT COMPONENT
// Letter-by-letter wave animation for headings
// ============================================================================

export const WaveText = forwardRef<HTMLElement, WaveTextProps & HTMLAttributes<HTMLElement>>(
  (
    {
      text,
      as: Component = 'h2',
      stagger = 0.03,
      y = 20,
      delay = 0,
      duration = 0.5,
      ease = 'power3.out',
      once = true,
      start = 'top 85%',
      className = '',
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLElement>(null);

    const letters = text.split('').map((char, index) => (
      <span
        key={index}
        className="wave-letter inline-block"
        style={{
          opacity: 0,
          display: char === ' ' ? 'inline' : 'inline-block',
          whiteSpace: char === ' ' ? 'pre' : 'normal',
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));

    useGSAP(
      () => {
        if (!containerRef.current) return;

        const letterElements = containerRef.current.querySelectorAll('.wave-letter');
        if (letterElements.length === 0) return;

        gsap.fromTo(
          letterElements,
          {
            opacity: 0,
            y,
            rotateX: -90,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration,
            delay,
            ease,
            stagger,
            scrollTrigger: {
              trigger: containerRef.current,
              start,
              toggleActions: once ? 'play none none none' : 'play reverse play reverse',
            },
          }
        );
      },
      { scope: containerRef, dependencies: [text, stagger, y, delay, duration, ease, once, start] }
    );

    return React.createElement(
      Component,
      {
        ref: (node: HTMLElement | null) => {
          (containerRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        },
        className,
        style: { perspective: '1000px' },
        ...props,
      },
      letters
    );
  }
);

WaveText.displayName = 'WaveText';

// ============================================================================
// RIPPLEBUTTON COMPONENT
// Ripple effect on click
// ============================================================================

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  (
    {
      children,
      rippleColor = 'rgba(255, 255, 255, 0.4)',
      rippleDuration = 0.6,
      rippleScale = 4,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleContainerRef = useRef<HTMLSpanElement>(null);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current || !rippleContainerRef.current) return;

        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${rippleColor};
          left: ${x}px;
          top: ${y}px;
          transform: translate(-50%, -50%) scale(0);
          pointer-events: none;
        `;

        rippleContainerRef.current.appendChild(ripple);

        gsap.to(ripple, {
          scale: rippleScale,
          opacity: 0,
          duration: rippleDuration,
          ease: 'power2.out',
          onComplete: () => {
            ripple.remove();
          },
        });

        onClick?.(e);
      },
      [onClick, rippleColor, rippleDuration, rippleScale]
    );

    return (
      <button
        ref={(node) => {
          (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`relative overflow-hidden ${className}`}
        onClick={handleClick}
        {...props}
      >
        <span
          ref={rippleContainerRef}
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        />
        {children}
      </button>
    );
  }
);

RippleButton.displayName = 'RippleButton';

// ============================================================================
// FLOATINGELEMENT COMPONENT
// Continuous gentle floating animation
// ============================================================================

export const FloatingElement = forwardRef<
  HTMLDivElement,
  FloatingElementProps & HTMLAttributes<HTMLDivElement>
>(
  (
    {
      children,
      amplitude = 10,
      frequency = 3,
      rotationAmplitude = 2,
      delay = 0,
      duration = 3,
      ease = 'sine.inOut',
      className = '',
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
      () => {
        if (!containerRef.current) return;

        const tl = gsap.timeline({
          repeat: -1,
          yoyo: true,
          delay,
        });

        tl.to(containerRef.current, {
          y: amplitude,
          rotation: rotationAmplitude,
          duration: duration / 2,
          ease,
        }).to(containerRef.current, {
          y: -amplitude,
          rotation: -rotationAmplitude,
          duration: duration / 2,
          ease,
        });

        // Add subtle horizontal movement
        gsap.to(containerRef.current, {
          x: amplitude / 3,
          duration: duration * 0.7,
          repeat: -1,
          yoyo: true,
          ease,
          delay: delay + 0.5,
        });
      },
      { scope: containerRef, dependencies: [amplitude, frequency, rotationAmplitude, delay, duration, ease] }
    );

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={className}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FloatingElement.displayName = 'FloatingElement';

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for creating custom GSAP animations with ScrollTrigger
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  animationConfig: gsap.TweenVars,
  scrollTriggerConfig?: ScrollTrigger.Vars,
  deps: unknown[] = []
) {
  const elementRef = useRef<T>(null);

  useGSAP(
    () => {
      if (!elementRef.current) return;

      gsap.fromTo(
        elementRef.current,
        { opacity: 0, ...animationConfig.from },
        {
          opacity: 1,
          ...animationConfig,
          scrollTrigger: {
            trigger: elementRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
            ...scrollTriggerConfig,
          },
        }
      );
    },
    { scope: elementRef, dependencies: deps }
  );

  return elementRef;
}

/**
 * Hook for creating timeline-based animations
 */
export function useTimeline(
  timelineCallback: (tl: gsap.core.Timeline) => void,
  config?: gsap.TimelineVars,
  deps: unknown[] = []
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline(config);
      timelineCallback(tl);
      return () => tl.kill();
    },
    { scope: containerRef, dependencies: deps }
  );

  return containerRef;
}

/**
 * Hook for parallax scrolling effects
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  speed: number = 0.5,
  direction: 'vertical' | 'horizontal' = 'vertical'
) {
  const elementRef = useRef<T>(null);

  useGSAP(
    () => {
      if (!elementRef.current) return;

      const prop = direction === 'vertical' ? 'y' : 'x';

      gsap.to(elementRef.current, {
        [prop]: () => window.innerHeight * speed * -1,
        ease: 'none',
        scrollTrigger: {
          trigger: elementRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    { scope: elementRef, dependencies: [speed, direction] }
  );

  return elementRef;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  FadeIn,
  SlideIn,
  ScaleIn,
  StaggerChildren,
  WaveText,
  RippleButton,
  FloatingElement,
  useScrollAnimation,
  useTimeline,
  useParallax,
};
