// src/components/Logo.tsx
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  className?: string;
}

export function Logo({ 
  size = 'md', 
  to = '/',
  className = ''
}: LogoProps) {
  const sizes = {
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-14 w-auto',
  };

  const Wrapper = to ? Link : 'div';

  return (
    <Wrapper
      to={to}
      className={`flex items-center ${className}`}
    >
      <img
        src="/images/CC.png"
        alt="Center Court Pickleball Club"
        className={`${sizes[size]} object-contain`}
      />
    </Wrapper>
  );
}