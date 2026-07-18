// src/navigation/TabNavigator.js
import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ConnectionScreen } from '../components/ConnectionScreen';
import { EarnScreen } from '../components/EarnScreen';
import { SettingsScreen } from '../components/SettingsScreen';
import { useApp } from '../context/AppContext';
import COLORS from '../theme/colors';

const Tab = createBottomTabNavigator();

// The Store/Use tab's label and icon reflect whichever mode is currently
// active (decided by ConnectionScreen's connectivity auto-detection),
// rather than being two separate static tabs.
function ModeTabLabel({ color }) {
  const { mode } = useApp();
  return <Text style={{ color, fontSize: 11 }}>{mode === 'store' ? 'Store' : 'Use'}</Text>;
}

function ModeTabIcon({ color, size }) {
  const { mode } = useApp();
  return (
    <Ionicons
      name={mode === 'store' ? 'cloud-upload-outline' : 'cloud-download-outline'}
      size={size}
      color={color}
    />
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: COLORS.secondary,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen
        name="Connection"
        component={ConnectionScreen}
        options={{
          tabBarLabel: ({ color }) => <ModeTabLabel color={color} />,
          tabBarIcon: ({ color, size }) => <ModeTabIcon color={color} size={size} />,
          headerTitle: '⏰ KeepEduroam',
        }}
      />
      <Tab.Screen
        name="Earn"
        component={EarnScreen}
        options={{
          tabBarLabel: 'Earn',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
          headerTitle: '💰 Earn Time',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
          headerTitle: '⚙️ Settings',
        }}
      />
    </Tab.Navigator>
  );
}
