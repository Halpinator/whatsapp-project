import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './components/Login'
import Signup from './components/Signup'
import Appnav from './components/Appnav'
import Contactnav from './components/Contactnav'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown:false}} initialRouteName='Login'>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Appnav" component={Appnav} />
        <Stack.Screen name="Contactnav" component={Contactnav} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
