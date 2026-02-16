import { ReactNode } from 'react';
import { useResidentProfileEditorBackgroundMode } from '../../hooks/useResidentProfileEditorBackgroundMode';

interface ResidentProfileEditorSurfaceProps {
  children: ReactNode;
  className?: string;
}

export default function ResidentProfileEditorSurface({ children, className = '' }: ResidentProfileEditorSurfaceProps) {
  const { className: modeClassName } = useResidentProfileEditorBackgroundMode();

  return (
    <div className={`${modeClassName} ${className}`}>
      {children}
    </div>
  );
}
