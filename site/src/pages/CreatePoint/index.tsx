import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import { LeafletMouseEvent, LatLngTuple } from "leaflet";
import {
  useMapEvents,
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import api from "../../services/api";
import logo from "../../assets/logo.svg";

import "./styles.css";

type IColectItem = {
  id: number;
  title: string;
  image_url: string;
};

type IBGEResponseUF = {
  sigla: string;
};

type IBGEResponseCity = {
  nome: string;
};

type ILocationMarkerProps = {
  onClickMap: (map: LeafletMouseEvent) => void;
  selectedPosition: [number, number];
};

function LocationMarker({
  selectedPosition,
  onClickMap,
}: ILocationMarkerProps) {
  const map = useMapEvents({
    click(event) {
      onClickMap(event);
      map.flyTo(event.latlng);
    },
  });

  return (
    <Marker position={selectedPosition}>
      <Popup>Eu estou aqui</Popup>
    </Marker>
  );
}

export default function CreatePoint() {
  const [isColectPointCreated, setIsColectPointCreated] = useState(false);

  const [colectItems, setColectItems] = useState<IColectItem[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [citys, setCitys] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState("RR");
  const [selectedCity, setSelectedCity] = useState("Boa Vista");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const [initialPosition, setInitialPosition] = useState<LatLngTuple>();
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0, 0,
  ]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setInitialPosition([latitude, longitude]);
      },
      () => {
        setInitialPosition([0, 0]);
      }
    );
  }, []);

  useEffect(() => {
    api.get("items").then((response) => setColectItems(response.data.items));
  }, []);

  useEffect(() => {
    axios
      .get<IBGEResponseUF[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      )
      .then((response) => {
        const ufInitials = response.data.map((uf) => uf.sigla);
        setUfs(ufInitials);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === "") {
      setCitys([]);

      return;
    }

    axios
      .get<IBGEResponseCity[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cityNames = response.data.map((city) => city.nome);

        setCitys(cityNames);
      });
  }, [selectedUf]);

  const handleSelectUF = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUf(event.target.value);
  };

  const handleSelectCity = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  };

  const handleClickOnMap = (event: LeafletMouseEvent) => {
    const { lat, lng } = event.latlng;
    setSelectedPosition([lat, lng]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleSelectedItem = (itemId: number) => {
    const itemAlreadySelected = selectedItems.includes(itemId);

    if (itemAlreadySelected) {
      const filteredItems = selectedItems.filter((id) => id !== itemId);

      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSubmitFormToCreatPoint = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;
    const point = {
      name,
      email,
      whatsapp,
      uf,
      city,
      items,
      latitude,
      longitude,
    };

    await api.post("/points", point);

    setIsColectPointCreated(true);
  };

  const handleResetForm = () => {
    setSelectedUf("");
    setSelectedCity("");
    setSelectedPosition([0, 0]);
    setFormData({
      name: "",
      email: "",
      whatsapp: "",
    });
    setSelectedItems([]);

    setIsColectPointCreated(false);
  };

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={(event) => handleSubmitFormToCreatPoint(event)}>
        <h1>
          Cadastro do <br />
          ponto de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              value={formData.name}
              onChange={handleInputChange}
              type="text"
              name="name"
              id="name"
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                value={formData.email}
                onChange={handleInputChange}
                type="email"
                name="email"
                id="email"
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                value={formData.whatsapp}
                onChange={handleInputChange}
                type="text"
                name="whatsapp"
                id="whatsapp"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          {initialPosition && (
            <MapContainer
              center={initialPosition}
              zoom={16}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <LocationMarker
                onClickMap={handleClickOnMap}
                selectedPosition={selectedPosition}
              />

              <Marker position={initialPosition}>
                <Popup>Eu estou aqui</Popup>
              </Marker>

              {selectedPosition !== [0, 0] && (
                <Marker position={selectedPosition}>
                  <Popup>Você clicou aqui.</Popup>
                </Marker>
              )}
            </MapContainer>
          )}

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado</label>
              <select onChange={handleSelectUF} name="uf" id="uf">
                <option value="">Selecione uma estado</option>
                {ufs.map((initial) => (
                  <option value={initial}>{initial}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select onChange={handleSelectCity} name="city" id="city">
                <option value="">Selecione uma cidade</option>
                {citys.map((city) => (
                  <option value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ìtems de coleta</h2>
            <span>Selecione um ou mais items abaixo</span>
          </legend>

          <ul className="items-grid">
            {colectItems.map(({ id, image_url, title }) => (
              <li
                key={id}
                className={`${selectedItems.includes(id) ? "selected" : ""}`}
                onClick={() => handleSelectedItem(id)}
              >
                <img src={image_url} alt={title} />
                <span>{title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>

      {isColectPointCreated && (
        <div id="submit-overlay">
          <div className="animate">
            <FiCheckCircle />
            <h2>Cadastro concluído</h2>
            <button onClick={handleResetForm}>Voltar</button>
          </div>
        </div>
      )}
    </div>
  );
}
