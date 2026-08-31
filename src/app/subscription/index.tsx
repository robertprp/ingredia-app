import { AppHeader } from '@/components/ingredia/app-header';
import { ScrollableScreen } from '@/components/ingredia/screen';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { BillingChannel, type BillingEligibility } from '@/features/billing/contracts';
import { ArrowLeft, Check, Crown, RefreshCcw, ShieldCheck } from 'lucide-react-native';
import { router } from 'expo-router';
import { View } from 'react-native';

const SCAFFOLD_ELIGIBILITY: BillingEligibility = {
  channel: BillingChannel.UNAVAILABLE,
  displayPrice: 'Precio disponible al conectar la tienda',
  billingIntervalLabel: 'Renovación según el canal de compra',
  canRestore: false,
};

const FEATURES = [
  'Escaneos ilimitados',
  'Comparación de dos productos',
  'Historial completo',
  'Modo embarazo personalizado',
] as const;

export default function SubscriptionScreen(): React.JSX.Element {
  return (
    <ScrollableScreen>
      <Button accessibilityLabel="Volver" className="size-11 rounded-full" size="icon" variant="outline" onPress={() => router.back()}><Icon as={ArrowLeft} /></Button>
      <AppHeader eyebrow="Ingredia Plus" title="Más contexto para cada elección" description="El servidor decidirá el canal de compra permitido para cada plataforma y región." />
      <Card className="gap-0 overflow-hidden border-primary/25 py-0">
        <CardContent className="gap-5 p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="size-12 items-center justify-center rounded-full bg-secondary"><Icon as={Crown} className="text-primary" size={24} /></View>
            <Badge className="bg-secondary"><Text className="font-semibold text-primary">Plus</Text></Badge>
          </View>
          <View className="gap-1">
            <Text className="text-[22px] font-semibold leading-7">Plan completo</Text>
            <Text className="text-base text-muted-foreground">{SCAFFOLD_ELIGIBILITY.displayPrice}</Text>
          </View>
          <View className="gap-3">
            {FEATURES.map((feature) => (
              <View className="flex-row items-center gap-2" key={feature}>
                <Icon as={Check} className="text-primary" size={18} />
                <Text className="flex-1 text-sm">{feature}</Text>
              </View>
            ))}
          </View>
          <Button className="h-[52px] rounded-[14px]" disabled>
            <Text className="font-semibold">Compra no disponible todavía</Text>
          </Button>
          <Text className="text-center text-xs leading-4 text-muted-foreground">{SCAFFOLD_ELIGIBILITY.billingIntervalLabel}</Text>
        </CardContent>
      </Card>
      <View className="gap-3 rounded-2xl border border-border bg-card p-4">
        <View className="flex-row items-center gap-2"><Icon as={ShieldCheck} className="text-primary" size={20} /><Text className="font-semibold">Acceso verificado por el servidor</Text></View>
        <Text className="text-sm leading-5 text-muted-foreground">Ingredia no desbloqueará funciones hasta que el backend confirme los derechos de la cuenta.</Text>
      </View>
      <Button className="h-[52px] rounded-[14px]" disabled={!SCAFFOLD_ELIGIBILITY.canRestore} variant="outline">
        <Icon as={RefreshCcw} className="text-foreground" size={18} /><Text>Restaurar compra</Text>
      </Button>
    </ScrollableScreen>
  );
}
