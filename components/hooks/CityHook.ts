import { useEffect, useMemo, useState } from 'react';
import { getCities } from '../../utils/api/cities';
import {
  calculateDistance,
  flattenCoords,
  revertRelY,
  revertRelX,
  withinRange,
  mapToScreenPoint,
  screenToMapPoint,
} from '../../utils/functions/coords';
import {
  CityMapPoint,
  CityPoint,
  HolePoint,
  nullPoint,
  Point,
} from '../../utils/types/CityPoint';
import { CityResponse } from '../../utils/types/GeoResponse';
import { MapData } from '../../utils/types/MapData';
import { minBy, maxBy, orderBy, find } from 'lodash-es';
import Settings from '../../utils/types/Settings';
import { mapDifficulty } from '../../utils/functions/settings/difficulty';
import { mapHoleRadius } from '../../utils/functions/settings/holeRadius';

export function useCities(
  mapData: MapData,
  settings: Settings,
  cities: CityMapPoint[],
  params: {
    start?: number;
    end?: number;
    holes?: HolePoint[];
  }
) {
  type queryResult = 'Win' | 'In' | 'Out' | 'Same' | 'None' | 'Hole';

  const flattenedMax = flattenCoords(mapData.latMax, mapData.longMax);
  const flattenedMin = flattenCoords(mapData.latMin, mapData.longMin);

  const searchRadius = useMemo<number>(
    () =>
      mapDifficulty(mapData, settings.difficulty) *
      (flattenedMin.lat - flattenedMax.lat),
    [flattenedMax.lat, flattenedMin.lat, mapData, settings.difficulty]
  );

  const holeRadius = useMemo<number>(
    () =>
      mapHoleRadius(mapData, settings.holeRadius) *
      (flattenedMin.lat - flattenedMax.lat),
    [flattenedMax.lat, flattenedMin.lat, mapData, settings.holeRadius]
  );

  const validCities = useMemo(
    () =>
      cities.filter(
        (c) =>
          !params.holes?.some((h) =>
            withinRange(
              c.lat,
              c.lng,
              revertRelY(mapData, h.y),
              revertRelX(mapData, h.x),
              h.radius * (flattenedMin.lat - flattenedMax.lat)
            )
          )
      ),
    [cities, flattenedMax.lat, flattenedMin.lat, mapData, params.holes]
  );

  const [startPoint, setStartPoint] = useState<CityPoint>(nullPoint);
  const [endPoint, setEndPoint] = useState<CityPoint>(nullPoint);
  const [holes, setHoles] = useState<HolePoint[]>([]);

  useEffect(() => {
    if (validCities.length === 0) {
      return;
    }

    const startCityResponse =
      params.start !== undefined
        ? cities[params.start]
        : validCities[Math.floor(Math.random() * validCities.length)];

    // Identifying cities far enough from
    const minDist = searchRadius * 2; //(mapData.latMax - mapData.latMin) / 4;
    const farEnoughCities = validCities.filter(
      (c) =>
        !withinRange(
          startCityResponse.lat,
          startCityResponse.lng,
          c.lat,
          c.lng,
          minDist
        )
    );

    const endCityResponse =
      params.end !== undefined
        ? cities[params.end]
        : farEnoughCities[Math.floor(Math.random() * farEnoughCities.length)];

    // Finding absolute index of selected cities
    console.log(
      `c1=${
        params.start ?? cities.findIndex((c) => c.id === startCityResponse.id)
      }&c2=${
        params.end ?? cities.findIndex((c) => c.id === endCityResponse.id)
      }`
    );

    setStartPoint(mapToScreenPoint(mapData, startCityResponse));
    setEndPoint(mapToScreenPoint(mapData, endCityResponse));
  }, [cities, mapData, params.end, params.start, searchRadius, validCities]);

  console.log(startPoint, endPoint);

  useEffect(() => {
    if (endPoint === nullPoint || startPoint === nullPoint) {
      return;
    }

    if (params.holes !== undefined && params.holes.length > 0) {
      setHoles(params.holes);

      return;
    }

    const newHoles: HolePoint[] = [];

    // For determing if holes are within range to the start and end
    const startMapCoords = screenToMapPoint(mapData, startPoint);
    const endMapCoords = screenToMapPoint(mapData, endPoint);

    let holeX = 0;
    let holeY = 0;
    let percentage = 0;
    let variance = 0;
    for (let i = 0; i < settings.holes; i++) {
      const ATTEMPTS = 100;
      let attempts = 0;
      do {
        // The random variables
        percentage = Math.random();
        variance = (Math.random() - 0.5) * 2;

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
        // And then deviated from the journey by some amount
        holeX =
          startPoint.x +
          (endPoint.x - startPoint.x) * percentage +
          Math.cos(angle) * variance * distance;
        holeY =
          startPoint.y +
          (endPoint.y - startPoint.y) * percentage +
          Math.sin(angle) * variance * distance;
      } while (
        attempts++ < ATTEMPTS &&
        // Make sure holes are within bounds and not within range of start or end
        (withinRange(
          startMapCoords.lat,
          startMapCoords.lng,
          revertRelY(mapData, holeY),
          revertRelX(mapData, holeX),
          holeRadius * 1.05
        ) ||
          withinRange(
            endMapCoords.lat,
            endMapCoords.lng,
            revertRelY(mapData, holeY),
            revertRelX(mapData, holeX),
            holeRadius * 1.05
          ) ||
          holeY > 1 ||
          holeY < 0 ||
          holeX > 1 ||
          holeX < 0)
      );

      // Only add holes if managed to generate within given attempts
      if (attempts <= ATTEMPTS) {
        newHoles.push({
          x: holeX,
          y: holeY,
          radius: mapHoleRadius(mapData, settings.holeRadius),
        });
      } else {
        console.error("Couldn't add hole");
      }
    }

    // For debugging purposes
    if (newHoles.length > 0) {
      console.log(
        newHoles
          .map(({ x, y, radius }, i) => `h${i}=${[x, y, radius].join(',')}`)
          .join('&')
      );
    }

    setHoles(newHoles);
  }, [
    endPoint,
    startPoint,
    params.holes,
    mapData,
    settings.holes,
    settings.holeRadius,
    holeRadius,
  ]);

  const [routePoints, setRoutePoints] = useState<CityPoint[]>([]);
  const [farPoints, setFarPoints] = useState<CityPoint[]>([]);

  return {
    searchRadius,
    cities: {
      get current(): CityPoint {
        return routePoints.length === 0
          ? startPoint
          : routePoints.at(-1) ?? nullPoint;
      },
      get past(): CityPoint[] {
        if (routePoints.length < 1) {
          return [];
        } else {
          return [startPoint].concat(routePoints.slice(0, -1));
        }
      },
      start: startPoint,
      far: farPoints,
      end: endPoint,
      holes,
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
      const cities1 = rawCities.filter(
        (city) => city.id !== this.cities.current.id
      );

      // Only possible if there existed only a single city in array previously,
      // which was the current city
      if (cities1.length === 0) {
        return { result: 'Same', city: this.cities.current };
      }

      // Remove cities within holes
      const cities = cities1.filter(
        (c) =>
          !holes.some((h) =>
            withinRange(
              c.lat,
              c.lng,
              revertRelY(mapData, h.y),
              revertRelX(mapData, h.x),
              h.radius * (flattenedMin.lat - flattenedMax.lat)
            )
          )
      );

      if (cities.length === 0) {
        const converted = mapToScreenPoint(mapData, cities1[0]);
        setFarPoints(farPoints.concat(converted));

        return { result: 'Hole', city: converted };
      }

      // If the endpoint was included in queried cities
      const endPointIncluded = cities.some(
        (city) => city.id === this.cities.end.id
      );

      // Will be comparing points with current point, so need to revert current
      // point coordinates from relative
      const revertedCurrent = screenToMapPoint(mapData, this.cities.current);

      // If entered end point city name and is close enough
      if (endPointIncluded) {
        if (
          withinRange(
            revertRelY(mapData, this.cities.end.y),
            revertRelX(mapData, this.cities.end.x),
            revertedCurrent.lat,
            revertedCurrent.lng,
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

      let targetCity: CityMapPoint;

      const closestCity = minBy(cities, (c) =>
        calculateDistance(
          revertedCurrent.lat,
          revertedCurrent.lng,
          c.lat,
          c.lng
        )
      )!;

      if (settings.priority === 'Proximity') {
        targetCity = closestCity;
      } else if (settings.priority === 'Population') {
        targetCity = maxBy(cities, (c) => c.population)!;
      } else {
        // Prioritise cities by population size
        const citiesByPopulation = orderBy(cities, (c) => c.population, 'desc');

        // Return the largest population city within the circle
        //  otherwise return the closest city outside the circle
        targetCity =
          find(citiesByPopulation, (c) =>
            withinRange(
              c.lat,
              c.lng,
              revertedCurrent.lat,
              revertedCurrent.lng,
              searchRadius
            )
          ) ?? closestCity;
      }

      // Convert closest city to relative coords
      const convertedTarget = mapToScreenPoint(mapData, targetCity);

      // Is within circle?
      if (
        withinRange(
          targetCity.lat,
          targetCity.lng,
          revertedCurrent.lat,
          revertedCurrent.lng,
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
