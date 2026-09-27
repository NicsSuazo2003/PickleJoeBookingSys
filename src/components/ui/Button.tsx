import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    to?: undefined;
  };

type LinkButtonProps = BaseProps & {
  to: string;
};

type Props = ButtonProps | LinkButtonProps;

const variants: Record<Variant, string> = {
  // Primary: Solid vibrant Court Blue with crisp border and glow
  primary:
    'bg-court-600 text-white hover:bg-court-500 active:bg-court-700 shadow-glow-court font-semibold border border-court-400/50',

  // Secondary: High-contrast outlined surface that stands out against dark forest backgrounds
  secondary:
    'border border-forest-500 bg-forest-800 text-cream hover:border-court-400 hover:bg-forest-700 hover:text-white active:bg-forest-600 font-medium shadow-sm',

  // Ghost: Subtle flat button for tertiary actions
  ghost:
    'text-cream-muted hover:text-cream hover:bg-forest-800/60 active:bg-forest-700/60 font-medium',

  // Danger: Red tinted pill with clean affordance
  danger:
    'bg-error/20 text-red-300 border border-error/40 hover:bg-error hover:text-white active:bg-error/90 font-semibold',

  // Success: Green tinted pill with clean affordance
  success:
    'bg-success/20 text-green-300 border border-success/40 hover:bg-success hover:text-white active:bg-success/90 font-semibold',
};

const sizes: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5 font-bold',
};

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      fullWidth,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const classes = `inline-flex items-center justify-center select-none transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-court-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

    if ('to' in rest && rest.to) {
      return (
        <Link to={rest.to} className={classes}>
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </Link>
      );
    }

    const buttonProps = rest as ButtonProps;
    return (
      <button
        ref={ref}
        className={classes}
        disabled={isLoading ?? buttonProps.disabled}
        {...buttonProps}
      >
        {isLoading ? <Spinner /> : leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';