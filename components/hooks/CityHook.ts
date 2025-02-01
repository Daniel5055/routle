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
import { CityPoint } from '../../utils/types/CityPoint';
import { CityResponse } from '../../utils/types/GeoResponse';
import { MapData } from '../../utils/types/MapData';
import priority from '../../utils/functions/settings/priority';
import { minBy, maxBy, sortBy, orderBy, find } from 'lodash-es';

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
        population: startCityResponse.population,
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
      population: endCityResponse.population,
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

  const nullPoint: CityPoint = {
    x: 10000,
    y: 10000,
    name: '???',
    id: 0,
    population: 0,
  };
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
            population: city.population,
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

      const prio = priority.getValue();

      let targetCity: CityPoint;

      const closestCity = minBy(cities, (c) =>
        calculateDistance(revertedCurrent.y, revertedCurrent.x, c.y, c.x)
      )!;

      if (prio === 'Proximity') {
        targetCity = closestCity;
      } else if (prio === 'Population') {
        targetCity = maxBy(cities, (c) => c.population)!;
      } else {
        // Prioritise cities by population size
        const citiesByPopulation = orderBy(cities, (c) => c.population, 'desc');

        // Return the largest population city within the circle
        //  otherwise return the closest city outside the circle
        targetCity =
          find(citiesByPopulation, (c) =>
            withinRange(
              c.y,
              c.x,
              revertedCurrent.y,
              revertedCurrent.x,
              searchRadius
            )
          ) ?? closestCity;
      }

      // Convert closest city to relative coords
      const convertedTarget = {
        ...targetCity,
        ...convertToRelScreenCoords(mapData, targetCity.y, targetCity.x, true),
      };

      // Is within circle?
      if (
        withinRange(
          targetCity.y,
          targetCity.x,
          revertedCurrent.y,
          revertedCurrent.x,
          searchRadius
        )
      ) {
        // Within circle

        // Add to route
        setRoutePoints(routePoints.concat(convertedTarget));

        // Clear far cities
        setFarPoints([]);

        return { result: 'In', city: convertedTarget };
      }

      // Else too far
      setFarPoints(farPoints.concat(convertedTarget));

      return { result: 'Out', city: convertedTarget };
    },
  };
}
