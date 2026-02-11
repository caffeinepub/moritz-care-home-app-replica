import { CodeStatus } from '../../backend';
import { Badge } from '@/components/ui/badge';

interface CodeStatusBadgeProps {
  codeStatus: CodeStatus;
  className?: string;
}

export default function CodeStatusBadge({ codeStatus, className }: CodeStatusBadgeProps) {
  const isDNR = codeStatus === CodeStatus.dnr;
  const label = isDNR ? 'DNR' : 'Full Code';

  return (
    <Badge
      variant={isDNR ? 'destructive' : 'secondary'}
      className={`font-bold ${isDNR ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-100 text-blue-900 hover:bg-blue-200'} ${className || ''}`}
    >
      {label}
    </Badge>
  );
}
