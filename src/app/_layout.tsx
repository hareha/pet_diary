import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Gaegu_300Light, Gaegu_400Regular, Gaegu_700Bold } from '@expo-google-fonts/gaegu';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconFocused]}>
      <View style={[styles.iconCircle, focused && styles.iconCircleFocused]}>
        <Text style={[styles.iconText, focused && styles.iconTextFocused]}>{icon}</Text>
      </View>
      <Text
        style={[styles.tabLabel, focused && styles.tabLabelFocused]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFDF9',
          borderTopWidth: 1,
          borderTopColor: '#E8DDD0',
          height: Platform.OS === 'web' ? 56 : 80,
          paddingBottom: Platform.OS === 'web' ? 4 : 24,
          paddingTop: 4,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="D" label="캘린더" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="write"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="+" label="쓰기" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary/[date]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Gaegu_300Light,
    Gaegu_400Regular,
    Gaegu_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#E88D67" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <TabsLayout />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF9',
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  tabIconFocused: {
    backgroundColor: '#FFF0E5',
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F0E4D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  iconCircleFocused: {
    backgroundColor: '#E88D67',
  },
  iconText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C7B6B',
  },
  iconTextFocused: {
    color: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 11,
    color: '#B0A090',
    fontFamily: 'Gaegu_700Bold',
  },
  tabLabelFocused: {
    color: '#E88D67',
  },
});
