import { MapData } from "../types/MapData"
import { CityPoint } from "../types/CityPoint"

const flattenCoords = (lat: number, long: number): 
  {
    lat: number,
    long: number,
  } => {
    return {
      long: long,
      lat: Math.log(Math.tan(Math.PI/4 + lat * Math.PI / 360)),
    }
}

const flattenLat = (lat: number) => {
  return Math.log(Math.tan(Math.PI/4 + lat * Math.PI / 360));
}

export const calculateDistance = (
  lat1: number,
  long1: number,
  lat2: number,
  long2: number,
) => {
  // Good ol pythagoras
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(long1 - long2, 2))
}

export const withinRange = (
  lat1: number,
  long1: number,
  lat2: number,
  long2: number,
  distance: number,
) => {
  return calculateDistance(lat1, long1, lat2, long2) <= distance
}

export const convertToScreenCoords = (mapData: MapData, lat: number, long: number, width: number, height: number): CityPoint => {
  const flattened = flattenCoords(lat, long);

  const x = (flattened.long - mapData.longMin) / (mapData.longMax - mapData.longMin) * width;
  const y = (flattenLat(mapData.latMax) - flattened.lat) / (flattenLat(mapData.latMax) - flattenLat(mapData.latMin)) * height;

  return { x: x, y: y};
}