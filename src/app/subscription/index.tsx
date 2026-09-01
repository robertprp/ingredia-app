import { Alert, Linking, View } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Crown, RefreshCcw, ShieldCheck } from 'lucide-react-native';

import { AppHeader } from '@/components/ingredia/app-header';
import { ScrollableScreen } from '@/components/ingredia/screen';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { apiErrorMessage, ingrediaApi } from '@/services/api/ingredia-api';
import { apiQueryKeys } from '@/services/api/query-keys';

const FEATURE_LABELS: Record<string, string> = {
  UNLIMITED_SCANS: 'Escaneos ilimitados',
  PRODUCT_COMPARISON: 'Comparación de dos productos',
  COMPLETE_HISTORY: 'Historial completo',
  PERSONALIZED_PREGNANCY_MODE: 'Modo embarazo personalizado',
};

export default function SubscriptionScreen(): React.JSX.Element {
  const queryClient = useQueryClient();
  const eligibility = useQuery({ queryKey: [...apiQueryKeys.billing, 'eligibility'], queryFn: ingrediaApi.getBillingEligibility });
  const plans = useQuery({ queryKey: [...apiQueryKeys.billing, 'plans'], queryFn: ingrediaApi.getBillingPlans });
  const subscription = useQuery({ queryKey: [...apiQueryKeys.billing, 'subscription'], queryFn: ingrediaApi.getSubscription });
  const plan = plans.data?.[0];
  const active = subscription.data?.status === 'ACTIVE' || subscription.data?.status === 'TRIALING';

  const checkout = useMutation({
    mutationFn: async () => {
      if (!plan) throw new Error('No hay un plan disponible.');
      const result = await ingrediaApi.createStripeSubscription(
        plan.id,
        ExpoLinking.createURL('/subscription/result', { queryParams: { status: 'success' } }),
        ExpoLinking.createURL('/subscription', { queryParams: { status: 'canceled' } }),
      );
      await Linking.openURL(result.url);
    },
    onError: (error) => Alert.alert('No se pudo iniciar la compra', apiErrorMessage(error)),
  });
  const restore = useMutation({
    mutationFn: () => {
      const provider = eligibility.data?.restoreAction === 'APP_STORE_RESTORE' ? 'APPLE' : 'GOOGLE_PLAY';
      return ingrediaApi.restorePurchases(provider);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.billing }),
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.entitlements }),
      ]);
      Alert.alert('Compras restauradas', 'Ingredia ha actualizado los derechos confirmados por el servidor.');
    },
    onError: (error) => Alert.alert('No se pudo restaurar', apiErrorMessage(error)),
  });

  const action = eligibility.data?.purchaseAction;
  const canRestore = eligibility.data?.restoreAction !== undefined && eligibility.data.restoreAction !== 'NONE';
  const purchaseLabel = active
    ? 'Suscripción activa'
    : action === 'STRIPE_CHECKOUT'
      ? 'Suscribirme'
      : action === 'APP_STORE_PURCHASE'
        ? 'Continuar en App Store'
        : action === 'GOOGLE_PLAY_PURCHASE'
          ? 'Continuar en Google Play'
          : 'Compra no disponible';

  function purchase(): void {
    if (action === 'STRIPE_CHECKOUT') checkout.mutate();
    else if (action === 'APP_STORE_PURCHASE' || action === 'GOOGLE_PLAY_PURCHASE') {
      Alert.alert('Compra en la tienda', 'El plan está disponible para esta tienda. La capa nativa de compra debe devolver el token y llamar a la verificación ya integrada.');
    }
  }

  return (
    <ScrollableScreen>
      <Button accessibilityLabel="Volver" className="size-11 rounded-full" size="icon" variant="outline" onPress={() => router.back()}><Icon as={ArrowLeft} /></Button>
      <AppHeader eyebrow="Ingredia Plus" title="Más contexto para cada elección" description="El servidor selecciona el canal de compra permitido para tu plataforma." />
      <Card className="gap-0 overflow-hidden border-primary/25 py-0">
        <CardContent className="gap-5 p-5">
          <View className="flex-row items-start justify-between gap-4"><View className="size-12 items-center justify-center rounded-full bg-secondary"><Icon as={Crown} className="text-primary" size={24} /></View><Badge className="bg-secondary"><Text className="font-semibold text-primary">{active ? 'Activo' : 'Plus'}</Text></Badge></View>
          <View className="gap-1"><Text className="text-[22px] font-semibold leading-7">{plan?.name ?? 'Plan completo'}</Text><Text className="text-base text-muted-foreground">{plan?.localizedPrice ?? 'Precio no disponible'}</Text></View>
          <View className="gap-3">{(plan?.capabilities ?? Object.keys(FEATURE_LABELS)).map((feature) => <View className="flex-row items-center gap-2" key={feature}><Icon as={Check} className="text-primary" size={18} /><Text className="flex-1 text-sm">{FEATURE_LABELS[feature] ?? feature}</Text></View>)}</View>
          <Button className="h-[52px] rounded-[14px]" disabled={active || !eligibility.data?.purchaseAllowed || checkout.isPending || !plan?.purchasable} onPress={purchase}><Text className="font-semibold">{checkout.isPending ? 'Abriendo pago…' : purchaseLabel}</Text></Button>
          <Text className="text-center text-xs leading-4 text-muted-foreground">{plan?.billingPeriod === 'YEARLY' ? 'Renovación anual' : 'Renovación mensual'} · Acceso sujeto a confirmación del proveedor</Text>
        </CardContent>
      </Card>
      {subscription.data?.currentPeriodEndsAt ? <Text className="text-center text-sm text-muted-foreground">Acceso hasta {new Date(subscription.data.currentPeriodEndsAt).toLocaleDateString('es-ES')}{subscription.data.cancelAtPeriodEnd ? ' · No se renovará' : ''}</Text> : null}
      <Button className="h-[52px] rounded-[14px]" disabled={!canRestore || restore.isPending} variant="outline" onPress={() => restore.mutate()}><Icon as={RefreshCcw} className="text-foreground" size={18} /><Text>{restore.isPending ? 'Restaurando…' : 'Restaurar compra'}</Text></Button>
    </ScrollableScreen>
  );
}
