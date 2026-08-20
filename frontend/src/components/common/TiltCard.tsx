import React, { useRef, useState, useCallback } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glareEnabled?: boolean;
}

/**
 * TiltCard — A 3D perspective tilt card with mouse-tracking rotation and optional glare.
 * Uses CSS perspective + transform for smooth hardware-accelerated 3D effects.
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  intensity = 15,
  glareEnabled = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('rotateX(0deg) rotateY(0deg)');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const percentX = (e.clientX - centerX) / (rect.width / 2);
      const percentY = (e.clientY - centerY) / (rect.height / 2);

      const rotateX = (-percentY * intensity).toFixed(1);
      const rotateY = (percentX * intensity).toFixed(1);

      setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
      setGlarePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    },
    [intensity]
  );

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <div
      style={{ perspective: '1000px' }}
      className="tilt-card-container"
    >
      <div
        ref={cardRef}
        className={`relative transition-transform duration-150 ease-out ${className}`}
        style={{
          transform,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}

        {/* Glare overlay */}
        {glareEnabled && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200"
            style={{
              opacity: isHovered ? 0.18 : 0,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TiltCard;
