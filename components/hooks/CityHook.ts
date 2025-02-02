import { useEffect, useMemo, useState } from 'react';
import { getCities } from '../../utils/api/cities';
import {
  calculateDistance,
  convertToRelScreenCoords,
  flattenCoords,
  revertRelY,
  revertRelX,
  withinRange,
} from '../../utils/functions/coords';
import { CityPoint, Point } from '../../utils/types/CityPoint';
import { CityResponse } from '../../utils/types/GeoResponse';
import { MapData } from '../../utils/types/MapData';
import priority from '../../utils/functions/settings/priority';
import { minBy, maxBy, orderBy, find } from 'lodash-es';
import holes from '../../utils/functions/settings/holes';

export function useCities(
  mapData: MapData,
  cities: CityResponse[],
  searchRadiusMultiplier?: number,
  holeRadiusMultiplier?: number,
  city1?: number,
  city2?: number,
  holeParams?: [number, number][]
) {
  type queryResult = 'Win' | 'In' | 'Out' | 'Same' | 'None' | 'Hole';

  const flattenedMax = flattenCoords(mapData.latMax, mapData.longMax);
  const flattenedMin = flattenCoords(mapData.latMin, mapData.longMin);

  const nullPoint = useMemo<CityPoint>(
    () => ({
      x: 10000,
      y: 10000,
      name: '???',
      id: 0,
      population: 0,
    }),
    []
  );

  const [endPoint, setEndPoint] = useState<CityPoint>(nullPoint);
  const [routePoints, setRoutePoints] = useState<CityPoint[]>([]);
  const [farPoints, setFarPoints] = useState<CityPoint[]>([]);
  const [holePoints, setHolePoints] = useState<Point[]>([]);

  const searchRadius = useMemo<number | undefined>(() => {
    if (searchRadiusMultiplier != undefined) {
      return searchRadiusMultiplier * (flattenedMin.lat - flattenedMax.lat);
    } else {
      return undefined;
    }
  }, [flattenedMax.lat, flattenedMin.lat, searchRadiusMultiplier]);

  const holeRadius = useMemo<number | undefined>(() => {
    if (holeRadiusMultiplier != undefined) {
      return holeRadiusMultiplier * (flattenedMin.lat - flattenedMax.lat);
    } else {
      return undefined;
    }
  }, [flattenedMax.lat, flattenedMin.lat, holeRadiusMultiplier]);

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
    console.log(`c1=${startIndex}&c2=${endIndex}`);

    const startCoords = convertToRelScreenCoords(
      mapData,
      startCityResponse.lat,
      startCityResponse.lng
    );

    const endCoords = convertToRelScreenCoords(
      mapData,
      endCityResponse.lat,
      endCityResponse.lng
    );

    setRoutePoints([
      {
        ...startCoords,
        name: startCityResponse.name,
        id: startCityResponse.geonameId,
        population: startCityResponse.population,
      },
    ]);
    setEndPoint({
      ...endCoords,
      name: endCityResponse.name,
      id: endCityResponse.geonameId,
      population: endCityResponse.population,
    });
  }, [cities, mapData, city1, city2, holeRadius]);

  useEffect(() => {
    // Wait until start and end points generated and hole radius determined
    if (
      endPoint === nullPoint ||
      holeRadius === undefined ||
      routePoints.length === 0 ||
      routePoints.length > 1
    ) {
      return;
    }

    const useArgs = holeParams !== undefined && holeParams.length > 0;

    // Deciding on holes
    const holeCount = useArgs ? holeParams.length : holes.getValue();
    const newHoles: Point[] = [];
    const params: [number, number][] = [];

    // For determing if holes are within range to the start and end
    const startPoint = routePoints[0];
    const startMapCoords = {
      lat: revertRelY(mapData, startPoint.y),
      long: revertRelX(mapData, startPoint.x),
    };
    const endMapCoords = {
      lat: revertRelY(mapData, endPoint.y),
      long: revertRelX(mapData, endPoint.x),
    };

    const MAX_TRIES = 100;
    let holeX = 0;
    let holeY = 0;
    let percentage = 0;
    let variance = 0;
    for (let i = 0; i < holeCount; i++) {
      let tries = 0;
      do {
        tries++;
        if (tries > MAX_TRIES) {
          break;
        }

        holeX = 0;
        holeY = 0;

        // The random variables
        percentage = useArgs ? holeParams[i][0] : Math.random();
        variance = useArgs ? holeParams[i][1] : (Math.random() - 0.5) * 2;

        // Gradient perpendicular to gradient between start and end
        const invGradient =
          (endPoint.x - startPoint.x) / (startPoint.y - endPoint.y);

        // Distance from start to end
        const distance = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) +
            Math.pow(endPoint.y - startPoint.y, 2)
        );

        const angle = Math.atan(invGradient);

        // Hole location is some percentage of the journey from start to end
        holeX = startPoint.x + (endPoint.x - startPoint.x) * percentage;
        holeY = startPoint.y + (endPoint.y - startPoint.y) * percentage;

        // And then deviated from the journey by some amount
        holeX += Math.cos(angle) * variance * distance;
        holeY += Math.sin(angle) * variance * distance;
      } while (
        // Make sure holes are within bounds and not within range of start or end
        withinRange(
          startMapCoords.lat,
          startMapCoords.long,
          revertRelY(mapData, holeY),
          revertRelX(mapData, holeX),
          holeRadius * 1.05
        ) ||
        withinRange(
          endMapCoords.lat,
          endMapCoords.long,
          revertRelY(mapData, holeY),
          revertRelX(mapData, holeX),
          holeRadius * 1.05
        ) ||
        holeY > 1 ||
        holeY < 0 ||
        holeX > 1 ||
        holeX < 0
      );

      // Only add holes if managed to generate within given attempts
      if (tries <= MAX_TRIES) {
        newHoles.push({ x: holeX, y: holeY });
        params.push([percentage, variance]);
      }
    }

    setHolePoints(newHoles);

    // For debugging purposes
    if (newHoles.length > 0) {
      console.log(params.map((vals, i) => `h${i}=${vals.join(',')}`).join('&'));
    }
  }, [endPoint, holeParams, holeRadius, mapData, nullPoint, routePoints]);

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
      holes: holePoints,
    },
    queryCity: async function (search: string): Promise<{
      result: queryResult;
      city?: CityPoint;
    }> {
      if (searchRadius === undefined || holeRadius === undefined) {
        return { result: 'None' };
      }

      // Fetch cities from search
      const rawCities = await getCities(mapData, search);

      // If no hits
      if (rawCities.length === 0) {
        return { result: 'None' };
      }

      // Converting to easier type and removing current city
      const cities1 = rawCities
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
      if (cities1.length === 0) {
        return { result: 'Same', city: this.cities.current };
      }

      const cities = cities1.filter(
        (c) =>
          !holePoints.some((h) =>
            withinRange(
              c.y,
              c.x,
              revertRelY(mapData, h.y),
              revertRelX(mapData, h.x),
              holeRadius
            )
          )
      );

      if (cities.length === 0) {
        const converted = {
          ...cities1[0],
          ...convertToRelScreenCoords(
            mapData,
            cities1[0].y,
            cities1[0].x,
            true
          ),
        };
        setFarPoints(farPoints.concat(converted));
        return { result: 'Hole', city: converted };
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
