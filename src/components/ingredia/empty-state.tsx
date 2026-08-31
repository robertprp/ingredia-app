import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyState({
  icon: EmptyIcon,
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps): React.JSX.Element {
  return (
    <View className="items-center gap-3 rounded-2xl border border-border bg-card px-6 py-8">
      <View className="size-14 items-center justify-center rounded-full bg-secondary">
        <Icon as={EmptyIcon} className="text-primary" size={26} />
      </View>
      <Text className="text-center text-lg font-semibold">{title}</Text>
      <Text className="text-center text-sm leading-5 text-muted-foreground">{description}</Text>
      {actionLabel && onActionPress ? (
        <Button className="mt-2 h-12 rounded-[14px] px-5" onPress={onActionPress}>
          <Text>{actionLabel}</Text>
        </Button>
      ) : null}
    </View>
  );
}
