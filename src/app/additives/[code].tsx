import { AppHeader } from '@/components/ingredia/app-header';
import { HealthDisclaimer } from '@/components/ingredia/health-disclaimer';
import { RiskBadge } from '@/components/ingredia/risk-badge';
import { ScrollableScreen } from '@/components/ingredia/screen';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { findAdditive } from '@/features/additives/catalog';
import { ArrowLeft, Baby, FileSearch } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function AdditiveDetailScreen(): React.JSX.Element {
  const { code } = useLocalSearchParams<{ code: string }>();
  const additive = findAdditive(code);

  if (!additive) {
    return (
      <ScrollableScreen>
        <Button className="size-11 rounded-full" size="icon" variant="outline" onPress={() => router.back()}><Icon as={ArrowLeft} /></Button>
        <AppHeader title="Aditivo no encontrado" description="No existe información local para este código." />
      </ScrollableScreen>
    );
  }

  const sections = [
    ['description', 'Descripción', additive.description],
    ['uses', 'Usos en la industria alimentaria', additive.uses],
    ['health', 'Impacto en la salud', additive.healthImpact],
    ['low-dose', 'Efectos a dosis bajas', additive.lowDoseEffects],
    ['high-dose', 'Efectos a dosis altas', additive.highDoseEffects],
    ['pregnancy', 'Orientación durante el embarazo', additive.pregnancyNotes],
  ] as const;

  return (
    <ScrollableScreen>
      <Button accessibilityLabel="Volver" className="size-11 rounded-full" size="icon" variant="outline" onPress={() => router.back()}><Icon as={ArrowLeft} /></Button>
      <AppHeader eyebrow={additive.category} title={`${additive.code} · ${additive.name}`} />
      <RiskBadge level={additive.riskLevel} size="MEDIUM" />
      <View className="flex-row items-center gap-2 rounded-2xl bg-muted p-4">
        <Icon as={Baby} className="text-primary" size={20} />
        <Text className="flex-1 text-sm leading-5">{additive.pregnancyNotes}</Text>
      </View>
      <Accordion className="rounded-2xl border border-border bg-card px-4" collapsible type="single">
        {sections.map(([value, title, body]) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger><Text className="flex-1 font-semibold">{title}</Text></AccordionTrigger>
            <AccordionContent><Text className="leading-6 text-muted-foreground">{body}</Text></AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <View className="gap-3 rounded-2xl border border-border bg-card p-4">
        <View className="flex-row items-center gap-2"><Icon as={FileSearch} className="text-evidence" size={20} /><Text className="font-semibold">Fuentes y revisión</Text></View>
        <Text className="text-sm leading-5 text-muted-foreground">{additive.sources.join(' · ')}</Text>
        <Text className="text-xs text-muted-foreground">Última revisión: {additive.lastReviewedAt}</Text>
      </View>
      <HealthDisclaimer />
    </ScrollableScreen>
  );
}
