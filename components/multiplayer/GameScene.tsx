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

export const GameScene = (props: {
  isMobile: boolean;
  players: { [id: string]: Player };
  difficulty: number;
  mapData: MapData;
  server?: Socket;
}) => {
  const { isMobile, players, difficulty, mapData, server } = props;

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
  } | null>(null);

  const [tagline, setTagline] = useState('Other players loading in...');
  const [started, setStarted] = useState(false);
  const [winner, setWinner] = useState<Player>();

  const player = server && players[server.id];

  useEffect(() => {
    setSearchRadius((mapData.searchRadius * difficulty) / 8);
  }, [difficulty, mapData.searchRadius]);

  useEffect(() => {
    if (cities.start !== nullPoint) {
      setOtherCities(
        Object.fromEntries(
          Object.keys(players)
            .filter((id) => id !== server?.id)
            .map((id) => [id, [cities.start]])
        )
      );
    }
  }, [cities.start, players, server?.id]);

  useEffect(() => {
    server?.on('countdown', (value) => {
      if (value > 0) {
        setTagline(`Starting in ${value}...`);
      } else {
        setTagline(cities.start.name);
        setStarted(true);
      }
    });

    server?.on('prompt', (data) => {
      setPromptData(data);
    });

    server?.on('city', (entry) => {
      const { player: playerId, city } = entry;
      setOtherCities((others) => ({
        ...others,
        [playerId]: [...(others?.[playerId] ?? []), city],
      }));
    });

    /*
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
      */

    return () => {
      server?.off('prompt');
      server?.off('countdown');
      server?.off('city');
    };
  }, [cities.start, server]);

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
        server?.emit('city', query.city);
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
        server?.emit('city', query.city);
        server?.emit('player-won');
        setTagline('You win!');
        //setWinner(players.find((p) => p.id === server?.id));
        break;
    }
  };

  const onMapLoad = () => {
    console.log('called acknowledgement');
    server?.emit('ready');
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
        otherCities={otherCities ?? {}}
      />
      <p className={styles.tagline}>{tagline}</p>
      {!winner ? (
        started && (
          <CityInput handleEntry={handleSearch} placeholder="Enter a city" />
        )
      ) : !player?.isLeader ? (
        <h3>Waiting for leader...</h3>
      ) : true ? (
        <button onClick={onContinue}>Continue</button>
      ) : (
        <h3>Loading...</h3>
      )}
    </>
  );
};
