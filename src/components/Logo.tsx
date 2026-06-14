interface LogoMarkProps {
  size?: number;
  variant?: 'orange' | 'dark';
}

export const LogoMark = ({ size = 32, variant = 'orange' }: LogoMarkProps) => {
  const bg   = variant === 'orange' ? '#ea580c' : '#1c1917';
  const mark = variant === 'orange' ? '#ffffff'  : '#ea580c';
  const rx   = Math.round(size * 0.2);

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="40" height="40" rx={rx} fill={bg} />
      {/* left stem */}
      <rect x="6"  y="7"  width="7"  height="26" rx="1.5" fill={mark} transform="rotate(-8 9.5 20)"   />
      {/* right stem (shorter — F has no tail) */}
      <rect x="19" y="7"  width="7"  height="19" rx="1.5" fill={mark} transform="rotate(-8 22.5 16.5)" />
      {/* top bar spanning both stems */}
      <rect x="6"  y="7"  width="20" height="7"  rx="1.5" fill={mark} transform="rotate(-8 16 10.5)"   />
      {/* mid bar — P bowl bottom / F crossbar */}
      <rect x="6"  y="17" width="15" height="6"  rx="1.5" fill={mark} transform="rotate(-8 13.5 20)"   />
    </svg>
  );
};

interface LogoProps {
  variant?: 'orange' | 'dark';
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

const Logo = ({ variant = 'orange', size = 32, showWordmark = true, className = '' }: LogoProps) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <LogoMark size={size} variant={variant} />
    {showWordmark && (
      <span className="text-xl font-bold text-stone-900 tracking-tight leading-none">
        Porfil<span className="text-orange-600">r</span>
      </span>
    )}
  </div>
);

export default Logo;
