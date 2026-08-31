import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Leaf, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

interface AppHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actionIcon?: LucideIcon;
  onActionPress?: () => void;
}

export function AppHeader({
  title,
  description,
  eyebrow,
  actionIcon: ActionIcon,
  onActionPress,
}: AppHeaderProps): React.JSX.Element {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="size-9 items-center justify-center rounded-full bg-primary">
            <Icon as={Leaf} className="text-primary-foreground" size={19} strokeWidth={2} />
          </View>
          <Text className="text-lg font-semibold tracking-tight">Ingredia</Text>
        </View>
        {ActionIcon && onActionPress ? (
          <Pressable
            accessibilityLabel="Acción de pantalla"
            accessibilityRole="button"
            className="size-11 items-center justify-center rounded-full border border-border bg-card"
            onPress={onActionPress}>
            <Icon as={ActionIcon} className="text-foreground" size={22} strokeWidth={1.75} />
          </Pressable>
        ) : null}
      </View>
      <View className="gap-1">
        {eyebrow ? (
          <Text className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</Text>
        ) : null}
        <Text className="text-[28px] font-bold leading-[34px] tracking-tight">{title}</Text>
        {description ? (
          <Text className="text-base leading-6 text-muted-foreground">{description}</Text>
        ) : null}
      </View>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  detail?: string;
}

export function SectionHeader({ title, detail }: SectionHeaderProps): React.JSX.Element {
  return (
    <View className="flex-row items-end justify-between gap-4">
      <Text className="flex-1 text-[22px] font-semibold leading-7">{title}</Text>
      {detail ? <Text className="text-sm font-medium text-muted-foreground">{detail}</Text> : null}
    </View>
  );
}
