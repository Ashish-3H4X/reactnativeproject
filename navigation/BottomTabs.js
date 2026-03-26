import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatScreen from '../screens/ChatScreen';
import StatusScreen from '../screens/StatusScreen';
import CallsScreen from '../screens/CallsScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
   <Tab.Navigator
    screenOptions={{
    headerStyle: {
      backgroundColor: '#075E54',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    tabBarActiveTintColor: '#075E54',
  }}>
  <Tab.Screen 
    name="Chats" 
  component={ChatScreen}
  options={{
    title: 'WhatsApp',
    tabBarIcon: ({color, size}) => (
      <Ionicons name="chatbubble" size={size} color={color} />
    ),
  }}
  />

  <Tab.Screen 
    name="Status" 
    component={StatusScreen}
    options={{
      tabBarIcon: ({color, size}) => (
        <Ionicons name="ellipse" size={size} color={color} />
      ),
    }}
  />

  <Tab.Screen 
    name="Calls" 
    component={CallsScreen}
    options={{
      tabBarIcon: ({color, size}) => (
        <Ionicons name="call" size={size} color={color} />
      ),
    }}
  />
</Tab.Navigator>
  );
}