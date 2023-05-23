import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './components/Login'
import Signup from './components/Signup'
import Appnav from './components/Appnav'
import Contactnav from './components/Contactnav'
import Contactsearch from './components/Contactsearch'
import Chatnav from './components/Chatnav'
import Chatscreen from './components/Chatscreen'
import Chatscreencontacts from './components/Chatscreencontacts'
import Blocklistnav from './components/Blocklistnav'
import Camera from './components/Camera'
import Chatscreendrafts from './components/Chatscreendrafts'

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTab() {
  return (
    <Tab.Navigator screenOptions={{headerShown:false}} initialRouteName="Contactnav">
      <Tab.Screen name="Contactsearch" component={Contactsearch} options={{ tabBarLabel: 'Search' }}/>
      <Tab.Screen name="Contactnav" component={Contactnav} options={{ tabBarLabel: 'My Contacts' }} />
      <Tab.Screen name="Chatnav" component={Chatnav} options={{ tabBarLabel: 'My Chats' }}/>
    </Tab.Navigator>
  );
}

function ChatTab() {
  return (
    <Tab.Navigator screenOptions={{headerShown:false}} initialRouteName="Chatscreen">
      <Tab.Screen name="Chatscreencontacts" component={Chatscreencontacts} options={{ tabBarLabel: 'Add Members' }}/>
      <Tab.Screen name="Chatscreen" component={Chatscreen} options={{ tabBarLabel: 'Chat' }}/>
      <Tab.Screen name="Chatscreendrafts" component={Chatscreendrafts} options={{ tabBarLabel: 'Write drafts' }}/>
    </Tab.Navigator>
  );
}


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown:false}} initialRouteName='Login'>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Appnav" component={Appnav} />
        <Stack.Screen name="Apptab" component={AppTab} />
        <Stack.Screen name="Chattab" component={ChatTab} />
        <Stack.Screen name="Blocklistnav" component={Blocklistnav} />
        <Stack.Screen name="Camera" component={Camera} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
