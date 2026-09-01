import { AppHeader } from '@/components/ingredia/app-header';
import { ScrollableScreen } from '@/components/ingredia/screen';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { authClient } from '@/lib/auth-client';
import { ROUTES } from '@/lib/routes';
import { Baby, Bell, ChevronRight, Crown, HelpCircle, Lock, LogOut, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiQueryKeys } from '@/services/api/query-keys';
import { apiErrorMessage, ingrediaApi } from '@/services/api/ingredia-api';

export default function ProfileScreen(): React.JSX.Element {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const preferences = useQuery({ queryKey: apiQueryKeys.preferences, queryFn: ingrediaApi.getPreferences });
  const entitlements = useQuery({ queryKey: apiQueryKeys.entitlements, queryFn: ingrediaApi.getEntitlements });
  const subscription = useQuery({ queryKey: [...apiQueryKeys.billing, 'subscription'], queryFn: ingrediaApi.getSubscription });
  const updatePreference = useMutation({
    mutationFn: ingrediaApi.updatePreferences,
    onSuccess: (data) => queryClient.setQueryData(apiQueryKeys.preferences, data),
    onError: (error) => Alert.alert('No se pudo guardar', apiErrorMessage(error)),
  });
  const deleteAccount = useMutation({
    mutationFn: ingrediaApi.requestAccountDeletion,
    onSuccess: ({ scheduledAt }) => Alert.alert('Eliminación solicitada', `Tu cuenta está programada para eliminarse el ${new Date(scheduledAt).toLocaleDateString('es-ES')}.`),
    onError: (error) => Alert.alert('No se pudo solicitar', apiErrorMessage(error)),
  });
  const displayName = session?.user.name || 'Cuenta Ingredia';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <ScrollableScreen>
      <AppHeader title="Perfil" description="Preferencias, cuenta y privacidad." />
      <View className="flex-row items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <Avatar alt={`Avatar de ${displayName}`} className="size-14">
          <AvatarFallback className="bg-secondary"><Text className="font-semibold text-primary">{initials}</Text></AvatarFallback>
        </Avatar>
        <View className="flex-1">
          <Text className="text-lg font-semibold">{displayName}</Text>
          <Text className="text-sm text-muted-foreground">{session?.user.email}</Text>
        </View>
      </View>

      <ProfileSection title="Preferencias de salud">
        <PreferenceRow icon={Baby} label="Modo embarazo" description={entitlements.data?.personalizedPregnancyMode ? 'Aplica criterios de presentación más estrictos.' : 'Disponible con Ingredia Plus.'} checked={preferences.data?.pregnancyMode ?? false} disabled={!entitlements.data?.personalizedPregnancyMode || updatePreference.isPending} onCheckedChange={(pregnancyMode) => updatePreference.mutate({ pregnancyMode })} />
        <PreferenceRow icon={Bell} label="Alertas de riesgo" description="Destaca resultados que requieren atención." checked={preferences.data?.riskAlerts ?? true} disabled={updatePreference.isPending} onCheckedChange={(riskAlerts) => updatePreference.mutate({ riskAlerts })} />
      </ProfileSection>

      <ProfileSection title="Suscripción">
        <NavigationRow icon={Crown} label="Ingredia Plus" detail={subscription.data?.status === 'ACTIVE' || subscription.data?.status === 'TRIALING' ? 'Plan activo' : 'Plan gratuito'} onPress={() => router.push(ROUTES.subscription)} />
      </ProfileSection>

      <ProfileSection title="Ayuda y privacidad">
        <NavigationRow icon={HelpCircle} label="Ayuda y metodología" />
        <NavigationRow icon={Lock} label="Privacidad y datos" />
      </ProfileSection>

      <Button
        className="h-[52px] rounded-[14px]"
        variant="outline"
        onPress={() => void authClient.signOut().then(() => router.replace('/'))}>
        <Icon as={LogOut} className="text-foreground" size={19} />
        <Text className="font-semibold">Cerrar sesión</Text>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="h-[52px] rounded-[14px]" variant="ghost">
            <Icon as={Trash2} className="text-destructive" size={19} />
            <Text className="font-semibold text-destructive">Eliminar cuenta</Text>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu acceso se desactivará y la cuenta se eliminará tras el periodo de seguridad indicado por Ingredia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel><Text>Cancelar</Text></AlertDialogCancel>
            <AlertDialogAction onPress={() => deleteAccount.mutate()}><Text>Solicitar eliminación</Text></AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollableScreen>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <View className="gap-3">
      <Text className="text-[22px] font-semibold leading-7">{title}</Text>
      <Card className="gap-0 overflow-hidden py-0"><CardContent className="p-0">{children}</CardContent></Card>
    </View>
  );
}

function PreferenceRow({ icon: RowIcon, label, description, checked, disabled, onCheckedChange }: { icon: typeof Baby; label: string; description: string; checked: boolean; disabled?: boolean; onCheckedChange: (checked: boolean) => void }): React.JSX.Element {
  return (
    <View className="min-h-[76px] flex-row items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <Icon as={RowIcon} className="text-primary" size={20} />
      <View className="flex-1 gap-0.5">
        <Text className="font-semibold">{label}</Text>
        <Text className="text-xs leading-4 text-muted-foreground">{description}</Text>
      </View>
      <Switch accessibilityLabel={label} checked={checked} disabled={disabled} hitSlop={10} onCheckedChange={onCheckedChange} />
    </View>
  );
}

function NavigationRow({ icon: RowIcon, label, detail, onPress }: { icon: typeof Crown; label: string; detail?: string; onPress?: () => void }): React.JSX.Element {
  return (
    <Pressable className="min-h-[56px] flex-row items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 active:bg-muted" onPress={onPress}>
      <Icon as={RowIcon} className="text-primary" size={20} />
      <Text className="flex-1 font-medium">{label}</Text>
      {detail ? <Text className="text-xs text-muted-foreground">{detail}</Text> : null}
      <Icon as={ChevronRight} className="text-muted-foreground" size={18} />
    </Pressable>
  );
}
