import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ui/providers';

interface ParallaxLayer {
  type?: 'image' | 'gradient' | 'shape' | 'pattern';
  src?: string;
  alt: string;
  speedX: number;
  speedY: number;
  speedZ: number;
  rotation: number;
  distance: number;
  className?: string;
  zIndex: number;
  initialTop: string;
  initialLeft: string;
  width: string;
  gradient?: string;
  shape?: 'circle' | 'triangle' | 'hexagon' | 'square';
  pattern?: 'dots' | 'lines' | 'grid';
}

interface GlassmorphicCard {
  id: string;
  title: string;
  content: string;
  speedX: number;
  speedY: number;
  speedZ: number;
  rotation: number;
  initialTop: string;
  initialLeft: string;
  zIndex: number;
  width?: string;
  height?: string;
  glassEffect?: 'subtle' | 'medium' | 'strong';
  interactive?: boolean;
  stats?: { value: string; label: string };
}

interface ParallaxHeroProps {
  layers?: ParallaxLayer[];
  title?: string;
  className?: string;
  glassmorphicCards?: GlassmorphicCard[];
}

const defaultLayers: ParallaxLayer[] = [
  {
    type: 'gradient',
    alt: 'background-gradient',
    speedX: 0.02,
    speedY: 0.015,
    speedZ: 0,
    rotation: 0,
    distance: -200,
    zIndex: 1,
    initialTop: 'calc(50% - 50px)',
    initialLeft: 'calc(50% + 0px)',
    width: '3200px',
    gradient: 'from-background via-primary/20 to-background',
    className: 'opacity-30'
  }
];

const defaultGlassmorphicCards: GlassmorphicCard[] = [
  {
    id: 'card-1',
    title: 'Explore Wilderness',
    content: 'Discover the beauty of parallax landscapes',
    speedX: 0.15,
    speedY: 0.12,
    speedZ: 0.08,
    rotation: 0.01,
    initialTop: 'calc(50% - 250px)',
    initialLeft: 'calc(50% - 400px)',
    zIndex: 5,
    width: '280px',
    height: '180px',
    glassEffect: 'medium',
    interactive: true
  },
  {
    id: 'card-2',
    title: '3D Depth',
    content: 'Experience advanced glassmorphic effects',
    speedX: 0.08,
    speedY: 0.06,
    speedZ: 0.05,
    rotation: 0.02,
    initialTop: 'calc(50% + 50px)',
    initialLeft: 'calc(50% + 350px)',
    zIndex: 4,
    width: '240px',
    height: '160px',
    glassEffect: 'subtle',
    interactive: true
  },
  {
    id: 'card-3',
    title: 'Interactive Layers',
    content: 'Dynamic parallax with glass effects',
    speedX: 0.12,
    speedY: 0.09,
    speedZ: 0.06,
    rotation: 0.015,
    initialTop: 'calc(50% + 200px)',
    initialLeft: 'calc(50% - 300px)',
    zIndex: 3,
    width: '260px',
    height: '140px',
    glassEffect: 'strong',
    interactive: false
  }
];

