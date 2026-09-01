import { AdditiveListItem } from '@/components/ingredia/additive-list-item';
import { AppHeader } from '@/components/ingredia/app-header';
import { ScrollableScreen } from '@/components/ingredia/screen';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { additiveRoute } from '@/lib/routes';
import { apiQueryKeys } from '@/services/api/query-keys';
import { ingrediaApi } from '@/services/api/ingredia-api';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

export default function AdditiveCatalogScreen(): React.JSX.Element {
  const [search, setSearch] = useState('');
  const additivesQuery = useQuery({
    queryKey: apiQueryKeys.additives(search.trim()),
    queryFn: () => ingrediaApi.listAdditives(search),
  });

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
        {additivesQuery.isPending ? <Text className="text-center text-muted-foreground">Cargando catálogo…</Text> : null}
        {additivesQuery.isError ? <Text className="text-center text-destructive">No se pudo cargar el catálogo.</Text> : null}
        {additivesQuery.data?.items.map((additive) => (
          <AdditiveListItem
            additive={additive}
            key={additive.code}
            onPress={() => router.push(additiveRoute(additive.code))}
          />
        ))}
        {additivesQuery.data?.items.length === 0 ? <Text className="text-center text-muted-foreground">No se encontraron aditivos.</Text> : null}
      </View>
    </ScrollableScreen>
  );
}
