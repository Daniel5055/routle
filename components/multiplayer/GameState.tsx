import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { CityResponse } from '../../utils/types/GeoResponse';
import { MapData } from '../../utils/types/MapData';
import { Player } from '../../utils/types/multiplayer/Player';
import { useCities } from '../hooks/CityHook';
import styles from '../../styles/Singleplayer.module.scss';
import { MapDisplay } from '../map/MapDisplay';
import { CityInput } from '../map/CityInput';
import { areNamesEqual, formatName } from '../../utils/functions/cityNames';

export const GameState = (props: {
  isMobile: boolean;
  gameState: 'reveal' | 'game';
  players: Player[];
  difficulty: number;
  mapData: MapData;
  server?: Socket;
}) => {
  const { isMobile, gameState, players, difficulty, mapData, server } = props;

  const [searchRadius, setSearchRadius] = useState<number | undefined>();
  const [promptData, setPromptData] = useState<{
    cities: CityResponse[];
    start: number;
    end: number;
  }>();

  // Initialising your own cities
  let { cities, queryCity } = useCities(
    mapData,
    promptData?.cities ?? [],
    searchRadius,
    promptData?.start,
    promptData?.end
  );

  // Ensure 'this' is retained and correct
  queryCity = queryCity.bind({ cities });

  const [otherCities, setOtherCities] = useState();
  const [tagline, setTagline] = useState(cities.current.name);
  const [countDown, setCountDown] = useState<number>(3);

  useEffect(() => {
    setSearchRadius((mapData.searchRadius * difficulty) / 8);
  }, [difficulty, mapData.searchRadius]);

  useEffect(() => {
    if (gameState === 'game') {
      // On change to game state, trigger a count down and then start
      setCountDown(3);

      // My lazy solution instead of setInterval and some more state
      setTimeout(() => setCountDown(2), 1000);
      setTimeout(() => setCountDown(1), 2000);
      setTimeout(() => setCountDown(0), 3000);
    }
  }, [gameState]);

  useEffect(() => {
    setTagline(cities.start.name);
  }, [cities.start.name]);

  useEffect(() => {
    server?.on('prompt-cities', (msg) => {
      const data = JSON.parse(msg);
      setPromptData(data);
      console.log(data);
    });
  }, [server]);

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
        break;
    }
  };

  const onMapLoad = () => {
    server?.emit('state-ack', 'reveal');
  };

  return (
    <>
      <h3
        className={styles[isMobile ? 'prompt-small' : 'prompt']}
      >{`Get from ${cities.start.name} to ${cities.end.name}`}</h3>
      <MapDisplay
        mapData={mapData}
        searchRadiusMultiplier={searchRadius}
        cities={cities}
        isMobile={isMobile}
        onMapLoad={onMapLoad}
      />
      {gameState === 'game' ? (
        countDown === 0 ? (
          <>
            <p className={styles.tagline}>{tagline}</p>
            <CityInput handleEntry={handleSearch} placeholder="Enter a city" />
          </>
        ) : (
          <p className={styles.tagline}>
            <b>Starting in {countDown}</b>
          </p>
        )
      ) : (
        <p className={styles.tagline}>Other players loading in...</p>
      )}
    </>
  );
};
