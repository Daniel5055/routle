import { MapData } from '../types/MapData';

/**
 * Converts latitude and longitude coordinates to 2D coordinates based on the
 * Web Mercator Projection.
 *
 * @param lat the latitude as a decimal
 * @param long the longitude as a decimal
 * @returns an object containing latitude and longitude for a 2D plane
 */
export const flattenCoords = (
  lat: number,
  long: number
): {
  lat: number;
  long: number;
} => {
  return {
    long: long,
    lat: Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)),
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
 * Converts spherical coordinates to flattened coordinates relative to a bounds.
 *
 * @param mapData data containing information on the bounds of the coordinates
 * @param lat the latitude of the coordinate
 * @param long the longitude of the coordinate
 * @returns an object containing the relative flattened coordinates, should be
 * between 0 and 1 in theory
 */
export const convertToRelScreenCoords = (
  mapData: MapData,
  lat: number,
  long: number
): { x: number; y: number } => {
  // First flatten the coordinates to 2d plane
  const flattenedCoords = flattenCoords(lat, long);
  const flattenedMax = flattenCoords(mapData.latMax, mapData.longMax);
  const flattenedMin = flattenCoords(mapData.latMin, mapData.longMin);

  const x =
    (flattenedCoords.long - flattenedMin.long) /
    (flattenedMax.long - flattenedMin.long);
  const y =
    (flattenedMax.lat - flattenedCoords.lat) /
    (flattenedMax.lat - flattenedMin.lat);

  return { x, y };
};
