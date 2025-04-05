export interface IMapProps extends google.maps.MapOptions {
    center: { lat: number, lng: number };
    zoom: number;
    style?: { [key: string]: string };
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onIdle?: (map: google.maps.Map) => void;
    children?: React.ReactNode;
}