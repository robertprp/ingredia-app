import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck } from 'lucide-react-native';

export function HealthDisclaimer(): React.JSX.Element {
  return (
    <Alert className="border-evidence/20 bg-evidence-soft" icon={ShieldCheck}>
      <AlertTitle className="text-evidence">Información, no diagnóstico</AlertTitle>
      <AlertDescription className="text-evidence">
        Ingredia resume evidencia alimentaria. No sustituye el consejo de un profesional sanitario.
      </AlertDescription>
    </Alert>
  );
}
