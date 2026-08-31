import { AppHeader } from '@/components/ingredia/app-header';
import { ScrollableScreen } from '@/components/ingredia/screen';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ArrowLeftRight, Lock, Plus } from 'lucide-react-native';
import { ROUTES } from '@/lib/routes';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function CompareScreen(): React.JSX.Element {
  return (
    <ScrollableScreen>
      <AppHeader title="Comparar productos" description="Compara exactamente dos análisis y revisa cada diferencia." />
      <View className="flex-row items-center gap-3">
        <ComparisonSlot label="Producto 1" value="Salsa de tomate" />
        <View className="size-10 items-center justify-center rounded-full bg-secondary">
          <Icon as={ArrowLeftRight} className="text-primary" size={19} />
        </View>
        <ComparisonSlot label="Producto 2" />
      </View>
      <Card className="gap-0 py-0">
        <CardContent className="items-center gap-3 p-6">
          <View className="size-12 items-center justify-center rounded-full bg-muted">
            <Icon as={Lock} className="text-muted-foreground" size={23} />
          </View>
          <Text className="text-center text-lg font-semibold">Comparación incluida en Ingredia Plus</Text>
          <Text className="text-center text-sm leading-5 text-muted-foreground">
            El acceso se habilitará únicamente cuando el servidor confirme tu suscripción.
          </Text>
          <Button className="mt-2 h-[52px] w-full rounded-[14px]" onPress={() => router.push(ROUTES.subscription)}>
            <Text className="font-semibold">Ver Ingredia Plus</Text>
          </Button>
        </CardContent>
      </Card>
    </ScrollableScreen>
  );
}

function ComparisonSlot({ label, value }: { label: string; value?: string }): React.JSX.Element {
  return (
    <View className="min-h-[116px] flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card p-3">
      {value ? (
        <>
          <Text className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Text>
          <Text className="text-center font-semibold">{value}</Text>
        </>
      ) : (
        <>
          <Icon as={Plus} className="text-primary" size={22} />
          <Text className="text-center text-sm font-semibold">Añadir producto</Text>
        </>
      )}
    </View>
  );
}
