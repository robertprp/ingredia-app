import { Redirect } from 'expo-router';
import { ROUTES } from '@/lib/routes';

export default function LegacyAuthenticatedRoute(): React.JSX.Element {
  return <Redirect href={ROUTES.tabs} />;
}
