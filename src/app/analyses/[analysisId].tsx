import { AdditiveListItem } from '@/components/ingredia/additive-list-item';
import { AppHeader, SectionHeader } from '@/components/ingredia/app-header';
import { HealthDisclaimer } from '@/components/ingredia/health-disclaimer';
import { RiskBadge } from '@/components/ingredia/risk-badge';
import { ScrollableScreen } from '@/components/ingredia/screen';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ADDITIVE_CATALOG } from '@/features/additives/catalog';
import { ProductRiskLevel } from '@/features/additives/contracts';
import { additiveRoute } from '@/lib/routes';
import { ArrowLeft, Baby, Bookmark } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function AnalysisResultScreen(): React.JSX.Element {
  const { analysisId } = useLocalSearchParams<{ analysisId: string }>();
  const detectedAdditives = [ADDITIVE_CATALOG[2], ADDITIVE_CATALOG[0], ADDITIVE_CATALOG[1]];

  return (
    <ScrollableScreen>
      <View className="flex-row items-center justify-between">
        <Button accessibilityLabel="Volver" className="size-11 rounded-full" size="icon" variant="outline" onPress={() => router.back()}><Icon as={ArrowLeft} /></Button>
        <Button accessibilityLabel="Guardar análisis" className="size-11 rounded-full" size="icon" variant="outline"><Icon as={Bookmark} /></Button>
      </View>
      <AppHeader eyebrow={`Análisis ${analysisId}`} title="Salsa de tomate" description="3 aditivos detectados" />
      <Card className="gap-0 border-risk-caution/25 bg-risk-caution-soft py-0">
        <CardContent className="gap-3 p-5">
          <RiskBadge level={ProductRiskLevel.CAUTION} size="MEDIUM" />
          <Text className="text-[22px] font-semibold leading-7 text-risk-caution">Requiere atención moderada</Text>
          <Text className="text-sm leading-5 text-risk-caution">
            Contiene un aditivo de riesgo alto y otro que requiere precaución. Revisa cada resultado.
          </Text>
        </CardContent>
      </Card>
      <View className="gap-3 rounded-2xl border border-border bg-card p-4">
        <View className="flex-row items-center gap-2"><Icon as={Baby} className="text-primary" size={20} /><Text className="font-semibold">Orientación durante el embarazo</Text></View>
        <Text className="text-sm leading-5 text-muted-foreground">El modo embarazo aplica una presentación más estricta y mantiene separada la evidencia insuficiente.</Text>
      </View>
      <View className="gap-3">
        <SectionHeader title="Aditivos detectados" detail="Por gravedad" />
        {detectedAdditives.map((additive) => (
          <AdditiveListItem additive={additive} key={additive.code} onPress={() => router.push(additiveRoute(additive.code))} />
        ))}
      </View>
      <HealthDisclaimer />
    </ScrollableScreen>
  );
}
