import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import { IMapProps } from '../../../Interfaces/MapProps.interfaces';

export default function GoogleMaps({ center, zoom, onClick, onIdle, children }: IMapProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map>();

    useEffect(() => {
        if (ref.current && !map) {
            setMap(new window.google.maps.Map(ref.current, { center, zoom }));
        }
    }, [ref, map]);

    useEffect(() => {
        if (map) {
            map.panTo(center);
        }
    }, [map, center]);

    useEffect(() => {
        if (map) {
            ['click', 'idle'].forEach((eventName) => google.maps.event.clearListeners(map, eventName));

            if (onClick) {
                map.addListener('click', onClick);
            }

            if (onIdle) {
                map.addListener('idle', () => onIdle(map));
            }
        }
    }, [map, onClick, onIdle]);

    return (
        <>
            <div ref={ref} style={{ width: '100%', height: '100%' }}></div>
            {Children.map(children, (child) => {
                if (isValidElement(child)) {
                    // set the map prop on the child component
                    // @ts-ignore
                    return cloneElement(child, { map });
                }
            })}
        </>
    )
}