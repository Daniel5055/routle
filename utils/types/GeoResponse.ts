export interface GeoResponse {
  totalResultsCount: number;
  geonames: CityResponse[];
}
export interface CityResponse {
  lng: number;
  lat: number;
  name: string;
  population: number;
}
