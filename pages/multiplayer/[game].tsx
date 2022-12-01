import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Layout from '../../components/common/Layout';
import { useMobile } from '../../components/hooks/MobileHook';
import styles from '../../styles/Multiplayer.module.scss';
import { MapData } from '../../utils/types/MapData';
import { Player } from '../../utils/types/multiplayer/Player';
import { Settings } from '../../utils/types/multiplayer/Settings';

const Game: NextPage = () => {
  const isMobile = useMobile();
  const router = useRouter();

  const url = 'http://localhost:23177';

  const { game: gameId } = router.query;

  const [isValid, setIsValid] = useState(true);
  const [isLeader, setIsLeader] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [server, setServer] = useState<Socket>();

  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<Settings>({
    map: 'Europe',
    difficulty: 'Normal',
  });
  const [mapData, setMapData] = useState<MapData[]>([]);

  const player = players.find((player) => player.you);

  useEffect(() => {
    fetch('/mapList.json')
      .then((res) => res.json())
      .then((data) => setMapData(data));
  }, []);

  useEffect(() => {
    const server = io(url);
    gameId && server.emit('join-game', gameId);
    server.on('new-leader', (id) => {
      setIsLeader(server.id === id);
    });

    server.on('players', (msg) => {
      const parsedPlayers = (JSON.parse(msg) as Player[]).map((player, i) => {
        player.you = player.id === server.id;
        player.leader = i === 0;

        return player;
      });
      setPlayers(parsedPlayers);
    });

    server.on('settings', (msg) => {
      const parsedSettings: Settings = JSON.parse(msg);
      setSettings(parsedSettings);
    });

    server.on('not-found', () => {
      setIsValid(false);
    });

    setServer(server);
  }, [gameId]);

  function onKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      // @ts-ignore
      changeName(e.target?.value ?? player?.name);
    }
  }

  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    changeName(e.target?.value ?? player?.name);
  }

  function changeName(name: string) {
    server?.emit('change-name', name);
    player && (player.name = name);
    setEditMode(false);
  }

  function onEdit() {
    setEditMode(true);
  }

  return (
    <Layout isMobile={isMobile}>
      {isValid ? (
        <div id={styles['start-container']}>
          <div id={styles['players']} className={styles['container']}>
            <h2>Players</h2>
            <div id={styles['player-list']}>
              {players.map((player) => (
                <div className={styles['player']} key={player.id}>
                  {player.you ? (
                    editMode ? (
                      // @ts-ignore
                      <input
                        type="text"
                        onKeyUp={onKeyUp}
                        onBlur={onBlur}
                        autoFocus
                      />
                    ) : (
                      <>
                        <b>
                          <p>{player.name}</p>
                        </b>
                        <button onClick={onEdit}>Edit</button>
                      </>
                    )
                  ) : (
                    <p>{player.name}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div id={styles['settings']} className={styles['container']}>
            <h2>Game Settings</h2>
            <hr />
            <h3>Game Map</h3>
            {isLeader ? (
              <select
                name="map"
                onChange={(e) => {
                  const newSettings = { ...settings, map: e.target.value };
                  setSettings(newSettings);
                  server?.emit('change-settings', JSON.stringify(newSettings));
                }}
                required
                defaultValue={settings.map}
              >
                {mapData
                  .sort((a: MapData, b: MapData) => {
                    return a.name.localeCompare(b.name);
                  })
                  .map((map: MapData) => (
                    <option
                      key={map.webPath}
                      value={map.webPath}
                      selected={map.webPath === settings.map}
                    >
                      {map.name}
                    </option>
                  ))}
              </select>
            ) : (
              <p>{settings.map}</p>
            )}
            <hr />
            <h3>Difficulty</h3>
            {isLeader ? (
              <select
                name="difficulty"
                onChange={(e) => {
                  const newSettings = {
                    ...settings,
                    difficulty: e.target.value,
                  };
                  setSettings(newSettings);
                  server?.emit('change-settings', JSON.stringify(newSettings));
                }}
                required
              >
                <option value="easy" selected={'easy' === settings.difficulty}>
                  Easy
                </option>
                <option
                  value="normal"
                  selected={'normal' === settings.difficulty}
                >
                  Normal
                </option>
                <option value="hard" selected={'hard' === settings.difficulty}>
                  Hard
                </option>
              </select>
            ) : (
              <p>{settings.difficulty}</p>
            )}
            <hr />
          </div>
        </div>
      ) : (
        <h2>Game not found</h2>
      )}
    </Layout>
  );
};

export default Game;
