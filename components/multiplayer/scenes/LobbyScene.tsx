import { map } from 'cypress/types/bluebird';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import styles from '../../../styles/Multiplayer.module.scss';
import { MapData } from '../../../utils/types/MapData';
import { Player } from '../../../utils/types/multiplayer/Player';
import Settings from '../../../utils/types/multiplayer/Settings';
import { difficultyName } from '../../../utils/functions/settings/difficulty';
import {
  cityPriorities,
  CityPriority,
} from '../../../utils/functions/settings/priority';

export const LobbyScene = (props: {
  players: { [id: string]: Player };
  settings: Settings;
  setSettings: (settings: Settings) => void;
  mapData: MapData[];
  server?: Socket;
}) => {
  const { players, settings, setSettings, mapData, server } = props;

  const player = server && players[server.id];

  const [editMode, setEditMode] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    server?.on('start', () => setStarting(true));

    return () => {
      server?.off('start');
    };
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
    if (name.trim() !== '') {
      server?.emit('update', { player: { name } });
      player && (player.name = name);
    }
    setEditMode(false);
  }

  function onEdit() {
    setEditMode(true);
  }

  function startGame() {
    server?.emit('start');
    setStarting(true);
  }

  function changeColor() {
    server?.emit('color');
  }

  return (
    <div id={styles['start-container']}>
      <div id={styles['players']} className={styles['container']}>
        <h2>Players</h2>
        <div id={styles['player-list']}>
          {Object.entries(players).map(([id, player]) => (
            <div className={styles['player']} key={id}>
              {id === server?.id ? (
                <>
                  <button
                    onClick={changeColor}
                    className={styles['lobby-player-color']}
                    style={{ backgroundColor: player.color }}
                  />
                  {editMode ? (
                    // @ts-ignore
                    <input
                      className={styles['lobby-player-input']}
                      type="text"
                      onKeyUp={onKeyUp}
                      onBlur={onBlur}
                      autoFocus
                    />
                  ) : (
                    <>
                      <p className={styles['lobby-player-name']}>
                        <b>{player.name}</b>
                      </p>
                      <button
                        onClick={onEdit}
                        className={styles['lobby-player-edit']}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span
                    className={styles['lobby-player-color']}
                    style={{ backgroundColor: player.color }}
                  />
                  <p className={styles['lobby-player-name']}>{player.name}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div id={styles['settings']} className={styles['container']}>
        <h2>Game Settings</h2>
        <hr />
        <h3>Game Map</h3>
        {player?.isLeader && !starting ? (
          <select
            name="map"
            onChange={(e) => {
              const newSettings = { ...settings, map: e.target.value };
              setSettings(newSettings);
              server?.emit('update', { settings: newSettings });
            }}
            required
            value={settings.map}
          >
            {mapData
              .sort((a: MapData, b: MapData) => {
                return a.name.localeCompare(b.name);
              })
              .map((map: MapData) => (
                <option key={map.webPath} value={map.webPath}>
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
        {player?.isLeader && !starting ? (
          <select
            name="difficulty"
            onChange={(e) => {
              const newSettings = {
                ...settings,
                difficulty: parseInt(e.target.value),
              };
              setSettings(newSettings);
            }}
            required
            value={settings.difficulty}
          >
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>
                {difficultyName(d)}
              </option>
            ))}
          </select>
        ) : (
          <p>{difficultyName(settings.difficulty)}</p>
        )}
        <hr />
        <h3>Priority</h3>
        {player?.isLeader && !starting ? (
          <select
            value={settings.priority}
            onChange={(e) => {
              const newSettings = {
                ...settings,
                priority: e.target.value as CityPriority,
              };
              setSettings(newSettings);
            }}
          >
            {cityPriorities.map((p) => (
              <option
                value={p}
                key={p}
                title={
                  p === 'Hybrid'
                    ? 'Pick the largest city within range, and the closest out of range'
                    : p === 'Proximity'
                    ? 'Pick the closest city always'
                    : p === 'Population'
                    ? 'Pick the largest city always'
                    : ''
                }
              >
                {p}
              </option>
            ))}
          </select>
        ) : (
          <p>{settings.priority}</p>
        )}
        <hr />
      </div>
      {starting ? (
        <h3>Starting...</h3>
      ) : player?.isLeader ? (
        <button onClick={startGame}>
          <h3>Start</h3>
        </button>
      ) : (
        <h3>Waiting for Leader...</h3>
      )}
    </div>
  );
};
