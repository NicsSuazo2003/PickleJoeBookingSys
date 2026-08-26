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
  primary:
    'bg-gold-400 text-forest-950 hover:bg-gold-300 active:bg-gold-500 shadow-sm font-semibold',
  secondary:
    'border border-gold-400 text-gold-300 hover:bg-gold-400/10 active:bg-gold-400/20 font-medium',
  ghost: 'text-cream hover:bg-forest-600/60 active:bg-forest-600 font-medium',
  danger: 'bg-error text-white hover:bg-error/90 active:bg-error/80 font-semibold',
  success: 'bg-success text-white hover:bg-success/90 active:bg-success/80 font-semibold',
};

const sizes: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
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
    const classes = `inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400/40 focus:ring-offset-2 focus:ring-offset-forest-900 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

    if ('to' in rest && rest.to) {
      return (
        <Link to={rest.to} className={classes}>
          {leftIcon}
          {children}
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
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
