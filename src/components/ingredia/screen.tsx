import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps extends PropsWithChildren {
  className?: string;
}

interface ScrollableScreenProps extends ScreenProps {
  contentClassName?: string;
}

export function Screen({ children, className }: ScreenProps): React.JSX.Element {
  return (
    <SafeAreaView className={cn('flex-1 bg-background', className)} edges={['top']}>
      <View className="flex-1 px-5">{children}</View>
    </SafeAreaView>
  );
}

export function ScrollableScreen({
  children,
  className,
  contentClassName,
}: ScrollableScreenProps): React.JSX.Element {
  return (
    <SafeAreaView className={cn('flex-1 bg-background', className)} edges={['top']}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        className="flex-1"
        contentContainerClassName={cn('gap-6 px-5 pb-12 pt-3', contentClassName)}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
