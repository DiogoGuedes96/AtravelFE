import { Spin, Typography } from 'antd';
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useEffect, useState } from 'react';
import {
    initialCenter, initialZoom,
    getAddressByCoordinates, getCoordinatesByAddress
} from '../../services/apiMaps.service';
import GoogleMaps from '../../components/Commons/Maps/GoogleMaps';
import Marker from '../../components/Commons/Maps/Marker';
import { useQuery } from 'react-query';
import { AlertService } from '../../services/alert.service';
import { getCompanyDetails } from '../../services/companies.service';

const { Text } = Typography;

interface ILocationsMap {
    address?: string,
    latLng?: google.maps.LatLngLiteral,
    updateLatLng: Function,
    updateAddress: Function
}

export default function LocationsMap({ address, latLng, updateLatLng, updateAddress }: ILocationsMap) {
    const [center, setCenter] = useState<google.maps.LatLngLiteral>(initialCenter);
    const [zoom, setZoom] = useState<number>(initialZoom);
    const [position, setPosition] = useState<google.maps.LatLngLiteral>();
    const [positionToFind, setPositionToFind] = useState<google.maps.LatLngLiteral>();
    const [apiKey, setApiKey] = useState<string>('');

    const elements = {
        [Status.LOADING]: <Spin tip="Aguarde..." size="large"><div className="content" /></Spin>,
        [Status.FAILURE]: <Text>Desculpe, não foi possível carregar o mapa. Tente novamente mais tarde.</Text>,
        [Status.SUCCESS]: <>Seu mapa está pronto.</>
    };

    const render = (status: Status) => elements[status];

    const handleMapsResponse = (status: string) => {
        if (status == 'OK') {
            return true;
        } else if (status == 'ZERO_RESULTS') {
            AlertService.sendAlert([
                { text: 'Não foi encontrada morada correspondente.', type: 'error' }
            ]);
        } else {
            AlertService.sendAlert([
                { text: 'A seleção do local no mapa é obrigatório.', type: 'error' }
            ]);
        }

        return false;
    }

    const {
        isLoading: isloadingApiKey,
    } = useQuery(
        ['getCompanyDetails'],
        () => getCompanyDetails(),
        {
            onSuccess: (response: any) => {
                if (response?.data) {
                    setApiKey(response?.data?.api_key_maps || '');
                }
            },
            refetchOnWindowFocus: false
        }
    );

    useQuery(
        ['loadByLatLng', positionToFind],
        () => positionToFind ? getAddressByCoordinates(apiKey, positionToFind) : null,
        {
            onSuccess: (response: any) => {
                if (response && handleMapsResponse(response.data.status)) {
                    updateLatLng(positionToFind);
                    updateAddress(response.data.results[0].formatted_address);
                }
            },
            refetchOnWindowFocus: false
        }
    );

    const { refetch: loadByAddress } = useQuery(
        ['loadByAddress'],
        () => getCoordinatesByAddress(apiKey, String(address)),
        {
            onSuccess: (response: any) => {
                if (response && handleMapsResponse(response.data.status)) {
                    let location = response.data.results[0].geometry.location;

                    setPosition(location);
                    setCenter(location);
                    updateLatLng(location);
                }
            },
            refetchOnWindowFocus: false,
            enabled: false
        }
    );

    const onClick = (event: google.maps.MapMouseEvent) => {
        setPositionToFind(event.latLng!.toJSON());
        setPosition(event.latLng!.toJSON());
        setCenter(event.latLng!.toJSON());
    };

    const onIdle = (map: google.maps.Map) => {
        setZoom(map.getZoom()!);
        setCenter(map.getCenter()!.toJSON());
    };

    useEffect(() => {
        if (address) {
            loadByAddress();
        }
    }, [address]);

    useEffect(() => {
        if (latLng) {
            setCenter(latLng);
            setPosition(latLng);
        }
    }, [latLng]);

    return (<>
        {apiKey && apiKey.length
            ? <Wrapper apiKey={apiKey} render={render} >
                <GoogleMaps
                    center={center} zoom={zoom}
                    onClick={onClick}
                    onIdle={onIdle}>
                    {position && <Marker position={position} />}
                </GoogleMaps>
            </Wrapper >
            : ''
        }
    </>);
}