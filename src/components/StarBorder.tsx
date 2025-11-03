import React from 'react';

type StarBorderProps<T extends React.ElementType> = Omit<
  React.ComponentPropsWithoutRef<T>,
  'color'
> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties['animationDuration'];
  thickness?: number;
};

const StarBorder = <T extends React.ElementType = 'button'>({
  as,
  className = '',
  color = '#a855f7',
  speed = '6s',
  thickness: _thickness = 1,
  style,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || 'button';

  return (
    <Component
      className={`relative inline-block rounded-[10px] ${className}`}
      {...(rest as any)}
      style={{
        padding: 0,
        overflow: 'visible',
        ...(style as React.CSSProperties),
      }}
    >
      {/* Animated star lights layer - behind everything */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          overflow: 'visible',
        }}
      >
        {/* Orbiting light 1 - starts from top */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '1px',
            height: '1px',
          }}
        >
          <div
            className="absolute w-[40px] h-[40px] -left-[20px] -top-[20px] animate-star-movement-top"
            style={{
              background: `radial-gradient(circle, ${color}, ${color}cc 25%, ${color}88 50%, transparent 70%)`,
              animationDuration: speed,
              filter: 'blur(10px)',
            }}
          />
        </div>
        {/* Orbiting light 2 - starts from bottom */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '1px',
            height: '1px',
          }}
        >
          <div
            className="absolute w-[40px] h-[40px] -left-[20px] -top-[20px] animate-star-movement-bottom"
            style={{
              background: `radial-gradient(circle, ${color}, ${color}cc 25%, ${color}88 50%, transparent 70%)`,
              animationDuration: speed,
              filter: 'blur(10px)',
            }}
          />
        </div>
      </div>

      {/* Glow border layer */}
      <div
        className="pointer-events-none absolute inset-[-2px] rounded-[12px]"
        aria-hidden="true"
        style={{
          border: `1.5px solid ${color}`,
          opacity: 0.7,
          boxShadow: `0 0 20px ${color}99, inset 0 0 20px ${color}33`,
        }}
      />

      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
