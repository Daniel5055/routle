import { readFileSync } from 'fs';
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import { getMapPaths } from '../../utils/functions/getMapPaths';
import { useEffect, useRef, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getCities, getRandomCities } from '../../utils/api';
import { MapData } from '../../utils/types/MapData';
import { MapDisplay } from '../../components/common/MapDisplay';
import { CityPoint } from '../../utils/types/CityPoint';
import { GeoResponse } from '../../utils/types/GeoResponse';
import {
  calculateDistance,
  convertToRelScreenCoords,
  withinRange,
} from '../../utils/functions/coords';
import { useRouter } from 'next/router';
import styles from '../../styles/Singleplayer.module.scss'
import Cookies from 'js-cookie';

const Map: NextPage = ({
  mapData,
  startCity,
  endCity,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  useEffect(() => {
    getCities(mapData, 'wake up!');
  }, [mapData]);

  // Translating difficulty
  const getDifficultyModifier = (value: number) => {
    switch(value) {
      case 1:
        return 4.0;
      case 2:
        return 2.0;
      case 3:
        return 1.0;
      case 4:
        return 0.8;
      case 5:
        return 0.6;
      default:
        return 1.0;
    }
  };

  const focusInput = useRef<HTMLInputElement>(null);
  setInterval(() => focusInput.current?.focus(), 5);
  const [hasTyped, setHasTyped] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  const [entry, setEntry] = useState('');
  const [tagline, setTagline] = useState(startCity.name);
  const [hasWon, setHasWon] = useState(false);

  const [pastPoints, setPastPoints] = useState<CityPoint[]>([]);
  const [farPoints, setFarPoints] = useState<CityPoint[]>([]);
  const [currentPoint, setCurrentPoint] = useState<CityPoint>({
    ...convertToRelScreenCoords(mapData, startCity.lat, startCity.lng),
    name: startCity.name,
  });
  const [endPoint, setEndPoint] = useState<CityPoint>({
    ...convertToRelScreenCoords(mapData, endCity.lat, endCity.lng),
    name: endCity.name,
  });

  // Multiply search radius by modifier when searchRadius is changed
  const [searchRadius, setSearchRadius] = useState<number>(
    mapData.searchRadius * getDifficultyModifier(parseInt(Cookies.get('Difficulty') ?? '1.0'))
  );


  // To organise the code better
  const handleSearch = (search: string) => {
    getCities(mapData, search)
      .then((res) => res.json())
      .then((res: GeoResponse) => res.geonames)
      .then((cities) => {
        // If no hits
        if (cities.length === 0) {
          setTagline(`${search} ???`);
          return;
        }

        // Find the closest among the cities
        let closestCity: CityPoint | undefined;
        let closestDistace = 1000000000;

        let endPointCandidate = false;
        cities
          .map((city): CityPoint => {
            // Converting to city point
            return {
              ...convertToRelScreenCoords(mapData, city.lat, city.lng),
              name: city.name,
            };
          })
          .forEach((city, i) => {
            // Skip if already current city
            if (city.x === currentPoint?.x && city.y === currentPoint?.y) {
              return;
            }

            if (city.x === endPoint?.x && city.y === endPoint?.y) {
              endPointCandidate = true;
            }

            // Comparing distances
            const distance = calculateDistance(
              city.y,
              city.x,
              currentPoint!!.y,
              currentPoint!!.x
            );

            if (distance < closestDistace) {
              closestCity = city;
              closestDistace = distance;
            }
          });

        // This means that there was one hit yet that was the current city so return nothing
        if (!!!closestCity) {
          setTagline(`Already in ${search}`);
          return;
        }

        // If entered end point city name and is close enough
        if (endPointCandidate) {
          if (
            withinRange(
              endPoint.y * svgRef.current!!.clientHeight,
              endPoint.x * svgRef.current!!.clientWidth,
              currentPoint!!.y * svgRef.current!!.clientHeight,
              currentPoint!!.x * svgRef.current!!.clientWidth,
              searchRadius
            )
          ) {
            // You win!
            // Push current city to past cities
            setPastPoints(pastPoints.concat(currentPoint!!));

            // Set new city as current city
            setCurrentPoint(endPoint!!);

            setFarPoints([]);

            setTagline('You win!');
            setHasWon(true);
            return;
          }
        }

        // Is within circle?
        if (
          withinRange(
            closestCity.y * svgRef.current!!.clientHeight,
            closestCity.x * svgRef.current!!.clientWidth,
            currentPoint!!.y * svgRef.current!!.clientHeight,
            currentPoint!!.x * svgRef.current!!.clientWidth,
            searchRadius
          )
        ) {
          // Within circle

          // Push current city to past cities
          setPastPoints(pastPoints.concat(currentPoint!!));

          // Set new city as current city
          setCurrentPoint(closestCity);

          // Clear far points
          setFarPoints([]);

          setTagline(closestCity.name);
        } else {
          // Outside of circle
          setFarPoints(farPoints.concat(closestCity));
          setTagline(`${closestCity.name} is too far!`);
        }
      });
    return;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // On enter press
    if (e.key === 'Enter') {
      if (entry.trim().length > 0) {
        handleSearch(entry.trim());
        setEntry('');
      }
    }
  };

  const router = useRouter()

  return (
    <Layout description="Singleplayer Routle">
      <h3>{`Get from ${startCity.name} to ${endCity.name}`}</h3>
      <MapDisplay
        mapData={mapData}
        svgRef={svgRef}
        setSearchRadius={setSearchRadius}
        searchRadius={searchRadius}
        endPoint={endPoint}
        currentPoint={currentPoint}
        pastPoints={pastPoints}
        farPoints={farPoints}
      />
      <p className={styles.tagline}>{tagline}</p>
      {hasWon ? (
        <>
        <h2>Number of cities: {pastPoints.length}</h2>
        <button onClick={router.reload} className={styles['play-again']}>Play again?</button>
        </>
      ) : (
        <input
          type="text"
          aria-label="input"
          autoFocus
          onKeyDown={handleKeyDown}
          value={hasTyped ? entry : 'Start typing places'}
          onChange={(e) => {
            if (!hasTyped) {
              setHasTyped(true);
              setEntry(e.target.value.slice(-1))
            } else {
              setEntry(e.target.value);
            }
          }}
          ref={focusInput}
        />
      )}
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  
  const paths = getMapPaths();
  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { map } = context.params!!;

  // Find the map data
  const data = readFileSync('public/mapList.json');
  const parsedData: MapData[] = JSON.parse(data.toString());
  const mapData = parsedData.find((m) => m.name === map)!!;

  const response: GeoResponse = await getRandomCities(mapData).then((value) =>
    value.json()
  );

  // Not ready
  const rand2 = Math.floor(Math.random() * response.geonames.length);
  let rand3 = Math.floor(Math.random() * response.geonames.length);

  const startCity = response.geonames[rand2];
  let endCity = response.geonames[rand3];

  const minDist = (mapData.latMax - mapData.latMin) / 4;
  while (
    withinRange(startCity.lat, startCity.lng, endCity.lat, endCity.lng, minDist)
  ) {
    endCity =
      response.geonames[Math.floor(Math.random() * response.geonames.length)];
  }

  return {
    props: {
      mapData,
      startCity,
      endCity,
    },
  };
};

export default Map;
