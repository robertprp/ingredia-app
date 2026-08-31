import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ROUTES } from '@/lib/routes';
import { BookOpen, Leaf, ScanLine, ShieldCheck, type LucideIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen(): React.JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-background px-5" edges={['top', 'bottom']}>
      <View className="flex-1 justify-between py-6">
        <View className="flex-row items-center gap-2">
          <View className="size-10 items-center justify-center rounded-full bg-primary">
            <Icon as={Leaf} className="text-primary-foreground" size={21} />
          </View>
          <Text className="text-xl font-semibold tracking-tight">Ingredia</Text>
        </View>
        <View className="gap-6">
          <View className="gap-3">
            <Text className="text-[34px] font-bold leading-[40px] tracking-tight">
              Entiende lo que hay en tus alimentos.
            </Text>
            <Text className="text-lg leading-7 text-muted-foreground">
              Escanea ingredientes y consulta aditivos con contexto claro y basado en evidencia.
            </Text>
          </View>
          <View className="gap-3">
            <FeatureRow icon={ScanLine} text="Analiza etiquetas en pocos pasos" />
            <FeatureRow icon={BookOpen} text="Consulta riesgos y fuentes" />
            <FeatureRow icon={ShieldCheck} text="Información prudente, sin diagnósticos" />
          </View>
        </View>
        <View className="gap-2">
          <Button className="h-[52px] rounded-[14px]" onPress={() => router.push(ROUTES.login)}>
            <Text className="text-base font-semibold">Continuar</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({ icon: FeatureIcon, text }: { icon: LucideIcon; text: string }): React.JSX.Element {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <View className="size-10 items-center justify-center rounded-full bg-secondary">
        <Icon as={FeatureIcon} className="text-primary" size={20} />
      </View>
      <Text className="flex-1 text-base leading-6">{text}</Text>
    </View>
  );
}
