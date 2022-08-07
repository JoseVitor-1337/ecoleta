import { useState, useEffect } from 'react'
import {
  Alert,
  Image,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import api from '../../services/api'
import { Feather as Icon } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { useNavigation, useRoute } from '@react-navigation/native'
import MapView, { Marker } from 'react-native-maps'
import { SvgUri } from 'react-native-svg'
import * as Location from 'expo-location'

type Params = {
  city: string
  uf: string
}

type Item = {
  id: number
  title: string
  image_url: string
}

type Points = {
  id: number
  name: string
  latitude: number
  longitude: number
  image: string
}

type InitialPosition = {
  latitude: number
  longitude: number
}

type Response = {
  data: { items: Item[] }
}

export default function Points() {
  const [initialPosition, setInitialPosition] = useState<InitialPosition>({
    latitude: 0,
    longitude: 0,
  })
  const [points, setPoints] = useState<Points[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  const navigation = useNavigation()

  const route = useRoute()

  const { city, uf } = route.params as Params

  useEffect(() => {
    api.get('items').then((response: Response) => {
      setItems(response.data.items)
    })
  }, [])

  useEffect(() => {
    async function loadInitialPosition() {
      const { granted } = await Location.requestBackgroundPermissionsAsync()

      if (!granted) {
        Alert.alert('Precisamos de sua posição para obter sua localização')
        return
      }

      const location = await Location.getCurrentPositionAsync()

      const { latitude, longitude } = location.coords

      setInitialPosition({ latitude, longitude })
    }
    loadInitialPosition()
  }, [])

  useEffect(() => {
    console.log('{ city, uf, items: selectedItems }', {
      city,
      uf,
      items: selectedItems,
    })
    api
      .get('points', {
        params: { city, uf, items: selectedItems },
      })
      .then((response) => {
        setPoints(response.data.points)
      })
  }, [selectedItems])

  const handleSelectedItem = (itemId: number) => {
    const itemAlreadySelected = selectedItems.includes(itemId)

    if (itemAlreadySelected) {
      const filteredItems = selectedItems.filter((id) => id !== itemId)

      setSelectedItems(filteredItems)
    } else {
      setSelectedItems([...selectedItems, itemId])
    }
  }

  const handleNavigateBack = () => {
    navigation.goBack()
  }

  const handleNavigateToDetail = (id: number) => {
    navigation.navigate('Detail' as never, { point_id: id } as never)
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Text style={styles.title}>Bem Vindo.</Text>
        <Text style={styles.description}>
          Encontre no mapa um ponto de coleta.
        </Text>

        <View style={styles.mapContainer}>
          {initialPosition.longitude !== 0 && (
            <MapView
              style={styles.map}
              initialRegion={{
                ...initialPosition,
                latitudeDelta: 0.014,
                longitudeDelta: 0.014,
              }}
            >
              {points.map(({ id, image, latitude, longitude, name }) => (
                <Marker
                  key={id}
                  onPress={() => handleNavigateToDetail(id)}
                  style={styles.mapMarker}
                  coordinate={{
                    latitude,
                    longitude,
                  }}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image
                      style={styles.mapMarkerImage}
                      source={{ uri: image }}
                    />
                    <Text style={styles.mapMarkerTitle}>{name}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {items.map(({ id, image_url, title }) => (
            <TouchableOpacity
              key={id}
              style={[
                styles.item,
                selectedItems.includes(id) ? styles.selectedItem : {},
              ]}
              activeOpacity={0.7}
              onPress={() => handleSelectedItem(id)}
            >
              <SvgUri width={42} height={42} uri={image_url} />
              <Text style={styles.itemTitle}>{title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80,
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
})
