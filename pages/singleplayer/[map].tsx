import { readFileSync } from 'fs'
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { useEffect, useRef, useState } from 'react'
import Layout from '../../components/common/Layout'
import { getCities, getRandomCities } from '../../utils/api'
import { getMapPaths } from '../../utils/functions/getMapPaths'
import { MapData } from '../../utils/types/MapData'
import { MapDisplay } from '../../components/common/Map'
import { CityPoint, PointType } from '../../utils/types/CityPoint'
import { CityResponse, GeoResponse } from '../../utils/types/GeoResponse'
import { calculateDistance, convertToScreenCoords, withinRange } from '../../utils/functions/coords'
import { start } from 'repl'

const Map: NextPage = ({ mapData, startCity, endCity }: InferGetStaticPropsType<typeof getStaticProps>) => {

  const focusInput = useRef<HTMLInputElement>(null);
  setInterval(() => focusInput.current?.focus(), 5)

  const mapRef = useRef<HTMLImageElement>(null);
  
  const [entry, setEntry] = useState('');
  const [pastPoints, setPastPoints] = useState<CityPoint[]>([])
  const [farPoints, setFarPoints] = useState<CityPoint[]>([])
  const [currentPoint, setCurrentPoint] = useState<CityPoint>()
  const [startPoint, setStartPoint] = useState<CityPoint>()
  const [endPoint, setEndPoint] = useState<CityPoint>()

  useEffect(() => {
    if (mapRef.current) {
      setStartPoint(convertToScreenCoords(mapData, startCity.lat, startCity.lng, mapRef.current!!.width, mapRef.current!!.height))
      setCurrentPoint(convertToScreenCoords(mapData, startCity.lat, startCity.lng, mapRef.current!!.width, mapRef.current!!.height))
      setEndPoint(convertToScreenCoords(mapData, endCity.lat, endCity.lng, mapRef.current!!.width, mapRef.current!!.height))
    }
  }, [mapRef, endCity, startCity, mapData])

  // Multiply search radius by modifier when searchRadius is changed
  const [searchRadius, setSearchRadius] = useState<number>(1.0)
  useEffect(() => {
    setSearchRadius(searchRadius * mapData.searchRadius);
  }, [searchRadius, mapData.searchRadius]);

  // To organise the code better
  const handleSearch = () => {
    getCities(mapData, entry)
      .then((res) => res.json())
      .then((res: GeoResponse) => res.geonames)
      .then((cities) => {

        // Any hits?
        if (cities.length > 0) {
          // Find the closest among the cities
          let closestCity: CityPoint | undefined = undefined;
          let closestDistace = 1000000000;
          cities
            .map((city) => {
              // Flattening of coords
              return convertToScreenCoords(mapData, city.lat, city.lng, mapRef.current!!.width, mapRef.current!!.height);
            })
            .forEach((city) => {
              // Comparing distances
              const distance = calculateDistance(city.y, city.x,
                currentPoint!!.y, currentPoint!!.x);

              if (distance < closestDistace) {
                closestCity = city;
                closestDistace = distance;
              }
          });

          // Is within circle?
          if (withinRange(closestCity!!.y, closestCity!!.x,
            currentPoint!!.y, currentPoint!!.x, searchRadius)) {

            // Within circle

            // Push current city to past cities
            setPastPoints(pastPoints.concat(currentPoint!!));

            // Set new city as current city
            setCurrentPoint(closestCity!!);

          } else {
            // Outside of circle
            setFarPoints(farPoints.concat(closestCity!!));
          }
        }
      });
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // On enter press
    if (e.key === 'Enter') {
      handleSearch()
      setEntry('')
    }
  }

  return (
    <Layout description='Singleplayer Routle'>
      <h2>
        {`Get from ${startCity.name} to ${endCity.name}`}
      </h2>
      <MapDisplay
        mapData={mapData}
        setSearchRadius={setSearchRadius}
        mapRef={mapRef}
        startPoint={startPoint}
        endPoint={endPoint}
        currentPoint={currentPoint}
        pastPoints={pastPoints}
        farPoints={farPoints}
      />
      <input 
        type='text'
        aria-label='input'
        autoFocus
        onKeyDown={handleKeyDown}
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        ref={focusInput}/>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  
  const paths = getMapPaths();
  console.log(paths)
  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { map } = context.params!!
  

  // Find the map data
  const data = readFileSync('public/mapList.json');
  const parsedData: MapData[] = JSON.parse(data.toString());
  const mapData = parsedData.find((m) => m.name === map)!!;

  const rand1 = Math.floor(Math.random() * 5)

  // Vowel dictionary
  const getVowel = (n: number) => {
    switch(n) {
      case 0:
        return 'a';
      case 1:
        return 'e';
      case 2:
        return 'i';
      case 3:
        return 'o';
      case 4:
        return 'u';
      default:
        return 'e';
    }
  }

  const response: GeoResponse = await getRandomCities(mapData, getVowel(rand1)).then((value) => value.json())

  // Not ready
  const rand2 = Math.floor(Math.random() * response.geonames.length)
  let rand3 = Math.floor(Math.random() * response.geonames.length)

  const startCity = (await getCities(mapData, 'Dublin').then(x => x.json())).geonames[0];
  const endCity = (await getCities(mapData, 'London').then(x => x.json())).geonames[0];
  console.log(startCity)
  console.log(endCity)

  return {
    props : {
      mapData,
      startCity,
      endCity,
    }
  }
}

export default Map
