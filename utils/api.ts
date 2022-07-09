import { MapData } from "./types/MapData"

export const getRandomCities = async (mapData: MapData, seed: string ) => {
  let path2 = 
  `http://api.geonames.org/searchJSON?q=${seed}&featureClass=P&north=${mapData.latMax}&east=${mapData.longMax}&south=${mapData.latMin}&west=${mapData.longMin}&username=Daniel5055`
  mapData.countryCodes.forEach((cc) => path2 += `&country=${cc}`)

  console.log(path2)

  return fetch(path2);
}

export const getCities = async (mapData: MapData, name: string ) => {
  let path = `http://api.geonames.org/searchJSON?name_equals=${name}&featureClass=P&north=${mapData.latMax}&east=${mapData.longMax}&south=${mapData.latMin}&west=${mapData.longMin}&username=Daniel5055`
  mapData.countryCodes.forEach((cc) => path += `&country=${cc}`)
  return fetch(path);
}