const GlassmorphicCard: React.FC<{ card: GlassmorphicCard }> = ({ card }) => {
  const { theme } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const glassStyles = {
    subtle: 'bg-white/15 backdrop-blur-lg border border-white/25 shadow-xl',
    medium: 'bg-white/25 backdrop-blur-xl border border-white/35 shadow-2xl',
    strong: 'bg-white/35 backdrop-blur-2xl border border-white/45 shadow-2xl'
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'absolute transition-transform duration-450 ease-out',
        glassStyles[card.glassEffect || 'subtle'],
        theme.mode === 'dark' ? 'text-white' : 'text-gray-900',
        card.interactive ? 'cursor-pointer hover:scale-105' : 'cursor-default'
      )}
      style={{
        width: card.width,
        height: card.height,
        top: card.initialTop,
        left: card.initialLeft,
        zIndex: card.zIndex,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Card Glow Effect */}
      <div className="absolute inset-0 rounded-lg bg-linear-to-r from-white/20 via-transparent to-white/10 opacity-0" />
      
      <div className="relative z-10 p-6">
        {/* Card Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            theme.mode === 'dark' ? 'bg-linear-to-br from-blue-500/20 to-purple-500/30' : 'bg-linear-to-br from-blue-600/20 to-purple-600/30'
          )}>
            {card.stats && (
              <>
                <div className="text-2xl font-bold text-white mb-1">{card.stats.value}</div>
                <div className="text-xs uppercase tracking-wider text-white/70">{card.stats.label}</div>
              </>
            )}
          </div>
        </div>

        {/* Card Content */}
        <h3 className={cn(
          "text-xl font-bold mb-2 text-center",
          theme.mode === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          {card.title}
        </h3>

        <p className={cn(
          "text-sm opacity-80 text-center mb-4",
          theme.mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
        )}>
          {card.content}
        </p>
      </div>
    </div>
  );
};

const ParallaxHero: React.FC<ParallaxHeroProps> = ({
  layers = defaultLayers,
  glassmorphicCards = defaultGlassmorphicCards,
  title = 'WILDERNESS',
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLImageElement | null)[]>([]);
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [xValue, setXValue] = useState(0);
  const [yValue, setYValue] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const updateLayers = React.useCallback((
    cursorPosition: number,
    xVal: number,
    yVal: number,
    rotateDeg: number
  ) => {
    layers.forEach((layer, index) => {
      const { type, speedX, speedY, speedZ, rotation } = layer;

      if (type === 'image' && layerRefs.current[index]) {
        const el = layerRefs.current[index];
        if (!el) return;

        const computedLeft = parseFloat(getComputedStyle(el).left.replace('px', ''));
        const isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
        const zValue = (cursorPosition - computedLeft) * isInLeft * 0.1;

        el.style.transform = `perspective(2300px) translateZ(${zValue * speedZ}px) rotateY(${rotateDeg * rotation}deg) translateX(calc(-50% + ${-xVal * speedX}px)) translateY(calc(-50% + ${yVal * speedY}px))`;
      }

      if (type === 'gradient' && elementRefs.current[index]) {
        const el = elementRefs.current[index];
        if (!el) return;

        const computedLeft = parseFloat(getComputedStyle(el).left.replace('px', ''));
        const isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
        const zValue = (cursorPosition - computedLeft) * isInLeft * 0.1;

        el.style.transform = `perspective(2300px) translateZ(${zValue * speedZ}px) rotateY(${rotateDeg * rotation}deg) translateX(calc(-50% + ${-xVal * speedX}px)) translateY(calc(-50% + ${yVal * speedY}px))`;
      }

      if (type === 'shape' && elementRefs.current[index]) {
        const el = elementRefs.current[index];
        if (!el) return;

        const computedLeft = parseFloat(getComputedStyle(el).left.replace('px', ''));
        const isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
        const zValue = (cursorPosition - computedLeft) * isInLeft * 0.1;

        el.style.transform = `perspective(2300px) translateZ(${zValue * speedZ}px) rotateY(${rotateDeg * rotation}deg) translateX(calc(-50% + ${-xVal * speedX}px)) translateY(calc(-50% + ${yVal * speedY}px))`;
      }

      if (type === 'pattern' && elementRefs.current[index]) {
        const el = elementRefs.current[index];
        if (!el) return;

        const computedLeft = parseFloat(getComputedStyle(el).left.replace('px', ''));
        const isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
        const zValue = (cursorPosition - computedLeft) * isInLeft * 0.1;

        el.style.transform = `perspective(2300px) translateZ(${zValue * speedZ}px) rotateY(${rotateDeg * rotation}deg) translateX(calc(-50% + ${-xVal * speedX}px)) translateY(calc(-50% + ${yVal * speedY}px))`;
      }
    });
  }, [layers]);

  const updateCards = React.useCallback((
    cursorPosition: number,
    xVal: number,
    yVal: number,
    rotateDeg: number
  ) => {
    glassmorphicCards.forEach((card, index) => {
      const el = cardRefs.current[index];
      if (!el) return;

      const { speedX, speedY, speedZ, rotation } = card;

      const computedLeft = parseFloat(getComputedStyle(el).left.replace('px', ''));
      const isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
      const zValue = (cursorPosition - computedLeft) * isInLeft * 0.1;

      el.style.transform = `perspective(2300px) translateZ(${zValue * speedZ}px) rotateY(${rotateDeg * rotation}deg) translateX(calc(-50% + ${-xVal * speedX}px)) translateY(calc(-50% + ${yVal * speedY}px))`;
    });
  }, [glassmorphicCards]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      const newXValue = e.clientX - window.innerWidth / 2;
      const newYValue = e.clientY - window.innerHeight / 2;
      const newRotateDegree = (newXValue / (window.innerWidth / 2)) * 20;

      setXValue(newXValue);
      setYValue(newYValue);

      updateLayers(e.clientX, newXValue, newYValue, newRotateDegree);
      updateCards(e.clientX, newXValue, newYValue, newRotateDegree);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [updateLayers, updateCards]);



  return (
    <main
      ref={containerRef}
      className={cn(
        'relative h-screen w-screen overflow-hidden bg-linear-to-b from-sky-1900 to-sky-1700',
        className
      )}
    >
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{
            transform: windowWidth > 0 
              ? `translateY(${yValue * 0.2}px) translateX(${(xValue - windowWidth / 2) * 0.02}px)`
              : 'none'
          }}
        >
          <div className="absolute top-20 left-10 w-32 h-32 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-20 w-48 h-48 bg-linear-to-tr from-purple-500/15 to-pink-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-linear-to-bl from-cyan-500/10 to-blue-500/10 rounded-full blur-xl" />
        </div>

        <div 
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={{
            transform: windowWidth > 0 
              ? `translateY(${yValue * 0.5}px) translateX(${(xValue - windowWidth / 2) * 0.05}px)`
              : 'none'
          }}
        >
          <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-linear-to-r from-indigo-500/20 to-blue-500/20 rounded-lg blur-lg rotate-45" />
          <div className="absolute top-2/3 right-1/3 w-36 h-36 bg-linear-to-l from-pink-500/15 to-purple-500/15 rounded-full blur-xl rotate-12" />
          <div className="absolute bottom-1/3 left-1/2 w-28 h-28 bg-linear-to-t from-cyan-500/15 to-teal-500/15 rounded-lg blur-lg rotate-45" />
        </div>

        <div 
          className="absolute inset-0 transition-transform duration-100 ease-out"
          style={{
            transform: windowWidth > 0 
              ? `translateY(${yValue * 0.8}px) translateX(${(xValue - windowWidth / 2) * 0.1}px)`
              : 'none'
          }}
        >
          <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-linear-to-br from-violet-500/25 to-fuchsia-500/25 rounded-md blur-md rotate-12" />
          <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-linear-to-tl from-rose-500/20 to-pink-500/20 rounded-full blur-lg rotate-45" />
        </div>

        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/30" />
      </div>

      {/* Glassmorphic Cards */}
      {typeof window !== 'undefined' && glassmorphicCards.map((card) => (
        <GlassmorphicCard key={card.id} card={card} />
      ))}

      {/* Debug: Test card visibility */}
      {typeof window !== 'undefined' && (
        <div className="absolute top-4 left-4 z-100 bg-red-500/20 backdrop-blur-sm border border-white/30 p-4 rounded-lg">
          <h3 className="text-white text-lg font-bold">Debug Card</h3>
          <p className="text-white text-sm">If you see this, glassmorphic cards are working!</p>
        </div>
      )}

      {/* Hero Title */}
      <div
        ref={textRef}
        className={cn(
          "absolute z-9 text-center pointer-events-auto transition-transform duration-450 ease-out",
          theme.mode === 'dark' ? 'text-white' : 'text-gray-900'
        )}
        style={{
          top: 'calc(50% - 130px)',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <h1 className={cn(
          "font-bold text-[20rem] leading-[0.8] max-lg:text-[15rem] max-md:text-[5.8rem] max-sm:text-[3.3rem]",
          theme.mode === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          {title}
        </h1>
      </div>
    </main>
  );
};

export default function ParallaxHeroDemo() {
  return <ParallaxHero />;
}

export { ParallaxHero, type ParallaxHeroProps, type ParallaxLayer, type GlassmorphicCard };
