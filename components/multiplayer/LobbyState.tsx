import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { difficulties } from '../../pages/multiplayer/[game]';
import styles from '../../styles/Multiplayer.module.scss';
import { MapData } from '../../utils/types/MapData';
import { Player } from '../../utils/types/multiplayer/Player';
import { Settings } from '../../utils/types/multiplayer/Settings';

export const LobbyState = (props: {
  players: Player[];
  settings: Settings;
  setSettings: (settings: Settings) => void;
  mapData: MapData[];
  server?: Socket;
}) => {
  const { players, settings, setSettings, mapData, server } = props;

  const player = players.find((player) => player.you);

  const [isLeader, setIsLeader] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    server?.emit('state-ack', 'lobby');
    server?.on('new-leader', (id) => {
      setIsLeader(server.id === id);
    });
    server?.on('state', (state) => {
      if (state === 'starting') {
        setStarting(true);
      }
    });
  }, [server]);

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

  function startGame() {
    server?.emit('start-game');
  }

  return (
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
          <p>
            {mapData.find((map) => map.webPath === settings.map)?.name ?? '???'}
          </p>
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
            {difficulties.map((difficulty) => (
              <option
                key={difficulty.value}
                value={difficulty.value}
                selected={difficulty.value === settings.difficulty}
              >
                {difficulty.name}
              </option>
            ))}
          </select>
        ) : (
          <p>
            {difficulties.find((d) => d.value === settings.difficulty)?.name ??
              '???'}
          </p>
        )}
        <hr />
      </div>
      {starting ? (
        <h3>Starting...</h3>
      ) : isLeader ? (
        <button onClick={startGame}>
          <h3>Start</h3>
        </button>
      ) : (
        <h3>Waiting for Leader...</h3>
      )}
    </div>
  );
};
