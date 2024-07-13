import React, { useEffect, useState, useRef } from 'react';
import { Text, View, Button, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import axios from 'axios';

// Import screens and utils as per your actual paths
import Login from './screens/login'; // Adjust the path as necessary
import Home from './screens/home'; // Adjust the path as necessary
import SecondScreen from './screens/secondscreen'; // Adjust the path as necessary
import Profile from './screens/profile'; // Adjust the path as necessary
import api from './utils/api'; // Adjust the path as necessary

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }

    try {
      const pushToken = (
        await Notifications.getExpoPushTokenAsync()
      ).data;

      return pushToken;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(undefined);
  const [initialRoute, setInitialRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setInitialRoute(token ? 'HomeTabs' : 'Login');
      } catch (error) {
        console.error('Failed to load token', error);
        setInitialRoute('Login');
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error) => {
        console.error('Failed to get push token', error);
        setExpoPushToken('');
      });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
      // Handle notification response as needed
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  if (isLoading || initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: '#ff5900' }, // Change the header color to orange
        }}>
        <Stack.Screen name="Login">
          {props => <Login {...props} expoPushToken={expoPushToken} />}
        </Stack.Screen>
        <Stack.Screen name="HomeTabs">
          {() => (
            <Tab.Navigator
              screenOptions={{
                tabBarActiveTintColor: '#7d3665',
                tabBarInactiveTintColor: '#ffbb6d',
                tabBarStyle: { backgroundColor: '#ff5900' }, // Change the tab bar background color to orange
              }}>
              <Tab.Screen
                name="Medical Files"
                component={Home}
                options={{
                  tabBarLabel: 'Medical Files',
                  tabBarIcon: ({ focused, color, size }) => (
                    <Ionicons
                      name={focused ? 'medkit' : 'medkit-outline'}
                      size={size}
                      color={color}
                    />
                  ),
                }}
              />
              <Tab.Screen
                name="Appointment"
                component={SecondScreen}
                options={{
                  tabBarLabel: 'Appointment',
                  tabBarIcon: ({ focused, color, size }) => (
                    <Ionicons
                      name={focused ? 'alarm' : 'alarm-outline'}
                      size={size}
                      color={color}
                    />
                  ),
                }}
              />
              <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                  tabBarLabel: 'Profile',
                  tabBarIcon: ({ focused, color, size }) => (
                    <Ionicons
                      name={focused ? 'person' : 'person-outline'}
                      size={size}
                      color={color}
                    />
                  ),
                }}
              />
            </Tab.Navigator>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
