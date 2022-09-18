import { CityResponse, GeoResponse } from './types/GeoResponse';
import { MapData } from './types/MapData';

export const getRandomCities = async (mapData: MapData) => {
  const path = `https://secure.geonames.org/searchJSON?&featureClass=P&north=${mapData.latMax}&east=${mapData.longMax}&south=${mapData.latMin}&west=${mapData.longMin}&username=Daniel5055&orderby=population`;
  let pathWhole = path
  let pathPart = path

  let response: CityResponse[] = []

  if (mapData.countryCodes.whole != null) {
    mapData.countryCodes.whole!!.forEach((cc) => pathWhole += `&country=${cc}`);
    const wholeResponse = await fetch(pathWhole).then((res) => res.json()) as GeoResponse;
    response = response.concat(wholeResponse.geonames);
  }

  if (mapData.countryCodes.part != null) {
    mapData.countryCodes.part?.forEach((part) => {
      pathPart += `&country=${part.country}`
      part.admin1?.forEach((region) => {
        pathPart += `&adminCode1=${region}`
      })
      part.admin2?.forEach((region) => {
        pathPart += `&adminCode2=${region}`
      })
    })

    console.log(pathPart);
    const partResponse = await fetch(pathPart).then((res) => res.json()) as GeoResponse;
    response = response.concat(partResponse.geonames)
  }



  return response.sort((a, b) => b.population - a.population).slice(0, 100);
};

export const getCities = async (mapData: MapData, name: string) => {
  let path = `https://secure.geonames.org/searchJSON?name_equals=${name}&featureClass=P&north=${mapData.latMax}&east=${mapData.longMax}&south=${mapData.latMin}&west=${mapData.longMin}&username=Daniel5055`;
  let pathWhole = path
  let pathPart = path
  mapData.countryCodes.whole?.forEach((cc) => pathWhole += `&country=${cc}`);
  mapData.countryCodes.part?.forEach((part) => {
    pathPart += `&country=${part.country}`
    part.admin1?.forEach((region) => {
      pathPart += `&adminCode1=${region}`
    })
    part.admin2?.forEach((region) => {
      pathPart += `&adminCode2=${region}`
    })
  })

  const wholeResponse = (mapData.countryCodes.whole ? await fetch(pathWhole).then((res) => res.json()) : { totalResultsCount: 0, geonames: []}) as GeoResponse;
  const partResponse = (mapData.countryCodes.part ? await fetch(pathPart).then((res) => res.json()) : { totalResultsCount: 0, geonames: []}) as GeoResponse;

  return wholeResponse.geonames.concat(partResponse.geonames);
};
