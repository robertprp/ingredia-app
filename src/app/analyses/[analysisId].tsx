import { Alert, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Baby, Bookmark, BookmarkCheck, Trash2 } from 'lucide-react-native';

import { AdditiveListItem } from '@/components/ingredia/additive-list-item';
import { AppHeader, SectionHeader } from '@/components/ingredia/app-header';
import { HealthDisclaimer } from '@/components/ingredia/health-disclaimer';
import { RiskBadge } from '@/components/ingredia/risk-badge';
import { ScrollableScreen } from '@/components/ingredia/screen';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { guidanceFromPregnancy, riskFromToxicity } from '@/features/additives/contracts';
import { additiveRoute, ROUTES } from '@/lib/routes';
import { apiErrorMessage, ingrediaApi } from '@/services/api/ingredia-api';
import { apiQueryKeys } from '@/services/api/query-keys';

export default function AnalysisResultScreen(): React.JSX.Element {
  const { analysisId } = useLocalSearchParams<{ analysisId: string }>();
  const queryClient = useQueryClient();
  const analysisQuery = useQuery({ queryKey: apiQueryKeys.analysis(analysisId), queryFn: () => ingrediaApi.getAnalysis(analysisId), enabled: Boolean(analysisId) });
  const savedQuery = useQuery({ queryKey: apiQueryKeys.analyses('SAVED'), queryFn: () => ingrediaApi.listAnalyses('SAVED') });
  const saved = savedQuery.data?.items.some((item) => item.id === analysisId) ?? false;

  const saveMutation = useMutation({
    mutationFn: () => ingrediaApi.setAnalysisSaved(analysisId, !saved),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['analyses'] }),
    onError: (error) => Alert.alert('No se pudo actualizar', apiErrorMessage(error)),
  });
  const deleteMutation = useMutation({
    mutationFn: () => ingrediaApi.deleteAnalysis(analysisId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['analyses'] });
      router.replace(ROUTES.tabs);
    },
    onError: (error) => Alert.alert('No se pudo eliminar', apiErrorMessage(error)),
  });

  if (analysisQuery.isPending) return <ScrollableScreen><Text className="text-center text-muted-foreground">Cargando análisis…</Text></ScrollableScreen>;
  const analysis = analysisQuery.data;
  if (!analysis) return <ScrollableScreen><Button className="size-11 rounded-full" size="icon" variant="outline" onPress={() => router.back()}><Icon as={ArrowLeft} /></Button><AppHeader title="Análisis no disponible" description="No se pudo cargar este análisis." /></ScrollableScreen>;

  return (
    <ScrollableScreen>
      <View className="flex-row items-center justify-between">
        <Button accessibilityLabel="Volver" className="size-11 rounded-full" size="icon" variant="outline" onPress={() => router.back()}><Icon as={ArrowLeft} /></Button>
        <View className="flex-row gap-2">
          <Button accessibilityLabel={saved ? 'Quitar de guardados' : 'Guardar análisis'} className="size-11 rounded-full" disabled={saveMutation.isPending} size="icon" variant="outline" onPress={() => saveMutation.mutate()}><Icon as={saved ? BookmarkCheck : Bookmark} /></Button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button accessibilityLabel="Eliminar análisis" className="size-11 rounded-full" size="icon" variant="outline"><Icon as={Trash2} className="text-destructive" /></Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>¿Eliminar este análisis?</AlertDialogTitle><AlertDialogDescription>Se quitará definitivamente de tu historial.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel><Text>Cancelar</Text></AlertDialogCancel><AlertDialogAction onPress={() => deleteMutation.mutate()}><Text>Eliminar</Text></AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </View>
      </View>
      <AppHeader eyebrow={new Date(analysis.createdAt).toLocaleDateString('es-ES')} title={analysis.productName} description={`${analysis.detectedAdditives.length} aditivos detectados`} />
      <Card className="gap-0 py-0"><CardContent className="gap-3 p-5"><RiskBadge level={analysis.overallRisk} size="MEDIUM" /><Text className="text-[22px] font-semibold leading-7">Resumen</Text><Text className="text-sm leading-5 text-muted-foreground">{analysis.summary}</Text></CardContent></Card>
      <View className="gap-3 rounded-2xl border border-border bg-card p-4">
        <View className="flex-row items-center gap-2"><Icon as={Baby} className="text-primary" size={20} /><Text className="font-semibold">Orientación durante el embarazo</Text></View>
        <Text className="text-sm leading-5 text-muted-foreground">Resultado: {analysis.pregnancyRisk.replaceAll('_', ' ').toLocaleLowerCase('es')}.</Text>
      </View>
      <View className="gap-3">
        <SectionHeader title="Aditivos detectados" detail="Por gravedad" />
        {analysis.detectedAdditives.map((additive) => (
          <AdditiveListItem
            additive={{ code: additive.code, name: additive.name, category: 'Aditivo detectado', riskLevel: riskFromToxicity(additive.toxicityLevel), pregnancyGuidance: guidanceFromPregnancy(additive.pregnancyStatus) }}
            key={additive.code}
            onPress={() => router.push(additiveRoute(additive.code))}
          />
        ))}
      </View>
      {analysis.unrecognizedIngredients.length ? <View className="gap-2 rounded-2xl border border-border bg-card p-4"><Text className="font-semibold">Ingredientes sin identificar</Text>{analysis.unrecognizedIngredients.map((item) => <Text className="text-sm text-muted-foreground" key={`${item.originalText}-${item.reason}`}>• {item.originalText}</Text>)}</View> : null}
      <HealthDisclaimer />
    </ScrollableScreen>
  );
}
