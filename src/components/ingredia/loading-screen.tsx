import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Leaf } from 'lucide-react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function LoadingScreen(): React.JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-background px-5" edges={['top', 'bottom']}>
      <View className="flex-1 justify-center gap-6">
        <View className="items-center gap-3">
          <View className="size-14 items-center justify-center rounded-full bg-primary">
            <Icon as={Leaf} className="text-primary-foreground" size={28} />
          </View>
          <Text className="text-xl font-semibold">Ingredia</Text>
        </View>
        <View className="gap-3">
          <Skeleton className="h-5 w-2/3 self-center rounded-full" />
          <Skeleton className="h-5 w-1/2 self-center rounded-full" />
        </View>
      </View>
    </SafeAreaView>
  );
}
