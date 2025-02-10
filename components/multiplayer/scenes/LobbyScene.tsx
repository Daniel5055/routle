import { useEffect, useMemo, useRef, useState } from 'react';
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
import Image from 'next/image';
import { PointType } from '../../../utils/types/CityPoint';
import { flattenCoords } from '../../../utils/functions/coords';
import { Slider } from '../../common/Slider';
import { rangeHoleRadius } from '../../../utils/functions/settings/holeRadius';

export const LobbyScene = (props: {
  players: { [id: string]: Player };
  settings: Settings;
  setSettings: (settings: Settings) => void;
  mapData: MapData[];
  server?: Socket;
}) => {
  const { players, settings, setSettings, mapData, server } = props;

  const player = server && players[server.id];

  const selectedMapData = useMemo(
    () => mapData.find((map) => map.webPath === settings.map)!!,
    [mapData, settings.map]
  );

  const [editMode, setEditMode] = useState(false);
  const [starting, setStarting] = useState(false);
  const [holePickMode, setHolePickMode] = useState(0);
  const [holePick, setHolePick] = useState({
    x: 0,
    y: 0,
    radius: rangeHoleRadius(selectedMapData, 1),
  });

  const mapRatio = useMemo(() => {
    const flattenedMax = flattenCoords(
      selectedMapData.latMax,
      selectedMapData.longMax
    );
    const flattenedMin = flattenCoords(
      selectedMapData.latMin,
      selectedMapData.longMin
    );

    return (
      -(flattenedMax.lng - flattenedMin.lng) /
      (flattenedMax.lat - flattenedMin.lat)
    );
  }, [
    selectedMapData.latMax,
    selectedMapData.latMin,
    selectedMapData.longMax,
    selectedMapData.longMin,
  ]);

  const holePickRadius = useRef(100);

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

  const height = 60;

  return (
    <>
      <div
        style={{ width: `${mapRatio * height}vh`, height: `${height}vh` }}
        className={
          holePickMode
            ? styles['map-container']
            : styles['map-container-blurred']
        }
        onMouseMove={(e) => {
          if (holePickMode === 2) {
            return;
          }
          const { x, y, width, height } =
            e.currentTarget.getBoundingClientRect();
          const pos = {
            x: (e.clientX - x) / width,
            y: (e.clientY - y) / height,
          };
          setHolePick({ ...holePick, ...pos });
        }}
        onClick={() => {
          setHolePickMode(2);
        }}
      >
        <Image
          src={mapData.find((map) => map.webPath === settings.map)!.imagePath}
          alt="Map"
          layout="fill"
          objectFit="contain"
        />
        <svg
          width="100%"
          height="100%"
          className={styles['map-container-child']}
        >
          {settings.holeDefs.map((h, i) => (
            <circle
              key={i + '_hole'}
              cx={`${h.x * 100}%`}
              cy={`${h.y * 100}%`}
              r={`${h.radius * height}vh`}
              fill={PointType.hole}
              className={styles.hole}
            />
          ))}
          {holePickMode ? (
            <circle
              key={'-1_hole'}
              cx={`${holePick.x * 100}%`}
              cy={`${holePick.y * 100}%`}
              r={`${height * holePick.radius}vh`}
              fill={PointType.holePick}
              strokeWidth={holePickMode === 2 ? 1 : 0}
              stroke={PointType.hole}
              className={styles.hole}
            />
          ) : null}
        </svg>
      </div>
      {holePickMode ? (
        <>
          <Slider
            min={1}
            max={200}
            initialValue={holePickRadius.current}
            initialText={'1'}
            onValueChange={(v) => {
              const val = v <= 100 ? v / 100 : v / 10 - 9;
              setHolePick({
                ...holePick,
                radius: rangeHoleRadius(selectedMapData, val),
              });
              return val.toFixed(2);
            }}
          ></Slider>
          <div className={styles['hole-pick-container']}>
            {holePickMode === 2 ? (
              <>
                <button
                  onClick={() => {
                    setHolePickMode(0);
                    setSettings({
                      ...settings,
                      holes: settings.holes + 1,
                      holeDefs: settings.holeDefs.concat([holePick]),
                    });
                  }}
                >
                  Confirm
                </button>
                <button onClick={() => setHolePickMode(1)}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setHolePickMode(0)}>Back</button>
            )}
          </div>
        </>
      ) : (
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
                      <p className={styles['lobby-player-name']}>
                        {player.name}
                      </p>
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
                {mapData.find((map) => map.webPath === settings.map)?.name ??
                  '???'}
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
            <h3>Holes</h3>
            {player?.isLeader ? (
              <>
                {settings.holeDefs.map((h, i) => (
                  <p key={i}>
                    ({h.x.toFixed(2)}, {h.y.toFixed(2)}), r:{' '}
                    {h.radius.toFixed(2)}
                  </p>
                ))}
                <button onClick={(e) => setHolePickMode(1)}>Add hole</button>
              </>
            ) : settings.holes === 0 ? (
              <p>None</p>
            ) : (
              settings.holeDefs.map((h, i) => (
                <p key={i}>
                  ({h.x.toFixed(2)}, {h.y.toFixed(2)}), r: {h.radius.toFixed(2)}
                </p>
              ))
            )}
            <hr />
          </div>
          <div id={styles['start-button']}>
            {starting ? (
              <h3 className={styles['container']}>Starting...</h3>
            ) : player?.isLeader ? (
              <button className={styles['container']} onClick={startGame}>
                <h3>Start</h3>
              </button>
            ) : (
              <h3 className={styles['container']}>Waiting for Leader...</h3>
            )}
          </div>
        </div>
      )}
    </>
  );
};
