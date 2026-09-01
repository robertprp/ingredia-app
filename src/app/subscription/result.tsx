import { AppHeader } from '@/components/ingredia/app-header';
import { ScrollableScreen } from '@/components/ingredia/screen';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CircleCheck } from 'lucide-react-native';
import { router } from 'expo-router';
import { ROUTES } from '@/lib/routes';
import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ingrediaApi } from '@/services/api/ingredia-api';
import { apiQueryKeys } from '@/services/api/query-keys';

export default function SubscriptionResultScreen(): React.JSX.Element {
  const subscription = useQuery({
    queryKey: [...apiQueryKeys.billing, 'subscription'],
    queryFn: ingrediaApi.getSubscription,
    refetchInterval: (query) => query.state.data?.status === 'ACTIVE' || query.state.data?.status === 'TRIALING' ? false : 2_000,
  });
  const active = subscription.data?.status === 'ACTIVE' || subscription.data?.status === 'TRIALING';

  return (
    <ScrollableScreen contentClassName="flex-grow justify-center">
      <View className="items-center gap-4">
        <View className="size-16 items-center justify-center rounded-full bg-secondary"><Icon as={CircleCheck} className="text-primary" size={32} /></View>
        <AppHeader title={active ? 'Ingredia Plus está activo' : 'Comprobando suscripción'} description={active ? 'El servidor ha confirmado tu acceso a las funciones Plus.' : 'Ingredia esperará la confirmación del servidor antes de habilitar las funciones Plus.'} />
        <Button className="mt-3 h-[52px] w-full rounded-[14px]" onPress={() => router.replace(ROUTES.profile)}><Text>Volver al perfil</Text></Button>
      </View>
    </ScrollableScreen>
  );
}
