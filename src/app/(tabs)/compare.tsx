import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, Check, Lock, Plus } from 'lucide-react-native';

import { AppHeader } from '@/components/ingredia/app-header';
import { RiskBadge } from '@/components/ingredia/risk-badge';
import { ScrollableScreen } from '@/components/ingredia/screen';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ROUTES } from '@/lib/routes';
import { apiErrorMessage, ingrediaApi } from '@/services/api/ingredia-api';
import { apiQueryKeys } from '@/services/api/query-keys';

export default function CompareScreen(): React.JSX.Element {
  const [selected, setSelected] = useState<string[]>([]);
  const entitlements = useQuery({ queryKey: apiQueryKeys.entitlements, queryFn: ingrediaApi.getEntitlements });
  const analyses = useQuery({ queryKey: apiQueryKeys.analyses('RECENT'), queryFn: () => ingrediaApi.listAnalyses('RECENT') });
  const comparison = useMutation({
    mutationFn: () => ingrediaApi.compareAnalyses(selected as [string, string]),
    onError: (error) => Alert.alert('No se pudo comparar', apiErrorMessage(error)),
  });
  const allowed = entitlements.data?.productComparison ?? false;

  function toggle(id: string): void {
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : current.length < 2 ? [...current, id] : [current[1], id]);
    comparison.reset();
  }

  return (
    <ScrollableScreen>
      <AppHeader title="Comparar productos" description="Selecciona exactamente dos análisis y revisa cada diferencia." />
      {!allowed ? (
        <Card className="gap-0 py-0"><CardContent className="items-center gap-3 p-6"><View className="size-12 items-center justify-center rounded-full bg-muted"><Icon as={Lock} className="text-muted-foreground" size={23} /></View><Text className="text-center text-lg font-semibold">Comparación incluida en Ingredia Plus</Text><Text className="text-center text-sm leading-5 text-muted-foreground">El acceso se habilita cuando el servidor confirma tu suscripción.</Text><Button className="mt-2 h-[52px] w-full rounded-[14px]" onPress={() => router.push(ROUTES.subscription)}><Text className="font-semibold">Ver Ingredia Plus</Text></Button></CardContent></Card>
      ) : (
        <>
          <View className="flex-row items-center gap-3">
            <ComparisonSlot label="Producto 1" value={analyses.data?.items.find((item) => item.id === selected[0])?.productName} />
            <View className="size-10 items-center justify-center rounded-full bg-secondary"><Icon as={ArrowLeftRight} className="text-primary" size={19} /></View>
            <ComparisonSlot label="Producto 2" value={analyses.data?.items.find((item) => item.id === selected[1])?.productName} />
          </View>
          <View className="gap-2">
            <Text className="text-lg font-semibold">Tus análisis</Text>
            {analyses.isPending ? <Text className="text-muted-foreground">Cargando análisis…</Text> : null}
            {analyses.data?.items.map((item) => {
              const active = selected.includes(item.id);
              return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: active }} className={`flex-row items-center gap-3 rounded-2xl border p-4 ${active ? 'border-primary bg-secondary' : 'border-border bg-card'}`} key={item.id} onPress={() => toggle(item.id)}><View className={`size-6 items-center justify-center rounded-full border ${active ? 'border-primary bg-primary' : 'border-border'}`}>{active ? <Icon as={Check} className="text-primary-foreground" size={15} /> : null}</View><View className="flex-1"><Text className="font-semibold">{item.productName}</Text><Text className="text-xs text-muted-foreground">{item.additiveCount} aditivos</Text></View><RiskBadge level={item.riskLevel} /></Pressable>;
            })}
          </View>
          <Button className="h-[52px] rounded-[14px]" disabled={selected.length !== 2 || comparison.isPending} onPress={() => comparison.mutate()}><Text className="font-semibold">{comparison.isPending ? 'Comparando…' : 'Comparar productos'}</Text></Button>
          {comparison.data ? <Card className="gap-0 py-0"><CardContent className="gap-4 p-5"><Text className="text-xl font-semibold">Resultado</Text>{comparison.data.products.map((product) => <View className="gap-2 rounded-xl bg-muted p-3" key={product.analysisId}><Text className="font-semibold">{product.productName}</Text><Text className="text-sm text-muted-foreground">{product.additiveCount} aditivos</Text><RiskBadge level={product.maximumRisk} />{comparison.data.recommendedAnalysisId === product.analysisId ? <Text className="text-sm font-semibold text-primary">Opción recomendada</Text> : null}</View>)}<Text className="text-sm leading-5 text-muted-foreground">{comparison.data.reason}</Text></CardContent></Card> : null}
        </>
      )}
    </ScrollableScreen>
  );
}

function ComparisonSlot({ label, value }: { label: string; value?: string }): React.JSX.Element {
  return <View className="min-h-[116px] flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card p-3">{value ? <><Text className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Text><Text className="text-center font-semibold">{value}</Text></> : <><Icon as={Plus} className="text-primary" size={22} /><Text className="text-center text-sm font-semibold">Selecciona abajo</Text></>}</View>;
}
