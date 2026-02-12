interface LogoProps {
  variant?: 'header' | 'login' | 'icon' | 'small';
  className?: string;
}

export default function Logo({ variant = 'header', className = '' }: LogoProps) {
  // Use height-only sizing to preserve aspect ratio
  const sizeClasses = {
    header: 'h-10',
    login: 'h-10',
    icon: 'h-8',
    small: 'h-10',
  };

  const logoSrc = '/assets/generated/MoritzCareHomeLOGO-1.dim_512x512.png';

  return (
    <img
      src={logoSrc}
      alt="Moritz Care Home logo"
      className={`${sizeClasses[variant]} w-auto object-contain ${className}`}
    />
  );
}
