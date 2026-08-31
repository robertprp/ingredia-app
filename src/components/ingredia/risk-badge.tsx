import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ProductRiskLevel } from '@/features/additives/contracts';
import { cn } from '@/lib/utils';
import {
  CircleCheck,
  CircleHelp,
  CircleX,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native';

interface RiskPresentation {
  label: string;
  icon: LucideIcon;
  containerClassName: string;
  textClassName: string;
}

const RISK_PRESENTATION: Record<ProductRiskLevel, RiskPresentation> = {
  [ProductRiskLevel.LOW]: {
    label: 'Riesgo bajo',
    icon: CircleCheck,
    containerClassName: 'border-risk-low/20 bg-risk-low-soft',
    textClassName: 'text-risk-low',
  },
  [ProductRiskLevel.CAUTION]: {
    label: 'Precaución',
    icon: TriangleAlert,
    containerClassName: 'border-risk-caution/20 bg-risk-caution-soft',
    textClassName: 'text-risk-caution',
  },
  [ProductRiskLevel.HIGH]: {
    label: 'Riesgo alto',
    icon: CircleX,
    containerClassName: 'border-risk-high/20 bg-risk-high-soft',
    textClassName: 'text-risk-high',
  },
  [ProductRiskLevel.VERY_HIGH]: {
    label: 'Riesgo muy alto',
    icon: CircleX,
    containerClassName: 'border-risk-very-high/20 bg-risk-very-high-soft',
    textClassName: 'text-risk-very-high',
  },
  [ProductRiskLevel.INSUFFICIENT_EVIDENCE]: {
    label: 'Evidencia insuficiente',
    icon: CircleHelp,
    containerClassName: 'border-evidence/20 bg-evidence-soft',
    textClassName: 'text-evidence',
  },
};

export interface RiskBadgeProps {
  level: ProductRiskLevel;
  size?: 'SMALL' | 'MEDIUM';
}

export function RiskBadge({ level, size = 'SMALL' }: RiskBadgeProps): React.JSX.Element {
  const presentation = RISK_PRESENTATION[level];
  const RiskIcon = presentation.icon;

  return (
    <Badge
      accessibilityLabel={presentation.label}
      className={cn(
        'self-start gap-1.5',
        presentation.containerClassName,
        size === 'MEDIUM' ? 'px-3 py-1.5' : 'px-2.5 py-1'
      )}
      variant="outline">
      <Icon as={RiskIcon} className={presentation.textClassName} size={size === 'MEDIUM' ? 17 : 14} />
      <Text className={cn('font-semibold', presentation.textClassName, size === 'MEDIUM' ? 'text-sm' : 'text-xs')}>
        {presentation.label}
      </Text>
    </Badge>
  );
}
