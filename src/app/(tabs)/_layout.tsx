import { Tabs, useTheme } from 'expo-router';
import { ArrowLeftRight, History, House, ScanLine, UserRound } from 'lucide-react-native';

const TAB_ICON_SIZE = 22;

export default function TabLayout(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 68,
          paddingBottom: 8,
          paddingTop: 7,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <House color={color} size={TAB_ICON_SIZE} strokeWidth={1.9} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Escanear',
          tabBarIcon: ({ color }) => <ScanLine color={color} size={TAB_ICON_SIZE} strokeWidth={1.9} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => <History color={color} size={TAB_ICON_SIZE} strokeWidth={1.9} />,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: 'Comparar',
          tabBarIcon: ({ color }) => <ArrowLeftRight color={color} size={TAB_ICON_SIZE} strokeWidth={1.9} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <UserRound color={color} size={TAB_ICON_SIZE} strokeWidth={1.9} />,
        }}
      />
    </Tabs>
  );
}
