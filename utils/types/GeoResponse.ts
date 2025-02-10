export interface GeoResponse {
  totalResultsCount: number;
  geonames: CityResponse[];
}
export interface CityResponse {
  lng: string;
  lat: string;
  name: string;
  population: number;
  geonameId: number;
}
