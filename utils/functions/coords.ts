import { CityMapPoint, CityPoint } from '../types/CityPoint';
import { CityResponse } from '../types/GeoResponse';
import { MapData } from '../types/MapData';

// FIXME Remove the excessive number of flatten calls to flatten mapData coords

/**
 * Converts latitude and longitude coordinates to 2D coordinates based on the
 * Web Mercator Projection.
 *
 * @param lat the latitude in degrees
 * @param lng the longitude in degrees
 * @returns an object containing latitude and longitude for a 2D plane
 */
export const flattenCoords = (
  lat: number,
  lng: number
): {
  lat: number;
  lng: number;
} => {
  return {
    lng: (lng / 180) * Math.PI,
    lat: Math.PI - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)),
  };
};

/**
 * Calculates the distance between to flattened coordinates using pythagoras.
 *
 * @param flatLat1 flattened latitude of first coordinate
 * @param flatLong1 flattened longitude of first coordinate
 * @param flatLat2 flattened latitude of second coordinate
 * @param flatLong2 flattened longitude of second coordinate
 * @returns the distance between the two coordinates
 */
export const calculateDistance = (
  flatLat1: number,
  flatLong1: number,
  flatLat2: number,
  flatLong2: number
): number => {
  // Good ol pythagoras
  return Math.sqrt(
    Math.pow(flatLat1 - flatLat2, 2) + Math.pow(flatLong1 - flatLong2, 2)
  );
};

/**
 * Determines whether two flattened coordinates are within range of each other.
 *
 * @param flatLat1 flattened latitude of first coordinate
 * @param flatLong1 flattened longitude of first coordinate
 * @param flatLat2 flattened latitude of second coordinate
 * @param flatLong2 flattened longitude of second coordinate
 * @param distance the maximum distance the coordinates can be to in range
 * @returns the distance between the two coordinates
 */
export const withinRange = (
  flatLat1: number,
  flatLong1: number,
  flatLat2: number,
  flatLong2: number,
  distance: number
): boolean => {
  return (
    calculateDistance(flatLat1, flatLong1, flatLat2, flatLong2) <= distance
  );
};

/**
 * Reverts relative x coordinate back to longitude
 *
 * @param mapData data containing information on the bounds of the map
 * @param x the relative x coordinate to revert
 * @returns the flattened longitude coordinate
 */
export const revertRelX = (mapData: MapData, x: number) => {
  const flattenedMax = flattenCoords(mapData.latMax, mapData.longMax);
  const flattenedMin = flattenCoords(mapData.latMin, mapData.longMin);

  const long = (flattenedMax.lng - flattenedMin.lng) * x + flattenedMin.lng;

  return long;
};

/**
 * Reverts relative y coordinate back to latitude
 *
 * @param mapData data containing information on the bounds of the map
 * @param y the relative x coordinate to revert
 * @returns the flattened latitude coordinate
 */
export const revertRelY = (mapData: MapData, y: number) => {
  const flattenedMax = flattenCoords(mapData.latMax, mapData.longMax);
  const flattenedMin = flattenCoords(mapData.latMin, mapData.longMin);

  const lat = flattenedMax.lat - (flattenedMax.lat - flattenedMin.lat) * y;
  return lat;
};

export function mapToScreenPoint(
  mapData: MapData,
  point: CityMapPoint
): CityPoint {
  // First flatten the coordinates to 2d plane
  const flattenedMax = flattenCoords(mapData.latMax, mapData.longMax);
  const flattenedMin = flattenCoords(mapData.latMin, mapData.longMin);

  const x =
    (point.lng - flattenedMin.lng) / (flattenedMax.lng - flattenedMin.lng);
  const y =
    (flattenedMax.lat - point.lat) / (flattenedMax.lat - flattenedMin.lat);

  return {
    x,
    y,
    name: point.name,
    population: point.population,
    id: point.id,
  };
}

export function screenToMapPoint(
  mapData: MapData,
  point: CityPoint
): CityMapPoint {
  return {
    lng: revertRelX(mapData, point.x),
    lat: revertRelY(mapData, point.y),
    name: point.name,
    population: point.population,
    id: point.id,
  };
}

export function refineCityMapPoint(city: CityResponse): CityMapPoint {
  return {
    id: city.geonameId,
    ...flattenCoords(+city.lat, +city.lng),
    name: city.name,
    population: city.population,
  };
}
