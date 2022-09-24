import { useEffect, useState } from 'react';
import {
  convertToRelScreenCoords,
  withinRange,
} from '../../utils/functions/coords';
import { CityPoint } from '../../utils/types/CityPoint';
import { CityResponse } from '../../utils/types/GeoResponse';
import { MapData } from '../../utils/types/MapData';

export function useCities(mapData: MapData, cities: CityResponse[], city1?: number, city2?: number) {
  // Random is not deterministic, so must assign randomness from within hook.
  // This is because both 'server' and client side evaluate random, which leads to weird stuff.
  useEffect(() => {
    let startIndex;
    let endIndex;
    if (city1 !== undefined && city1 >= 0 && city1 <= cities.length) {
      startIndex = city1;
    } else {
      startIndex = Math.floor(Math.random() * cities.length);
    }

    if (city2 !== undefined && city2 >= 0 && city2 <= cities.length) {
      endIndex = city2;
    } else {
      endIndex = Math.floor(Math.random() * cities.length);
    }

    const startCityResponse = cities[startIndex];
    let endCityResponse = cities[endIndex];

    if (city1 === undefined && city2 === undefined) {
      // Iterate until end city is far enough ( a bit shoddy yes I know)
      // Only do so for truly random cities
      const minDist = (mapData.latMax - mapData.latMin) / 4;
      while (
        withinRange(
          startCityResponse.lat,
          startCityResponse.lng,
          endCityResponse.lat,
          endCityResponse.lng,
          minDist
        )
      ) {
        endIndex = Math.floor(Math.random() *  cities.length);
        endCityResponse = cities[endIndex];
      }
    }

    // Debugging purposes
    console.log('c1:', startIndex, ', c2:', endIndex);

    setStartPoint({
      ...convertToRelScreenCoords(
        mapData,
        startCityResponse.lat,
        startCityResponse.lng
      ),
      name: startCityResponse.name,
    });
    setEndPoint({
      ...convertToRelScreenCoords(
        mapData,
        endCityResponse.lat,
        endCityResponse.lng
      ),
      name: endCityResponse.name,
    });
  }, [cities, mapData, city1, city2]);

  const nullPoint = { x: 10000, y: 10000, name: '???' };
  const [startPoint, setStartPoint] = useState<CityPoint>(nullPoint);
  const [endPoint, setEndPoint] = useState<CityPoint>(nullPoint);
  return { startPoint, endPoint };
}
