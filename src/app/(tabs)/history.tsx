import { AppHeader } from '@/components/ingredia/app-header';
import { EmptyState } from '@/components/ingredia/empty-state';
import { RiskBadge } from '@/components/ingredia/risk-badge';
import { ScrollableScreen } from '@/components/ingredia/screen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import type { AnalysisListItem } from '@/features/analyses/contracts';
import { analysisRoute, ROUTES } from '@/lib/routes';
import { Bookmark, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { useQuery } from '@tanstack/react-query';
import { ingrediaApi } from '@/services/api/ingredia-api';
import { apiQueryKeys } from '@/services/api/query-keys';

export default function HistoryScreen(): React.JSX.Element {
  const [tab, setTab] = useState('recent');
  const filter = tab === 'saved' ? 'SAVED' : 'RECENT';
  const analysesQuery = useQuery({ queryKey: apiQueryKeys.analyses(filter), queryFn: () => ingrediaApi.listAnalyses(filter) });
  const items = analysesQuery.data?.items ?? [];

  return (
    <ScrollableScreen>
      <AppHeader title="Historial" description="Revisa tus análisis recientes y guardados." />
      <Tabs className="gap-4" value={tab} onValueChange={setTab}>
        <TabsList className="mr-0 h-11 w-full rounded-xl">
          <TabsTrigger className="h-9 flex-1 rounded-lg" value="recent"><Text>Recientes</Text></TabsTrigger>
          <TabsTrigger className="h-9 flex-1 rounded-lg" value="saved"><Text>Guardados</Text></TabsTrigger>
        </TabsList>
        <TabsContent className="gap-3" value="recent">
          {tab === 'recent' && analysesQuery.isPending ? <Text className="text-center text-muted-foreground">Cargando historial…</Text> : null}
          {tab === 'recent' && items.map((item) => <HistoryItem item={item} key={item.id} />)}
          {tab === 'recent' && !analysesQuery.isPending && items.length === 0 ? <EmptyState icon={Bookmark} title="Aún no hay análisis" description="Tus nuevos análisis aparecerán aquí." actionLabel="Escanear un producto" onActionPress={() => router.push(ROUTES.scan)} /> : null}
        </TabsContent>
        <TabsContent value="saved">
          {tab === 'saved' && analysesQuery.isPending ? <Text className="text-center text-muted-foreground">Cargando guardados…</Text> : null}
          {tab === 'saved' && items.map((item) => <HistoryItem item={item} key={item.id} />)}
          {tab === 'saved' && !analysesQuery.isPending && items.length === 0 ? <EmptyState
            icon={Bookmark}
            title="Aún no hay guardados"
            description="Guarda un análisis para encontrarlo rápidamente aquí."
            actionLabel="Escanear un producto"
            onActionPress={() => router.push(ROUTES.scan)}
          /> : null}
        </TabsContent>
      </Tabs>
    </ScrollableScreen>
  );
}

function HistoryItem({ item }: { item: AnalysisListItem }): React.JSX.Element {
  return (
    <Pressable className="rounded-2xl border border-border bg-card p-4 active:bg-muted" onPress={() => router.push(analysisRoute(item.id))}>
      <View className="flex-row items-start gap-3">
        <View className="flex-1 gap-2">
          <Text className="text-lg font-semibold">{item.productName}</Text>
          <Text className="text-sm text-muted-foreground">{item.additiveCount} aditivos · {new Date(item.createdAt).toLocaleDateString('es-ES')}</Text>
          <RiskBadge level={item.riskLevel} />
        </View>
        <Icon as={ChevronRight} className="text-muted-foreground" size={20} />
      </View>
    </Pressable>
  );
}
