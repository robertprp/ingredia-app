import { useState } from 'react';
import { Alert, Image, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, ImageUp, LoaderCircle, ScanLine } from 'lucide-react-native';

import { AppHeader } from '@/components/ingredia/app-header';
import { Screen } from '@/components/ingredia/screen';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { analysisRoute } from '@/lib/routes';
import { apiErrorMessage, ingrediaApi } from '@/services/api/ingredia-api';

const MAX_SCAN_BYTES = 8_000_000;

export default function ScanScreen(): React.JSX.Element {
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  async function chooseImage(source: 'camera' | 'library'): Promise<void> {
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permiso necesario', 'Autoriza el acceso a la cámara para fotografiar la etiqueta.');
          return;
        }
      }
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
      if (result.canceled) return;
      const next = result.assets[0];
      if (next.fileSize && next.fileSize > MAX_SCAN_BYTES) {
        Alert.alert('Imagen demasiado grande', 'Selecciona una imagen de menos de 8 MB.');
        return;
      }
      setAsset(next);
    } catch (error) {
      Alert.alert('No se pudo abrir la imagen', apiErrorMessage(error as Error));
    }
  }

  async function submit(): Promise<void> {
    if (!asset || busy) return;
    setBusy(true);
    setStatus('Subiendo etiqueta…');
    try {
      const scan = await ingrediaApi.createScan({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        file: asset.file,
      });
      setStatus('Analizando ingredientes…');
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const current = await ingrediaApi.getScan(scan.id);
        if ((current.status === 'COMPLETED' || current.status === 'NEEDS_REVIEW') && current.analysisId) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['analyses'] }),
            queryClient.invalidateQueries({ queryKey: ['entitlements'] }),
          ]);
          router.replace(analysisRoute(current.analysisId));
          return;
        }
        if (current.status === 'FAILED') throw new Error(current.failure?.message ?? 'No se pudo analizar la etiqueta.');
        await new Promise((resolve) => setTimeout(resolve, 1_200));
      }
      throw new Error('El análisis está tardando más de lo esperado. Revisa el historial en unos instantes.');
    } catch (error) {
      console.log(error)
      Alert.alert('No se pudo completar el escaneo', apiErrorMessage(error as Error));
    } finally {
      setBusy(false);
      setStatus('');
    }
  }

  return (
    <Screen>
      <View className="flex-1 gap-6 pb-6 pt-3">
        <AppHeader title="Escanear etiqueta" description="Centra la lista de ingredientes y procura que el texto esté bien iluminado." />
        <View className="flex-1 items-center justify-center overflow-hidden rounded-[28px] border border-border bg-card p-6">
          {asset ? (
            <Image accessibilityLabel="Etiqueta seleccionada" className="h-full w-full rounded-3xl" resizeMode="contain" source={{ uri: asset.uri }} />
          ) : (
            <View className="aspect-[4/5] w-full max-w-sm items-center justify-center rounded-3xl border-2 border-dashed border-primary/45 bg-secondary/40">
              <View className="size-16 items-center justify-center rounded-full bg-secondary"><Icon as={ScanLine} className="text-primary" size={30} /></View>
              <Text className="mt-5 text-center text-lg font-semibold">Encuadra los ingredientes</Text>
              <Text className="mt-2 max-w-[260px] text-center text-sm leading-5 text-muted-foreground">Usa una foto nítida, sin reflejos y de menos de 8 MB.</Text>
            </View>
          )}
        </View>
        {status ? <Text className="text-center text-sm font-medium text-primary">{status}</Text> : null}
        <View className="gap-3">
          {asset ? (
            <Button className="h-[52px] rounded-[14px]" disabled={busy} onPress={() => void submit()}>
              <Icon as={busy ? LoaderCircle : ScanLine} className="text-primary-foreground" size={20} />
              <Text className="text-base font-semibold">{busy ? 'Procesando…' : 'Analizar etiqueta'}</Text>
            </Button>
          ) : (
            <Button className="h-[52px] rounded-[14px]" onPress={() => void chooseImage('camera')}>
              <Icon as={Camera} className="text-primary-foreground" size={20} />
              <Text className="text-base font-semibold">Hacer foto</Text>
            </Button>
          )}
          <Button className="h-[52px] rounded-[14px]" disabled={busy} variant="outline" onPress={() => void chooseImage('library')}>
            <Icon as={ImageUp} className="text-foreground" size={20} />
            <Text className="text-base font-semibold">{asset ? 'Elegir otra imagen' : 'Elegir de la galería'}</Text>
          </Button>
        </View>
      </View>
    </Screen>
  );
}
