import { AppHeader } from '@/components/ingredia/app-header';
import { EmptyState } from '@/components/ingredia/empty-state';
import { RiskBadge } from '@/components/ingredia/risk-badge';
import { ScrollableScreen } from '@/components/ingredia/screen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { ProductRiskLevel } from '@/features/additives/contracts';
import { analysisRoute, ROUTES } from '@/lib/routes';
import { Bookmark, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/icon';

export default function HistoryScreen(): React.JSX.Element {
  const [tab, setTab] = useState('recent');

  return (
    <ScrollableScreen>
      <AppHeader title="Historial" description="Revisa tus análisis recientes y guardados." />
      <Tabs className="gap-4" value={tab} onValueChange={setTab}>
        <TabsList className="mr-0 h-11 w-full rounded-xl">
          <TabsTrigger className="h-9 flex-1 rounded-lg" value="recent"><Text>Recientes</Text></TabsTrigger>
          <TabsTrigger className="h-9 flex-1 rounded-lg" value="saved"><Text>Guardados</Text></TabsTrigger>
        </TabsList>
        <TabsContent className="gap-3" value="recent">
          <HistoryItem name="Salsa de tomate" meta="3 aditivos · Hoy" level={ProductRiskLevel.CAUTION} />
          <HistoryItem name="Bebida de avena" meta="2 aditivos · 28 ago" level={ProductRiskLevel.LOW} />
        </TabsContent>
        <TabsContent value="saved">
          <EmptyState
            icon={Bookmark}
            title="Aún no hay guardados"
            description="Guarda un análisis para encontrarlo rápidamente aquí."
            actionLabel="Escanear un producto"
            onActionPress={() => router.push(ROUTES.scan)}
          />
        </TabsContent>
      </Tabs>
    </ScrollableScreen>
  );
}

function HistoryItem({ name, meta, level }: { name: string; meta: string; level: ProductRiskLevel }): React.JSX.Element {
  return (
    <Pressable className="rounded-2xl border border-border bg-card p-4 active:bg-muted" onPress={() => router.push(analysisRoute('demo'))}>
      <View className="flex-row items-start gap-3">
        <View className="flex-1 gap-2">
          <Text className="text-lg font-semibold">{name}</Text>
          <Text className="text-sm text-muted-foreground">{meta}</Text>
          <RiskBadge level={level} />
        </View>
        <Icon as={ChevronRight} className="text-muted-foreground" size={20} />
      </View>
    </Pressable>
  );
}
