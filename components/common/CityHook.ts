import { useEffect, useState } from "react";
import { convertToRelScreenCoords, withinRange } from "../../utils/functions/coords";
import { CityPoint } from "../../utils/types/CityPoint";
import { CityResponse } from "../../utils/types/GeoResponse";
import { MapData } from "../../utils/types/MapData";


export function useCities(mapData: MapData, cities: CityResponse[]) {
    // Random is not deterministic, so must assign randomness from within hook.
    // This is because both 'server' and client side evaluate random, which leads to weird stuff.
    useEffect(() => {
        const startCityResponse = cities[Math.floor(Math.random() * cities.length)]
        let endCityResponse = cities[Math.floor(Math.random() * cities.length)]

        // Iterate until end city is far enough ( a bit shoddy yes I know)
        const minDist = (mapData.latMax - mapData.latMin) / 4;
        while (
        withinRange(startCityResponse.lat, startCityResponse.lng, endCityResponse.lat, endCityResponse.lng, minDist)
        ) {
        endCityResponse =
            cities[Math.floor(Math.random() * cities.length)];
        }

        setStartPoint({ ...convertToRelScreenCoords(mapData, startCityResponse.lat, startCityResponse.lng), name: startCityResponse.name});
        setEndPoint({ ...convertToRelScreenCoords(mapData, endCityResponse.lat, endCityResponse.lng), name: endCityResponse.name});
    }, [cities, mapData])

    const nullPoint = { x: 10000, y: 10000, name: '???' }
    const [startPoint, setStartPoint] = useState<CityPoint>(nullPoint);
    const [endPoint, setEndPoint] = useState<CityPoint>(nullPoint);
    return {startPoint, endPoint}
}