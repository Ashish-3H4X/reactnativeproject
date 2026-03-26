import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import ChatDetailScreen from '../screens/ChatDetailScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={BottomTabs}
        options={{ headerShown: false }}
      />

      <Stack.Screen 
        name="ChatDetail" 
        component={ChatDetailScreen}
      />
    </Stack.Navigator>
  );
}