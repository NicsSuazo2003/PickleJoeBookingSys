import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  to?: string;
}

export function Logo({ size = 'md', withText = true, to = '/' }: LogoProps) {
  const sizes = {
    sm: { circle: 28, text: 'text-lg' },
    md: { circle: 36, text: 'text-xl' },
    lg: { circle: 52, text: 'text-3xl' },
  };
  const s = sizes[size];

  const content = (
    <div className="flex items-center gap-2.5">
      <svg
        width={s.circle}
        height={s.circle}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="24" cy="24" r="22" fill="#1A2E1A" stroke="#C9A94E" strokeWidth="2" />
        <path
          d="M14 28C14 20 18 14 24 14C30 14 34 20 34 28"
          stroke="#C9A94E"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M24 14V34" stroke="#C9A94E" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="20" r="3" fill="#D4AF37" />
      </svg>
      {withText && (
        <span className={`font-display ${s.text} font-bold tracking-tight text-cream`}>
          Center<span className="text-gold-400">Court</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return content;
}