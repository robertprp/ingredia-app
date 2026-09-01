import { AppHeader, SectionHeader } from '@/components/ingredia/app-header';
import { HealthDisclaimer } from '@/components/ingredia/health-disclaimer';
import { RiskBadge } from '@/components/ingredia/risk-badge';
import { ScrollableScreen } from '@/components/ingredia/screen';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { analysisRoute, ROUTES } from '@/lib/routes';
import { BookOpen, ChevronRight, ScanLine } from 'lucide-react-native';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ingrediaApi } from '@/services/api/ingredia-api';
import { apiQueryKeys } from '@/services/api/query-keys';

export default function HomeScreen(): React.JSX.Element {
  const entitlements = useQuery({ queryKey: apiQueryKeys.entitlements, queryFn: ingrediaApi.getEntitlements });
  const analyses = useQuery({ queryKey: apiQueryKeys.analyses('RECENT'), queryFn: () => ingrediaApi.listAnalyses('RECENT') });
  const latest = analyses.data?.items[0];
  const scanDescription = entitlements.data?.unlimitedScans
    ? 'Tienes escaneos ilimitados con Ingredia Plus.'
    : `Te quedan ${entitlements.data?.monthlyScansRemaining ?? 0} escaneos este mes.`;

  return (
    <ScrollableScreen>
      <AppHeader
        eyebrow="Buenos días"
        title="¿Qué quieres revisar?"
        description={scanDescription}
      />

      <Card className="gap-0 overflow-hidden border-0 bg-primary py-0">
        <CardContent className="gap-5 p-5">
          <View className="size-12 items-center justify-center rounded-full bg-white/15">
            <Icon as={ScanLine} className="text-primary-foreground" size={25} />
          </View>
          <View className="gap-2">
            <Text className="text-[22px] font-semibold leading-7 text-primary-foreground">
              Escanear ingredientes
            </Text>
            <Text className="text-base leading-6 text-primary-foreground/80">
              Fotografía una etiqueta para detectar y revisar sus aditivos.
            </Text>
          </View>
          <Button className="h-[52px] rounded-[14px] bg-white" onPress={() => router.push(ROUTES.scan)}>
            <Text className="font-semibold text-[#115C3B]">Abrir escáner</Text>
          </Button>
        </CardContent>
      </Card>

      <View className="gap-3">
        <SectionHeader title="Actividad reciente" detail="Último análisis" />
        {latest ? <Pressable
          accessibilityRole="button"
          className="rounded-2xl border border-border bg-card p-4 active:bg-muted"
          onPress={() => router.push(analysisRoute(latest.id))}>
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-2">
              <Text className="text-lg font-semibold">{latest.productName}</Text>
              <Text className="text-sm text-muted-foreground">{latest.additiveCount} aditivos · {new Date(latest.createdAt).toLocaleDateString('es-ES')}</Text>
              <RiskBadge level={latest.riskLevel} />
            </View>
            <Icon as={ChevronRight} className="text-muted-foreground" size={21} />
          </View>
        </Pressable> : <Text className="text-sm text-muted-foreground">Aún no tienes análisis. Escanea una etiqueta para empezar.</Text>}
      </View>

      <Pressable
        accessibilityRole="button"
        className="min-h-[64px] flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 active:bg-muted"
        onPress={() => router.push(ROUTES.additives)}>
        <View className="size-10 items-center justify-center rounded-full bg-secondary">
          <Icon as={BookOpen} className="text-primary" size={20} />
        </View>
        <View className="flex-1">
          <Text className="font-semibold">Explorar catálogo</Text>
          <Text className="text-sm text-muted-foreground">Busca por código E o nombre</Text>
        </View>
        <Icon as={ChevronRight} className="text-muted-foreground" size={20} />
      </Pressable>

      <HealthDisclaimer />
    </ScrollableScreen>
  );
}
