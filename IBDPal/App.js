import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MainApp from './src/screens/MainApp';
import LoadingScreen from './src/screens/LoadingScreen';

// Import theme
import { theme } from './src/theme';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check for stored authentication token
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const user = await SecureStore.getItemAsync('userData');
        
        if (token && user) {
          setUserToken(token);
          setUserData(JSON.parse(user));
        }
      } catch (error) {
        console.error('Error loading stored authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    signIn: async (token, user) => {
      try {
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userData', JSON.stringify(user));
        setUserToken(token);
        setUserData(user);
      } catch (error) {
        console.error('Error storing authentication:', error);
      }
    },
    signOut: async () => {
      try {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
        setUserToken(null);
        setUserData(null);
      } catch (error) {
        console.error('Error removing authentication:', error);
      }
    },
    signUp: async (token, user) => {
      try {
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userData', JSON.stringify(user));
        setUserToken(token);
        setUserData(user);
      } catch (error) {
        console.error('Error storing authentication:', error);
      }
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {userToken == null ? (
            // Auth screens
            <>
              <Stack.Screen 
                name="Login" 
                component={LoginScreen}
                initialParams={{ authContext }}
              />
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen}
                initialParams={{ authContext }}
              />
            </>
          ) : (
            // Main app
            <Stack.Screen 
              name="MainApp" 
              component={MainApp}
              initialParams={{ authContext, userData }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
} 