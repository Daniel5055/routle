import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import { getMapPaths } from '../../utils/functions/getMapPaths';
import { useEffect, useRef, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getCities, getRandomCities } from '../../utils/api/cities';
import { MapData } from '../../utils/types/MapData';
import { MapDisplay } from '../../components/common/MapDisplay';
import { CityPoint } from '../../utils/types/CityPoint';
import {
  calculateDistance,
  convertToRelScreenCoords,
  withinRange,
} from '../../utils/functions/coords';
import { useRouter } from 'next/router';
import styles from '../../styles/Singleplayer.module.scss';
import { useCities } from '../../components/common/CityHook';
import { areNamesEqual, formatName } from '../../utils/functions/cityNames';
import { readFile } from 'fs/promises';
import { fetchDifficulty } from '../../utils/functions/difficulty';
import { CityInput } from '../../components/common/CityInput';
import { useMobile } from '../../components/common/MobileHook';
import { addMapFinished, addMapPlay } from '../../utils/api/database';

const Map: NextPage = ({
  mapData,
  map100Cities,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const isMobile = useMobile();
  const router = useRouter();

  const city1 = parseInt(router.query.c1 as string);
  const city2 = parseInt(router.query.c2 as string);

  const { startPoint, endPoint } = useCities(
    mapData,
    map100Cities,
    isNaN(city1) ? undefined : city1,
    isNaN(city2) ? undefined : city2
  );
  const [pastPoints, setPastPoints] = useState<CityPoint[]>([]);
  const [farPoints, setFarPoints] = useState<CityPoint[]>([]);
  const [currentPoint, setCurrentPoint] = useState<CityPoint>(startPoint);

  useEffect(() => {
    setCurrentPoint(startPoint);
    setTagline(startPoint.name);
  }, [startPoint]);

  // Other state
  const [tagline, setTagline] = useState(startPoint.name);
  const [hasWon, setHasWon] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  // Multiply search radius by modifier when searchRadius is changed
  const [searchRadius, setSearchRadius] = useState<number>(
    mapData.searchRadius * fetchDifficulty(true)
  );

  useEffect(() => {
    addMapPlay(mapData.webPath);
  }, [])

  // To organise the code better
  const handleSearch = (search: string) => {
    getCities(mapData, search).then((cities) => {
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
            searchRadius * svgRef.current!!.clientHeight
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
          searchRadius * svgRef.current!!.clientHeight
        )
      ) {
        // Within circle

        // Push current city to past cities
        setPastPoints(pastPoints.concat(currentPoint!!));

        // Set new city as current city
        setCurrentPoint(closestCity);

        // Clear far points
        setFarPoints([]);

        if (areNamesEqual(closestCity.name, search)) {
          setTagline(closestCity.name);
        } else {
          setTagline(`${closestCity.name} (${formatName(search)})`);
        }
      } else {
        // Outside of circle
        setFarPoints(farPoints.concat(closestCity));
        if (areNamesEqual(closestCity.name, search)) {
          setTagline(`${closestCity.name} is too far!`);
        } else {
          setTagline(`${closestCity.name} (${formatName(search)}) is too far!`);
        }
      }
    });
    return;
  };

  const loadNewGame = router.reload;

  // Enter shortcut for new game
  useEffect(() => {
    if (hasWon) {
      addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
          loadNewGame();
        }
      });

      addMapFinished(mapData.webPath)
    }
  }, [loadNewGame, hasWon]);

  return (
    <Layout description="Singleplayer Routle" isMobile={isMobile}>
      <h3
        className={styles[isMobile ? 'prompt-small' : 'prompt']}
      >{`Get from ${startPoint.name} to ${endPoint.name}`}</h3>
      <MapDisplay
        mapData={mapData}
        svgRef={svgRef}
        setSearchRadius={setSearchRadius}
        searchRadius={searchRadius}
        endPoint={endPoint}
        currentPoint={currentPoint}
        pastPoints={pastPoints}
        farPoints={farPoints}
        isMobile={isMobile}
      />
      <p className={styles.tagline}>{tagline}</p>
      {hasWon ? (
        <>
          <h2>Number of cities: {pastPoints.length}</h2>
          <button onClick={loadNewGame} className={styles['play-again']}>
            Play again?
          </button>
        </>
      ) : (
        <CityInput handleEntry={handleSearch} placeholder="Enter a city" />
      )}
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getMapPaths();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { map } = context.params!!;

  // Find the map data
  const data = await readFile('public/mapList.json');
  const parsedData: MapData[] = JSON.parse(data.toString());
  const mapData = parsedData.find((m) => m.webPath === map)!!;

  // Get a list of the top 100 cities by pop
  const map100Cities = await getRandomCities(mapData);

  return {
    props: {
      mapData,
      map100Cities,
    },
  };
};

export default Map;
