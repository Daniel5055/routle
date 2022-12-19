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
import { CityPoint, nullPoint } from '../../utils/types/CityPoint';
import { calculateDistance } from '../../utils/functions/coords';

export const GameState = (props: {
  isMobile: boolean;
  gameState: 'reveal' | 'game' | 'won';
  isLeader: boolean;
  players: { [id: string]: Player };
  difficulty: number;
  mapData: MapData;
  server?: Socket;
}) => {
  const {
    isMobile,
    gameState,
    isLeader,
    players,
    difficulty,
    mapData,
    server,
  } = props;

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

  const [otherCities, setOtherCities] = useState<{
    [player: string]: CityPoint[];
  }>({});
  const [tagline, setTagline] = useState('Other players loading in...');
  const [started, setStarted] = useState(false);
  const [winner, setWinner] = useState<Player>();
  const [seeResults, setSeeResults] = useState(false);

  useEffect(() => {
    setSearchRadius((mapData.searchRadius * difficulty) / 8);
  }, [difficulty, mapData.searchRadius]);

  useEffect(() => {
    if (gameState === 'game' && cities.start !== nullPoint) {
      // On change to game state, trigger a count down and then start
      setTagline('Starting in 3');

      // My lazy solution instead of setInterval and some more state
      setTimeout(() => setTagline('Starting in 2'), 1000);
      setTimeout(() => setTagline('Starting in 1'), 2000);
      setTimeout(() => {
        setTagline(cities.start.name);
        setStarted(true);
      }, 3000);
    }
  }, [cities.start, gameState]);

  useEffect(() => {
    if (Object.values(otherCities).length === 0 && cities.start !== nullPoint) {
      setOtherCities(
        Object.fromEntries(
          players
            .filter((player) => player.id !== server?.id)
            .map((player) => [player.id, [cities.start]])
        )
      );
    }
  }, [cities.start, otherCities, players, server?.id]);

  useEffect(() => {
    // other cities is the only volatile dependency, and this is expected to run once.
    if (Object.values(otherCities).length === 0) {
      server?.on('prompt-cities', (msg) => {
        const data = JSON.parse(msg);
        setPromptData(data);
        console.log(data);
      });
      server?.on('city-entered', (msg) => {
        const { player: playerId, city } = JSON.parse(msg);
        const playerCities = otherCities[playerId] ?? [];
        const newPlayerCities = [...playerCities, city];
        setOtherCities({ ...otherCities, [playerId]: newPlayerCities });
      });
      server?.on('player-won', (playerId) => {
        const winningPlayer = players.find((p) => p.id === playerId);
        setWinner(winningPlayer);
        setTagline(`${winningPlayer?.name} won!`);

        // Tell everyone how close you got
        const distance = calculateDistance(
          cities.current.x,
          cities.current.y,
          cities.end.x,
          cities.end.y
        );
        players.find((p) => p.id === server.id)!.distance = distance;
        server?.emit('final-distance', distance);
      });
      server?.on('final-distance', (msg) => {
        const { distance, player } = JSON.parse(msg);
        players.find((p) => p.id === player)!.distance = +distance;

        if (players.every((p) => p.distance != undefined)) {
          server?.emit('state-ack', 'won');
        }
      });
    }

    return () => {
      server?.off('prompt-cities');
      server?.off('city-entered');
      server?.off('player-won');
    };
  }, [cities, otherCities, players, server]);

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
        server?.emit('city-entered', JSON.stringify(query.city));
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
        server?.emit('city-entered', JSON.stringify(query.city));
        server?.emit('player-won');
        setTagline('You win!');
        setWinner(players.find((p) => p.id === server?.id));
        break;
    }
  };

  const onMapLoad = () => {
    console.log('called acknowledgement');
    server?.emit('state-ack', 'reveal');
  };

  const onContinue = () => {
    server?.emit('see-results');
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
        otherCities={otherCities}
      />
      <p className={styles.tagline}>{tagline}</p>
      {!winner ? (
        started && (
          <CityInput handleEntry={handleSearch} placeholder="Enter a city" />
        )
      ) : !isLeader ? (
        <h3>Waiting for leader...</h3>
      ) : seeResults ? (
        <button onClick={onContinue}>Continue</button>
      ) : (
        <h3>Loading...</h3>
      )}
    </>
  );
};
