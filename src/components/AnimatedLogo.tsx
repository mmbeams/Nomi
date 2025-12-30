import React, { useState, useEffect, useRef } from 'react';

interface AnimatedLogoProps {
  onClick?: () => void;
  style?: React.CSSProperties;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ onClick, style }) => {
  // Safe initialization with fallback values
  const getSafeWindowDimensions = () => {
    if (typeof window !== 'undefined' && window.innerWidth > 0 && window.innerHeight > 0) {
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
    // Fallback for extension popup (typical size)
    return { x: 175, y: 225 };
  };
  
  const [viewportCenter, setViewportCenter] = useState(getSafeWindowDimensions());
  const [cursorPosition, setCursorPosition] = useState(getSafeWindowDimensions());
  const [smoothedEyePosition, setSmoothedEyePosition] = useState({ x: 0, y: 0 });
  const logoRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const smoothedPositionRef = useRef({ x: 0, y: 0 });
  // Use refs to access latest values in animation loop without causing re-renders
  const cursorPositionRef = useRef(getSafeWindowDimensions());
  const viewportCenterRef = useRef(getSafeWindowDimensions());

  // Lerp function for smooth interpolation
  const lerp = (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  };

  useEffect(() => {
    // Initialize viewport center on mount
    const initViewport = () => {
      if (typeof window !== 'undefined' && window.innerWidth > 0 && window.innerHeight > 0) {
        const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        setViewportCenter(center);
        setCursorPosition(center);
        viewportCenterRef.current = center;
        cursorPositionRef.current = center;
      }
    };
    initViewport();
    
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth > 0 && window.innerHeight > 0) {
        const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        setViewportCenter(center);
        viewportCenterRef.current = center;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const pos = { x: e.clientX, y: e.clientY };
      setCursorPosition(pos);
      cursorPositionRef.current = pos;
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54951e98-2bff-4fbd-949e-e65bbe5ee424',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AnimatedLogo.tsx:46',message:'Mouse move detected',data:{cursorX:e.clientX,cursorY:e.clientY,viewportCenterX:viewportCenterRef.current.x,viewportCenterY:viewportCenterRef.current.y},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    // Smooth eye movement animation loop
    const animate = () => {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        const logoCenterX = rect.left + rect.width / 2;
        const logoCenterY = rect.top + rect.height / 2;
        
        // Use refs to get latest cursor position without causing re-renders
        const currentCursor = cursorPositionRef.current;
        
        // Calculate direction from logo center to cursor
        const deltaX = currentCursor.x - logoCenterX;
        const deltaY = currentCursor.y - logoCenterY;
        
        // Normalize and scale for subtle movement (max 2px offset)
        const maxOffset = 2;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normalizedX = distance > 0 ? deltaX / distance : 0;
        const normalizedY = distance > 0 ? deltaY / distance : 0;
        const scale = Math.min(distance / 100, 1); // Scale based on distance, max at 100px
        const targetX = normalizedX * maxOffset * scale;
        const targetY = normalizedY * maxOffset * scale;
        
        // Smooth interpolation (lerp factor 0.1 for calm movement)
        const newX = lerp(smoothedPositionRef.current.x, targetX, 0.1);
        const newY = lerp(smoothedPositionRef.current.y, targetY, 0.1);
        
        smoothedPositionRef.current = { x: newX, y: newY };
        setSmoothedEyePosition({ x: newX, y: newY });
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // Calculate which corner should be rounded based on cursor position relative to viewport center
  const getRoundedCorner = () => {
    // Use current state values for rendering
    const deltaX = cursorPosition.x - viewportCenter.x;
    const deltaY = cursorPosition.y - viewportCenter.y;
    
    // Threshold for "exact center" (within 10px)
    const centerThreshold = 10;
    if (Math.abs(deltaX) < centerThreshold && Math.abs(deltaY) < centerThreshold) {
      return { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };
    }
    
    // Determine quadrant
    const isRight = deltaX > 0;
    const isBottom = deltaY > 0;
    
    const radius = 8; // Subtle corner radius (reduced from 14)
    
    // Calculate distance from center for smooth transition
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = Math.sqrt(viewportCenter.x * viewportCenter.x + viewportCenter.y * viewportCenter.y);
    const normalizedDistance = Math.min(distance / (maxDistance * 0.5), 1);
    const cornerRadius = radius * normalizedDistance;
    
    if (isBottom && !isRight) {
      // Bottom-left quadrant → top-right corner rounded
      return { topLeft: 0, topRight: cornerRadius, bottomLeft: 0, bottomRight: 0 };
    } else if (isBottom && isRight) {
      // Bottom-right quadrant → top-left corner rounded
      return { topLeft: cornerRadius, topRight: 0, bottomLeft: 0, bottomRight: 0 };
    } else if (!isBottom && !isRight) {
      // Top-left quadrant → bottom-right corner rounded
      return { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: cornerRadius };
    } else {
      // Top-right quadrant → bottom-left corner rounded
      return { topLeft: 0, topRight: 0, bottomLeft: cornerRadius, bottomRight: 0 };
    }
  };

  const cornerRadius = getRoundedCorner();

  // Calculate eye (smile) path offsets based on smoothed position
  const leftEyeOffsetX = smoothedEyePosition.x;
  const leftEyeOffsetY = smoothedEyePosition.y;
  const rightEyeOffsetX = smoothedEyePosition.x;
  const rightEyeOffsetY = smoothedEyePosition.y;

  // Create path for rectangle with one rounded corner
  const createRoundedRectPath = (x: number, y: number, width: number, height: number, r: { topLeft: number, topRight: number, bottomLeft: number, bottomRight: number }) => {
    const { topLeft, topRight, bottomLeft, bottomRight } = r;
    
    // Start from top-left (accounting for topLeft radius)
    let path = `M ${x + topLeft} ${y}`;
    
    // Top edge to top-right corner
    if (topRight > 0) {
      path += ` L ${x + width - topRight} ${y}`;
      path += ` Q ${x + width} ${y} ${x + width} ${y + topRight}`;
    } else {
      path += ` L ${x + width} ${y}`;
    }
    
    // Right edge to bottom-right corner
    if (bottomRight > 0) {
      path += ` L ${x + width} ${y + height - bottomRight}`;
      path += ` Q ${x + width} ${y + height} ${x + width - bottomRight} ${y + height}`;
    } else {
      path += ` L ${x + width} ${y + height}`;
    }
    
    // Bottom edge to bottom-left corner
    if (bottomLeft > 0) {
      path += ` L ${x + bottomLeft} ${y + height}`;
      path += ` Q ${x} ${y + height} ${x} ${y + height - bottomLeft}`;
    } else {
      path += ` L ${x} ${y + height}`;
    }
    
    // Left edge back to top-left corner
    if (topLeft > 0) {
      path += ` L ${x} ${y + topLeft}`;
      path += ` Q ${x} ${y} ${x + topLeft} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
    
    path += ' Z';
    return path;
  };

  const leftEyePath = createRoundedRectPath(12.56, 32.48, 17.92, 13.12, cornerRadius);
  const rightEyePath = createRoundedRectPath(41.2, 32.48, 17.92, 13.12, cornerRadius);

  return (
    <div 
      ref={logoRef}
      className="assistant-icon" 
      onClick={onClick} 
      style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
    >
      <svg width="75" height="58" viewBox="0 0 75 58" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M72.48 2.24H2.23999V55.04H72.48V2.24Z" stroke="black" strokeWidth="4.48"/>
        {/* Left eye - rectangle with dynamic rounded corners (fixed position) */}
        <path 
          d={leftEyePath}
          fill="black"
        />
        {/* Right eye - rectangle with dynamic rounded corners (fixed position) */}
        <path 
          d={rightEyePath}
          fill="black"
        />
        {/* Left smile - follows cursor direction */}
        <path 
          d="M10 28.5831C13.52 25.9697 22.544 22.3111 30.48 28.5831" 
          stroke="black" 
          strokeWidth="4.48" 
          strokeLinecap="round"
          style={{ 
            transform: `translate(${leftEyeOffsetX}px, ${leftEyeOffsetY}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        {/* Right smile - follows cursor direction */}
        <path 
          d="M39.92 28.5832C43.44 25.9698 52.464 22.3112 60.4 28.5832" 
          stroke="black" 
          strokeWidth="4.48" 
          strokeLinecap="round"
          style={{ 
            transform: `translate(${rightEyeOffsetX}px, ${rightEyeOffsetY}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </svg>
    </div>
  );
};

export default AnimatedLogo;
