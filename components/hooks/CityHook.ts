import { useEffect, useState } from 'react';
import { getCities } from '../../utils/api/cities';
import {
  calculateDistance,
  convertToRelScreenCoords,
  flattenCoords,
  revertRelY,
  revertRelX,
  withinRange,
} from '../../utils/functions/coords';
import { CityPoint, nullPoint } from '../../utils/types/CityPoint';
import { CityResponse } from '../../utils/types/GeoResponse';
import { MapData } from '../../utils/types/MapData';

export function useCities(
  mapData: MapData,
  cities: CityResponse[],
  searchRadiusMultiplier?: number,
  city1?: number,
  city2?: number
) {
  type queryResult = 'Win' | 'In' | 'Out' | 'Same' | 'None';

  // Random is not deterministic, so must assign randomness from within hook.
  // This is because both 'server' and client side evaluate random, which leads to weird stuff.
  useEffect(() => {
    if (cities.length === 0) {
      return;
    }

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
        endIndex = Math.floor(Math.random() * cities.length);
        endCityResponse = cities[endIndex];
      }
    }

    // Debugging purposes
    console.log('c1:', startIndex, ', c2:', endIndex);

    setRoutePoints([
      {
        ...convertToRelScreenCoords(
          mapData,
          startCityResponse.lat,
          startCityResponse.lng
        ),
        name: startCityResponse.name,
        id: startCityResponse.geonameId,
      },
    ]);
    setEndPoint({
      ...convertToRelScreenCoords(
        mapData,
        endCityResponse.lat,
        endCityResponse.lng
      ),
      name: endCityResponse.name,
      id: endCityResponse.geonameId,
    });
  }, [cities, mapData, city1, city2]);

  const [searchRadius, setSearchRadius] = useState(0);

  useEffect(() => {
    const flattenedMax = flattenCoords(mapData.latMax, mapData.longMax);
    const flattenedMin = flattenCoords(mapData.latMin, mapData.longMin);
    setSearchRadius(
      searchRadiusMultiplier! * (flattenedMin.lat - flattenedMax.lat)
    );
  }, [
    mapData.latMax,
    mapData.latMin,
    mapData.longMax,
    mapData.longMin,
    searchRadiusMultiplier,
  ]);

  const [endPoint, setEndPoint] = useState<CityPoint>(nullPoint);
  const [routePoints, setRoutePoints] = useState<CityPoint[]>([]);
  const [farPoints, setFarPoints] = useState<CityPoint[]>([]);

  return {
    cities: {
      get start(): CityPoint {
        return routePoints[0] ?? nullPoint;
      },
      get current(): CityPoint {
        return routePoints[routePoints.length - 1] ?? nullPoint;
      },
      get past(): CityPoint[] {
        if (routePoints.length < 1) {
          return [];
        } else {
          return routePoints.slice(0, -1);
        }
      },
      far: farPoints,
      end: endPoint,
    },
    queryCity: async function (search: string): Promise<{
      result: queryResult;
      city?: CityPoint;
    }> {
      // Fetch cities from search
      const rawCities = await getCities(mapData, search);

      // If no hits
      if (rawCities.length === 0) {
        return { result: 'None' };
      }

      // Converting to easier type and removing current city
      const cities = rawCities
        .map((city): CityPoint => {
          const { lat, long } = flattenCoords(city.lat, city.lng);
          return {
            name: city.name,
            id: city.geonameId,
            x: long,
            y: lat,
          };
        })
        .filter((city) => city.id !== this.cities.current.id);

      // Only possible if there existed only a single city in array previously,
      // which was the current city
      if (cities.length === 0) {
        return { result: 'Same', city: this.cities.current };
      }

      // If the endpoint was included in queried cities
      const endPointIncluded = cities.some(
        (city) => city.id === this.cities.end.id
      );

      // Will be comparing points with current point, so need to revert current
      // point coordinates from relative
      const revertedCurrent = {
        ...this.cities.current,
        x: revertRelX(mapData, this.cities.current.x),
        y: revertRelY(mapData, this.cities.current.y),
      };

      // Getting the closest city
      const closestCity = cities.reduce<{ city: CityPoint; distance: number }>(
        (closest, city) => {
          const distance = calculateDistance(
            revertedCurrent.y,
            revertedCurrent.x,
            city.y,
            city.x
          );

          if (distance < closest.distance) {
            closest.distance = distance;
            closest.city = city;
          }

          return closest;
        },
        { city: nullPoint, distance: 1000000 }
      ).city;

      // If entered end point city name and is close enough
      if (endPointIncluded) {
        if (
          withinRange(
            revertRelY(mapData, this.cities.end.y),
            revertRelX(mapData, this.cities.end.x),
            revertedCurrent.y,
            revertedCurrent.x,
            searchRadius
          )
        ) {
          // You win!

          // Add end city to route
          setRoutePoints(routePoints.concat(this.cities.end));

          // Clear far cities
          setFarPoints([]);

          return { result: 'Win', city: this.cities.end };
        }
      }

      // Convert closest city to relative coords
      const convertedClosest = {
        ...closestCity,
        ...convertToRelScreenCoords(
          mapData,
          closestCity.y,
          closestCity.x,
          true
        ),
      };

      // Is within circle?
      if (
        withinRange(
          closestCity.y,
          closestCity.x,
          revertedCurrent.y,
          revertedCurrent.x,
          searchRadius
        )
      ) {
        // Within circle

        // Add to route
        setRoutePoints(routePoints.concat(convertedClosest));

        // Clear far cities
        setFarPoints([]);

        return { result: 'In', city: convertedClosest };
      }

      // Else too far
      setFarPoints(farPoints.concat(convertedClosest));

      return { result: 'Out', city: convertedClosest };
    },
  };
}
