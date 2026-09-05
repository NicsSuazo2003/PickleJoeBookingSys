import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  to?: string;
  showTagline?: boolean;
}

export function Logo({ 
  size = 'md', 
  withText = true, 
  to = '/',
  showTagline = false 
}: LogoProps) {
  const sizes = {
    sm: { 
      circle: 28, 
      text: 'text-lg tracking-[0.2em]',
      tagline: 'text-[8px] tracking-[0.25em]',
      strokeWidth: 1.5,
    },
    md: { 
      circle: 36, 
      text: 'text-xl tracking-[0.22em]',
      tagline: 'text-[10px] tracking-[0.28em]',
      strokeWidth: 2,
    },
    lg: { 
      circle: 52, 
      text: 'text-3xl tracking-[0.24em]',
      tagline: 'text-xs tracking-[0.3em]',
      strokeWidth: 2.5,
    },
  };
  const s = sizes[size];

  // Pickleball court with the signature arc/swoosh
  const logomark = (
    <svg
      width={s.circle}
      height={s.circle}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Court outline */}
      <rect x="4" y="4" width="40" height="40" rx="4" stroke="#C9A94E" strokeWidth={s.strokeWidth} />
      
      {/* Center line */}
      <line x1="24" y1="4" x2="24" y2="44" stroke="#C9A94E" strokeWidth={s.strokeWidth * 0.6} strokeOpacity="0.5" />
      
      {/* Net */}
      <line x1="4" y1="24" x2="44" y2="24" stroke="#C9A94E" strokeWidth={s.strokeWidth} />
      
      {/* The signature arc/swoosh - matching the splash screen design */}
      <path
        d="M 12 28 C 12 16, 36 16, 36 28"
        stroke="#C9A94E"
        strokeWidth={s.strokeWidth}
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      
      {/* Pickleball at the end of the arc */}
      <circle cx="36" cy="28" r={s.strokeWidth * 2.5} fill="#D4AF37" opacity="0.8" />
      <circle cx="36" cy="28" r={s.strokeWidth * 2.5} stroke="#C9A94E" strokeWidth={s.strokeWidth * 0.6} />
      
      {/* Small paddle at the start of the arc */}
      <rect
        x="7"
        y="24"
        width={s.strokeWidth * 2}
        height={s.strokeWidth * 3.5}
        rx={s.strokeWidth * 0.8}
        fill="#C9A94E"
        opacity="0.6"
        transform="rotate(-15, 8, 26)"
      />
    </svg>
  );

  const content = (
    <div className={`flex items-center gap-2.5 ${showTagline ? 'flex-col items-center' : ''}`}>
      <div className="flex items-center gap-2.5">
        {logomark}
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
    return <Link to={to}>{content}</Link>;
  }
  return content;
}