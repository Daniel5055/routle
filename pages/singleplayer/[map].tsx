import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import { getMapPaths } from '../../utils/functions/getMapPaths';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getRandomCities } from '../../utils/api/cities';
import { MapData } from '../../utils/types/MapData';
import { MapDisplay } from '../../components/map/MapDisplay';
import { useRouter } from 'next/router';
import styles from '../../styles/Singleplayer.module.scss';
import { useCities } from '../../components/hooks/CityHook';
import { areNamesEqual, formatName } from '../../utils/functions/cityNames';
import { readFile } from 'fs/promises';
import { CityInput } from '../../components/map/CityInput';
import { useMobile } from '../../components/hooks/MobileHook';
import {
  addCityEntered,
  addMapFinished,
  addMapPlay,
} from '../../utils/api/database';
import difficulty, {
  difficultyMultiplier,
} from '../../utils/functions/settings/difficulty';
import holeRadius, {
  holeRadiusMultiplier,
} from '../../utils/functions/settings/holeRadius';

const Map: NextPage = ({
  mapData,
  map100Cities,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const isMobile = useMobile();
  const router = useRouter();

  const [searchRadius, setSearchRadius] = useState<number | undefined>(
    undefined
  );
  const [holeRadiusValue, setHoleRadiusValue] = useState<number | undefined>(
    undefined
  );

  const city1 = parseInt(router.query.c1 as string);
  const city2 = parseInt(router.query.c2 as string);

  // Extract variable number of hole params
  const holeParams: [number, number][] = useMemo(
    () =>
      Array.from(Array(5).keys())
        .map((i) => {
          let q = router.query[`h${i}`];
          if (!Array.isArray(q)) {
            q = q?.split(',');

            if (q === undefined) {
              return [NaN, NaN];
            }
          }
          return q.map((arg) => parseFloat(arg));
        })
        .filter((q) => q.length == 2 && q.every((arg) => !isNaN(arg))) as [
        number,
        number
      ][],
    [router.query]
  );

  let { cities, queryCity } = useCities(
    mapData,
    map100Cities,
    searchRadius,
    holeRadiusValue,
    isNaN(city1) ? undefined : city1,
    isNaN(city2) ? undefined : city2,
    holeParams
  );

  // Ensure 'this' is retained and correct
  queryCity = queryCity.bind({ cities });

  // Other state
  const [tagline, setTagline] = useState(cities.current.name);
  const [hasWon, setHasWon] = useState(false);

  // On page load
  useEffect(() => {
    addMapPlay(mapData.webPath);
    setSearchRadius(
      (mapData.searchRadius * difficultyMultiplier(difficulty.getValue())) / 8
    );
    setHoleRadiusValue(
      (mapData.searchRadius * holeRadiusMultiplier(holeRadius.getValue())) / 8
    );
  }, [mapData.searchRadius, mapData.webPath]);

  useEffect(() => {
    setTagline(cities.start.name);
  }, [cities.start.name]);

  // Pushing search to city hook and modifying ui based on result
  const handleSearch = async (search: string) => {
    function format(name: string, search: string) {
      if (areNamesEqual(name, search)) {
        return name;
      } else {
        return `${name} (${formatName(search)})`;
      }
    }

    // Whilst waiting for query result, specify that city is being searched for
    setTagline(`Searching for ${search}...`);

    const query = await queryCity(search);

    // Handling the ui changes from entering city
    switch (query.result) {
      case 'In':
        addCityEntered(mapData.webPath, cities.current.id);
        setTagline(format(query.city!.name, search));
        break;
      case 'Out':
        setTagline(`${format(query.city!.name, search)} is too far!`);
        break;
      case 'Same':
        setTagline(`Already in ${format(query.city!.name, search)}`);
        break;
      case 'None':
        setTagline(`${search} ???`);
        break;
      case 'Win':
        setTagline('You win!');
        setHasWon(true);
        break;
      case 'Hole':
        setTagline(`${query.city!.name} is inaccessible`);
        break;
    }
  };

  const loadNewGame = router.reload;

  // On game won
  useEffect(() => {
    if (hasWon) {
      // Define enter key handler
      const enterHotKey = (e: KeyboardEvent) => {
        if (e.code === 'Enter') {
          loadNewGame();
        }
      };
      addEventListener('keydown', enterHotKey);

      // Logging stats
      addMapFinished(mapData.webPath);

      // Ensure is key handler removed on demount
      return () => {
        removeEventListener('keydown', enterHotKey);
      };
    }
  }, [loadNewGame, hasWon, mapData.webPath]);

  return (
    <Layout description="Singleplayer Routle" isMobile={isMobile}>
      <h3
        className={styles[isMobile ? 'prompt-small' : 'prompt']}
      >{`Get from ${cities.start.name} to ${cities.end.name}`}</h3>
      <MapDisplay
        mapData={mapData}
        searchRadiusMultiplier={searchRadius}
        holeRadiusMultiplier={holeRadiusValue}
        cities={cities}
        isMobile={isMobile}
      />
      <p className={styles.tagline}>{tagline}</p>
      {hasWon ? (
        <>
          <h2>Number of cities: {cities.past.length}</h2>
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
