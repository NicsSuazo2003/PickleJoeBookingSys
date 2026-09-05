// src/components/Logo.tsx
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  className?: string;
  withText?: boolean;
  showTagline?: boolean;
}

export function Logo({ 
  size = 'md', 
  to = '/',
  className = '',
  withText = true,
  showTagline = false
}: LogoProps) {
  const sizes = {
    sm: { 
      image: 'h-8 w-auto',
      text: 'text-lg tracking-[0.2em]',
      tagline: 'text-[8px] tracking-[0.25em]'
    },
    md: { 
      image: 'h-10 w-auto',
      text: 'text-xl tracking-[0.22em]',
      tagline: 'text-[10px] tracking-[0.28em]'
    },
    lg: { 
      image: 'h-14 w-auto',
      text: 'text-2xl tracking-[0.24em]',
      tagline: 'text-xs tracking-[0.3em]'
    },
  };
  const s = sizes[size];

  const Wrapper = to ? Link : 'div';

  const content = (
    <div className={`flex items-center gap-2.5 ${showTagline ? 'flex-col items-center' : ''}`}>
      <div className="flex items-center gap-2.5">
        <img
          src="/images/CC.png"
          alt="Center Court Pickleball Club"
          className={`${s.image} object-contain`}
        />
        {withText && (
          <div className="flex flex-col">
            <span
              className={`font-bold ${s.text}`}
              style={{
                fontFamily: "'Michroma', sans-serif",
                background: 'linear-gradient(135deg, #FFFFFF 0%, #EDE6D6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                letterSpacing: '0.22em',
              }}
            >
              CENTER COURT
            </span>
            {showTagline && (
              <span
                className={`text-cream-muted/70 font-medium uppercase ${s.tagline}`}
                style={{
                  fontFamily: "'Michroma', sans-serif",
                  letterSpacing: '0.3em',
                }}
              >
                Pickleball Club
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className={className}>{content}</Link>;
  }
  return content;
}