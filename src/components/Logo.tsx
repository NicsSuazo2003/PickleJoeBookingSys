import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  to?: string;
}

export function Logo({ size = 'md', withText = true, to = '/' }: LogoProps) {
  const sizes = {
    sm: { image: 28, text: 'text-lg' },
    md: { image: 36, text: 'text-xl' },
    lg: { image: 52, text: 'text-3xl' },
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