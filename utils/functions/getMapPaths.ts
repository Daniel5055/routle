import { readFile, readFileSync } from 'fs';
import { MapData } from '../types/MapData';

export const getMapPaths = () => {
  // Read the file containing map data and parse to json
  const data = readFileSync('public/mapList.json');
  let parsedData: MapData[];
  try {
    parsedData = JSON.parse(data.toString());
  } catch (err) {
    console.error('Error parsing json');
    throw err;
  }

  return parsedData.map((mapData) => {
    return {
      params: {
        map: mapData.name,
      },
    };
  });
};
