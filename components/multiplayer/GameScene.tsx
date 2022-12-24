import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { CityResponse } from '../../utils/types/GeoResponse';
import { MapData } from '../../utils/types/MapData';
import { Player } from '../../utils/types/multiplayer/Player';
import { useCities } from '../hooks/CityHook';
import singleplayerStyles from '../../styles/Singleplayer.module.scss';
import multiplayerStyles from '../../styles/Multiplayer.module.scss';
import { MapDisplay } from '../map/MapDisplay';
import { CityInput } from '../map/CityInput';
import { areNamesEqual, formatName } from '../../utils/functions/cityNames';
import { CityPoint, nullPoint } from '../../utils/types/CityPoint';
import { CgSandClock, CgSmile, CgTrophy } from 'react-icons/cg';

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
  }>({});

  const [tagline, setTagline] = useState('Other players loading in...');
  const [started, setStarted] = useState(false);

  const player = server && players[server.id];

  useEffect(() => {
    setSearchRadius((mapData.searchRadius * difficulty) / 8);
  }, [difficulty, mapData.searchRadius]);

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
      setOtherCities((others) => {
        if (others[playerId]?.at(-1)?.id === city.id) {
          return others;
        } else {
          return {
            ...others,
            [playerId]: [...(others[playerId] ?? [cities.start]), city],
          };
        }
      });
    });

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
        server?.emit('win');
        setTagline('You Finished!');
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
    <div id={multiplayerStyles['multiplayer-view']}>
      <div
        id={multiplayerStyles['multiplayer-left']}
        className={multiplayerStyles['container']}
      >
        <h2>Players</h2>
        <div id={multiplayerStyles['player-list']}>
          {Object.entries(players).map(([id, player]) => (
            <div className={multiplayerStyles['game-player']} key={id}>
              <span className={multiplayerStyles['player-state']}>
                {player.state === 'loading' ? (
                  <CgSandClock />
                ) : player.state === 'won' ? (
                  <CgTrophy />
                ) : (
                  <CgSmile />
                )}
              </span>
              <p className={multiplayerStyles['player-name']}>{player.name}</p>
              <span
                className={multiplayerStyles['player-color']}
                style={{ backgroundColor: player.color }}
              />
            </div>
          ))}
        </div>
      </div>
      <div id={multiplayerStyles['multiplayer-center']}>
        <h3
          className={singleplayerStyles[isMobile ? 'prompt-small' : 'prompt']}
        >{`Get from ${cities.start.name} to ${cities.end.name}`}</h3>
        <MapDisplay
          mapData={mapData}
          searchRadiusMultiplier={searchRadius}
          cities={cities}
          isMobile={isMobile}
          onMapLoad={onMapLoad}
          otherCities={otherCities}
          playerColors={Object.fromEntries(
            Object.entries(players).map(([id, player]) => [
              id === server?.id ? 'me' : id,
              player.color,
            ])
          )}
        />
        <p className={singleplayerStyles.tagline}>{tagline}</p>
        {player?.state === 'winner' ? (
          player?.isLeader ? (
            <button onClick={onContinue}>Continue</button>
          ) : (
            <h3>Waiting for leader...</h3>
          )
        ) : (
          started && (
            <CityInput handleEntry={handleSearch} placeholder="Enter a city" />
          )
        )}
      </div>
    </div>
  );
};
