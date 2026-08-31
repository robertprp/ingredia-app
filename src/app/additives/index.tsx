import { AdditiveListItem } from '@/components/ingredia/additive-list-item';
import { AppHeader } from '@/components/ingredia/app-header';
import { ScrollableScreen } from '@/components/ingredia/screen';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ADDITIVE_CATALOG } from '@/features/additives/catalog';
import { additiveRoute } from '@/lib/routes';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

export default function AdditiveCatalogScreen(): React.JSX.Element {
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLowerCase();
  const additives = useMemo(
    () => ADDITIVE_CATALOG.filter((item) => `${item.code} ${item.name}`.toLowerCase().includes(normalizedSearch)),
    [normalizedSearch]
  );

  return (
    <ScrollableScreen>
      <AppHeader title="Catálogo de aditivos" description="Busca por código E o nombre común." />
      <View className="flex-row gap-2">
        <View className="relative flex-1 justify-center">
          <Icon as={Search} className="absolute left-4 z-10 text-muted-foreground" size={19} />
          <Input className="h-[52px] rounded-[14px] pl-11 text-base" placeholder="E-202, sorbato…" value={search} onChangeText={setSearch} />
        </View>
        <Pressable accessibilityLabel="Abrir filtros" accessibilityRole="button" className="size-[52px] items-center justify-center rounded-[14px] border border-border bg-card">
          <Icon as={SlidersHorizontal} className="text-foreground" size={20} />
        </Pressable>
      </View>
      <View className="gap-3">
        {additives.map((additive) => (
          <AdditiveListItem
            additive={additive}
            key={additive.code}
            onPress={() => router.push(additiveRoute(additive.code))}
          />
        ))}
      </View>
    </ScrollableScreen>
  );
}
