import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'nav' | 'lg' | 'xl' | '2xl';
  withText?: boolean;
  to?: string;
}

export function Logo({ size = 'md', withText = true, to = '/' }: LogoProps) {
  const sizes = {
    sm: { image: 40, text: 'text-lg' },
    md: { image: 50, text: 'text-xl' },
    nav: { image: 64, text: 'text-xl' },
    lg: { image: 65, text: 'text-3xl' },
    xl: { image: 80, text: 'text-4xl' },
    '2xl': { image: 120, text: 'text-5xl' },
  };
  const s = sizes[size];

  const content = (
    <div className="flex items-center gap-2.5">
      <img
        src="/images/CC.png"
        alt="Center Court"
        width={s.image}
        height={s.image}
        className="object-contain"
      />
      {withText && (
        <span className={`font-display ${s.text} font-bold tracking-tight`}>
          {/* ⭐ "Center" = gold-400 (medium steel blue) */}
          <span className="text-gold-400">Center</span>
          {/* ⭐ "Court" = accentGreen-400 (sea/jade green) */}
          <span className="text-accentGreen-400">Court</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} aria-label="Center Court home">
        {content}
      </Link>
    );
  }
  return content;
}