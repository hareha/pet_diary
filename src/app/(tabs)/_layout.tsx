import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { CalendarIcon, MypageIcon } from '@/components/common/TabIcons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#E88D67',
        tabBarInactiveTintColor: '#B0A090',
        tabBarLabelStyle: {
          fontFamily: 'Gaegu_700Bold',
          fontSize: 11,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: '#FFFDF9',
          borderTopWidth: 1,
          borderTopColor: '#E8DDD0',
          height: Platform.OS === 'web' ? 60 : 80,
          paddingBottom: Platform.OS === 'web' ? 8 : 24,
          paddingTop: 6,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '캘린더',
          tabBarIcon: ({ focused }) => (
            <CalendarIcon size={22} color={focused ? '#E88D67' : '#B0A090'} />
          ),
        }}
      />
      <Tabs.Screen
        name="write"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이',
          tabBarIcon: ({ focused }) => (
            <MypageIcon size={22} color={focused ? '#E88D67' : '#B0A090'} />
          ),
        }}
      />
    </Tabs>
  );
}

