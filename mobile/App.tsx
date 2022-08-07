import { StatusBar } from 'react-native'
import {} from 'expo'
import { Ubuntu_700Bold, useFonts } from '@expo-google-fonts/ubuntu'
import { Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto'
import AppLoading from 'expo-app-loading'

import Routes from './src/routes'

export default function App() {
  const [fontLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
    Ubuntu_700Bold,
  })

  if (!fontLoaded) return <AppLoading />

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <Routes />
    </>
  )
}
