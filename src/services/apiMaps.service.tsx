import axios from 'axios';

const urlApiMaps = 'https://maps.googleapis.com/maps/api/geocode/json';
const initialCenter = { lat: 38.736946, lng: -9.142685 };
const initialZoom = 12;

const getAddressByCoordinates = (apiKey: string, { lat, lng }: { lat: number, lng: number }) => {
    return axios.get(`${urlApiMaps}?latlng=${lat},${lng}&key=${apiKey}`);
}

const getCoordinatesByAddress = (apiKey: string, address: string) => {
    return axios.get(`${urlApiMaps}?address=${address}&key=${apiKey}`);
}

export {
    initialCenter,
    initialZoom,
    getAddressByCoordinates,
    getCoordinatesByAddress
}