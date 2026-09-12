import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  to?: string;
}

export function Logo({ size = 'md', to = '/' }: LogoProps) {
  const sizes = {
    sm: { image: 56 },
    md: { image: 80 },
    lg: { image: 110 },
    xl: { image: 150 },
  };
  const s = sizes[size];

  const content = (
    <div className="flex items-center justify-center">
      <img
        src="/images/CC.png"
        alt="PickleJoe"
        width={s.image}
        height={s.image}
        className="object-contain"
      />
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return content;
}