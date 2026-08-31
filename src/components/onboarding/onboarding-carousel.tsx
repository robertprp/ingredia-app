import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type OnboardingSlide = {
  id: string;
  title: string;
  points: readonly string[];
  dark: boolean;
};

const SLIDES: readonly OnboardingSlide[] = [
  {
    id: 'programmable-money',
    title: 'Programmable money',
    points: ['Spend by merchant, place or time', 'Instant approval or decline'],
    dark: true,
  },
  {
    id: 'every-allocation',
    title: 'See every allocation',
    points: [
      'See available, reserved and refunding funds',
      'View limits, expiry and programme details',
    ],
    dark: false,
  },
] as const;

const WORDMARK = {
  dark: require('../../../assets/brand/nooveller-wordmark-white.png'),
  light: require('../../../assets/brand/nooveller-wordmark-purple.png'),
};

export function OnboardingCarousel() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const carouselHeight = height - insets.top - insets.bottom;
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = SLIDES[activeIndex];

  const goToSlide = useCallback((index: number) => {
    listRef.current?.scrollToIndex({ animated: true, index });
    setActiveIndex(index);
  }, []);

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      setActiveIndex(Math.min(Math.max(nextIndex, 0), SLIDES.length - 1));
    },
    [width]
  );

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={{ backgroundColor: activeSlide.dark ? '#000000' : '#FFFFFF', flex: 1 }}>
      <StatusBar style={activeSlide.dark ? 'light' : 'dark'} />

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        style={{ flex: 1, height: carouselHeight }}
        contentContainerStyle={{ height: carouselHeight }}
        bounces={false}
        decelerationRate="fast"
        keyExtractor={(slide) => slide.id}
        onMomentumScrollEnd={handleScrollEnd}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({ index, length: width, offset: width * index })}
        renderItem={({ item }) => (
          <View
            accessible
            accessibilityLabel={`${item.title}. ${item.points.join('. ')}`}
            className={item.dark ? 'flex-1 bg-black px-7 pb-7 pt-3' : 'flex-1 bg-white px-7 pb-7 pt-3'}
            style={{ height: carouselHeight, width }}>
            <View className="mx-auto w-full max-w-2xl flex-1">
              <Image
                accessibilityLabel="NOOVELLER"
                resizeMode="contain"
                source={item.dark ? WORDMARK.dark : WORDMARK.light}
                style={{ height: 48, width: 144 }}
              />

              <View className="flex-1" />

              <View className="pb-2">
                <View className="mb-8 flex-row gap-2" accessibilityRole="tablist">
                  {SLIDES.map((slide, index) => {
                    const isActive = activeIndex === index;
                    return (
                      <Pressable
                        key={slide.id}
                        accessibilityLabel={`Show slide ${index + 1}: ${slide.title}`}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isActive }}
                        hitSlop={12}
                        onPress={() => goToSlide(index)}
                        className={
                          isActive
                            ? item.dark
                              ? 'h-2 w-10 rounded-full bg-white'
                              : 'h-2 w-10 rounded-full bg-brand-purple'
                            : item.dark
                              ? 'h-2 w-10 rounded-full bg-white/25'
                              : 'h-2 w-10 rounded-full bg-brand-purple/20'
                        }
                      />
                    );
                  })}
                </View>

                <Text
                  variant="h1"
                  className={
                    item.dark
                      ? 'mb-8 max-w-xl text-left font-display text-5xl leading-[1.04] tracking-tight text-white'
                      : 'mb-8 max-w-xl text-left font-display text-5xl leading-[1.04] tracking-tight text-brand-ink'
                  }>
                  {item.title}
                </Text>

                <View className="gap-5">
                  {item.points.map((point) => (
                    <View key={point} className="flex-row items-start gap-4">
                      <Text
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                        className="w-6 font-sans-semibold text-2xl leading-7 text-brand-gold">
                        ✓
                      </Text>
                      <Text
                        className={
                          item.dark
                            ? 'flex-1 font-sans text-lg leading-7 text-white'
                            : 'flex-1 font-sans text-lg leading-7 text-brand-ink'
                        }>
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>

                {activeIndex === SLIDES.length - 1 ? (
                  <View className="mt-10">
                    <Button
                      className="h-14 rounded-2xl bg-brand-purple"
                      onPress={() => router.push(ROUTES.login)}>
                      <Text className="font-sans-semibold text-white">Continue with email</Text>
                    </Button>
                  </View>
                ) : (
                  <Button
                    className="mt-10 h-14 rounded-2xl bg-white"
                    onPress={() => goToSlide(activeIndex + 1)}>
                    <Text className="font-sans-semibold text-brand-ink">Continue</Text>
                  </Button>
                )}
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
