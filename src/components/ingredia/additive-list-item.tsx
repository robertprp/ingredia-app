import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { RiskBadge } from '@/components/ingredia/risk-badge';
import { PregnancyGuidance, type AdditiveSummary } from '@/features/additives/contracts';
import { Baby, ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

const PREGNANCY_LABEL: Record<PregnancyGuidance, string> = {
  [PregnancyGuidance.SUITABLE]: 'Sin restricciones específicas',
  [PregnancyGuidance.CAUTION]: 'Precaución en embarazo',
  [PregnancyGuidance.AVOID]: 'Evitar en embarazo',
  [PregnancyGuidance.INSUFFICIENT_EVIDENCE]: 'Evidencia insuficiente',
};

interface AdditiveListItemProps {
  additive: AdditiveSummary;
  onPress: () => void;
}

export function AdditiveListItem({ additive, onPress }: AdditiveListItemProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityHint="Abre el detalle del aditivo"
      accessibilityLabel={`${additive.code}, ${additive.name}`}
      accessibilityRole="button"
      className="min-h-[132px] rounded-2xl border border-border bg-card p-4 active:bg-muted"
      onPress={onPress}>
      <View className="flex-row items-start gap-3">
        <View className="flex-1 gap-2">
          <View className="flex-row items-baseline gap-2">
            <Text className="text-lg font-semibold">{additive.code}</Text>
            <Text className="flex-1 text-base font-medium">{additive.name}</Text>
          </View>
          <Text className="text-sm text-muted-foreground">{additive.category}</Text>
          <RiskBadge level={additive.riskLevel} />
          <View className="flex-row items-center gap-1.5">
            <Icon as={Baby} className="text-muted-foreground" size={15} />
            <Text className="text-xs font-medium text-muted-foreground">
              {PREGNANCY_LABEL[additive.pregnancyGuidance]}
            </Text>
          </View>
        </View>
        <Icon as={ChevronRight} className="mt-1 text-muted-foreground" size={20} />
      </View>
    </Pressable>
  );
}
