import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import Home from './pages/Home'
import Points from './pages/Points'
import Detail from './pages/Detail'

export type RootStackParamList = {
  Points: undefined
  Detail: undefined
  Home: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{ title: 'Home' }}
          name="Home"
          component={Home}
        />
        <Stack.Screen
          options={{ title: 'Pontos de coleta' }}
          name="Points"
          component={Points}
        />
        <Stack.Screen
          options={{ title: 'Perfil do Github' }}
          name="Detail"
          component={Detail}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default Routes
