import { AppHeader } from '@/components/ingredia/app-header';
import { Screen } from '@/components/ingredia/screen';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Camera, ImageUp, ScanLine } from 'lucide-react-native';
import { analysisRoute } from '@/lib/routes';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function ScanScreen(): React.JSX.Element {
  return (
    <Screen>
      <View className="flex-1 gap-6 pb-6 pt-3">
        <AppHeader
          title="Escanear etiqueta"
          description="Centra la lista de ingredientes y procura que el texto esté bien iluminado."
        />
        <View className="flex-1 items-center justify-center rounded-[28px] border border-border bg-card p-6">
          <View className="aspect-[4/5] w-full max-w-sm items-center justify-center rounded-3xl border-2 border-dashed border-primary/45 bg-secondary/40">
            <View className="size-16 items-center justify-center rounded-full bg-secondary">
              <Icon as={ScanLine} className="text-primary" size={30} />
            </View>
            <Text className="mt-5 text-center text-lg font-semibold">Encuadra los ingredientes</Text>
            <Text className="mt-2 max-w-[260px] text-center text-sm leading-5 text-muted-foreground">
              La cámara y el procesamiento OCR se conectarán en la siguiente fase.
            </Text>
          </View>
        </View>
        <View className="gap-3">
          <Button className="h-[52px] rounded-[14px]" onPress={() => router.push(analysisRoute('demo'))}>
            <Icon as={Camera} className="text-primary-foreground" size={20} />
            <Text className="text-base font-semibold">Ver análisis de ejemplo</Text>
          </Button>
          <Button className="h-[52px] rounded-[14px]" variant="outline">
            <Icon as={ImageUp} className="text-foreground" size={20} />
            <Text className="text-base font-semibold">Elegir de la galería</Text>
          </Button>
        </View>
      </View>
    </Screen>
  );
}
