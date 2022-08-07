import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Image,
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import RNPickerSelect from 'react-native-picker-select'

type IBGEResponseUF = {
  sigla: string
}

type IBGEResponseCity = {
  nome: string
}

type LabelValue = {
  label: string
  value: string
}

export default function Home() {
  const [ufs, setUfs] = useState<LabelValue[]>([])
  const [citys, setCitys] = useState<LabelValue[]>([])
  const [selectedUf, setSelectedUf] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const { navigate } = useNavigation()

  function handleNavigateToPoints() {
    navigate('Points' as never, { city: selectedCity, uf: selectedUf } as never)
  }

  useEffect(() => {
    axios
      .get<IBGEResponseUF[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
      )
      .then((response) => {
        const ufInitials = response.data.map((uf) => {
          return {
            label: uf.sigla,
            value: uf.sigla,
          }
        })
        setUfs(ufInitials)
      })
  }, [])

  useEffect(() => {
    if (selectedUf === '') {
      setCitys([])

      return
    }

    axios
      .get<IBGEResponseCity[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cityNames = response.data.map((city) => {
          return {
            label: city.nome,
            value: city.nome,
          }
        })

        setCitys(cityNames)
      })
  }, [selectedUf])

  const handleSelectUF = (value: string) => {
    setSelectedUf(value)
  }

  const handleSelectCity = (value: string) => {
    setSelectedCity(value)
  }

  return (
    <ImageBackground
      source={require('../../assets/home-background.png')}
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.container}>
        <View style={styles.main}>
          <Image source={require('../../assets/logo.png')} />
          <Text style={styles.title}>
            Seu marketplace de coleta de resíduos
          </Text>
          <Text style={styles.description}>
            Ajudar pessoas a encontrarem pontos de coleta
          </Text>
        </View>

        <View>
          <View style={styles.selectBox}>
            <RNPickerSelect
              placeholder="Selecione um estado"
              doneText="Texto"
              value={selectedUf}
              onValueChange={(value: string) => handleSelectUF(value)}
              items={ufs}
            />
          </View>

          <View style={styles.selectBox}>
            <RNPickerSelect
              placeholder="Selecione uma cidade"
              doneText="Texto"
              value={selectedCity}
              onValueChange={(value: string) => handleSelectCity(value)}
              items={citys}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleNavigateToPoints}
          >
            <View style={styles.buttonIcon}>
              <Icon name="arrow-right" color="#FFF" size={24} />
            </View>

            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    marginBottom: 12,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 24,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},
  selectBox: {
    color: '#333',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },
})
