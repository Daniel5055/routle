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
import { CityPoint } from '../../utils/types/CityPoint';
import { CgSandClock, CgSmile, CgSmileSad, CgTrophy } from 'react-icons/cg';
import { getCities } from '../../utils/api/cities';
import { Timer } from './Timer';

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
  const [ended, setEnded] = useState(false);
  const player = server && players[server.id];
  const someWinner = Object.values(players).some(
    (player) => player.state === 'won'
  );

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

    server?.on('end', () => {
      setEnded(true);
    });

    return () => {
      server?.off('prompt');
      server?.off('countdown');
      server?.off('city');
      server?.off('end');
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

  const onMapLoad = async () => {
    // Preliminary city fetch
    await getCities(mapData, 'zzzzzz');
    console.log('called acknowledgement');
    server?.emit('ready');
  };

  const onContinue = () => {
    server?.emit('continue');
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
                  // FIXME: Quite inefficient
                  ((place) =>
                    place === 0 ? <CgTrophy /> : <b>{place + 1}</b>)(
                    Object.entries(players)
                      .filter(([id, p]) => p.result !== null)
                      .sort((a, b) => a[1].result - b[1].result)
                      .findIndex(([pid, p]) => pid === id)
                  )
                ) : ended ? (
                  <CgSmileSad />
                ) : (
                  <CgSmile />
                )}
              </span>
              <p className={multiplayerStyles['player-name']}>
                {id === server?.id ? <b>{player.name}</b> : player.name}
              </p>
              <span
                className={multiplayerStyles['player-color']}
                style={{ backgroundColor: player.color }}
              />
            </div>
          ))}
        </div>
      </div>
      <div
        id={multiplayerStyles['multiplayer-right']}
        className={multiplayerStyles['container']}
      >
        <Timer
          state={
            started
              ? someWinner
                ? ended
                  ? 'done'
                  : 'countdown'
                : 'start'
              : 'idle'
          }
        />
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
        {ended ? (
          player?.isLeader ? (
            <div>
              <button onClick={onContinue}>
                <h3>Continue</h3>
              </button>
            </div>
          ) : (
            <h3>Waiting for leader...</h3>
          )
        ) : player?.state === 'won' ? (
          <h3>Waiting for others...</h3>
        ) : (
          started && (
            <CityInput handleEntry={handleSearch} placeholder="Enter a city" />
          )
        )}
      </div>
    </div>
  );
};
