import { useEffect, useState } from 'react';

interface ConfettiProps {
  isActive: boolean;
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
}

export function Confetti({ isActive }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  
  useEffect(() => {
    if (isActive) {
      const colors = ['#6C63FF', '#63FFDB', '#FF6B6B'];
      const newPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // random position along the x-axis (percent)
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5, // random delay for animation
      }));
      
      setPieces(newPieces);
      
      // Clean up confetti after animation completes
      const timer = setTimeout(() => {
        setPieces([]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isActive]);
  
  if (!isActive && pieces.length === 0) return null;
  
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2.5 h-2.5 opacity-0"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            animation: `confetti 1s ease-out forwards`,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes confetti {
          0% { 
            transform: translateY(0) rotate(0deg); 
            opacity: 1;
          }
          100% { 
            transform: translateY(-100px) rotate(720deg); 
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
