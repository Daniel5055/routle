import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Layout from '../../components/common/Layout';
import { useMobile } from '../../components/hooks/MobileHook';
import { GameState } from '../../components/multiplayer/GameState';
import { LobbyState } from '../../components/multiplayer/LobbyState';
import { MapData } from '../../utils/types/MapData';
import { Player } from '../../utils/types/multiplayer/Player';
import { Settings } from '../../utils/types/multiplayer/Settings';

type GameState =
  | 'invalid'
  | 'loading'
  | 'lobby'
  | 'starting'
  | 'reveal'
  | 'game';

// TODO: Move to separate file and integrate with current difficulty system
export const difficulties = [
  {
    value: 'easiest',
    multiplier: 4.0,
    name: 'Baby Mode',
  },
  {
    value: 'easy',
    multiplier: 2.0,
    name: 'Easy',
  },
  {
    value: 'normal',
    multiplier: 1.0,
    name: 'Normal',
  },
  {
    value: 'hard',
    multiplier: 0.8,
    name: 'Hard',
  },
  {
    value: 'hardest',
    multiplier: 0.6,
    name: 'Fredrik Mode',
  },
];

const Game: NextPage = () => {
  const isMobile = useMobile();
  const router = useRouter();

  const url = 'http://localhost:23177';

  const { game: gameId } = router.query;

  const [server, setServer] = useState<Socket>();

  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<Settings>({
    map: 'Europe',
    difficulty: 'Normal',
  });

  // TODO: Add loading state
  const [gameState, setGameState] = useState<GameState>('loading');

  const [mapData, setMapData] = useState<MapData[]>([]);

  useEffect(() => {
    fetch('/mapList.json')
      .then((res) => res.json())
      .then((data) => setMapData(data));
  }, []);

  useEffect(() => {
    const server = io(url);
    gameId && server.emit('join-game', gameId);
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

    server.on('state', (state) => {
      setGameState(state);
      console.log(state);
    });

    setServer(server);
  }, [gameId]);

  function renderGameState() {
    switch (gameState) {
      case 'invalid':
        return <h2>Game not found</h2>;
      case 'loading':
        return <h2>Loading...</h2>;
      case 'lobby':
      case 'starting':
        return (
          <LobbyState
            gameState={gameState}
            players={players}
            settings={settings}
            setSettings={setSettings}
            mapData={mapData}
            server={server}
          />
        );
      case 'reveal':
      case 'game':
        return (
          <GameState
            isMobile={isMobile}
            gameState={gameState}
            server={server}
            players={players}
            mapData={mapData.find((map) => map.webPath === settings.map)!!}
            difficulty={
              difficulties.find(
                (difficulty) => difficulty.value === settings.difficulty
              )!!.multiplier
            }
          />
        );
      default:
        return <h2>???</h2>;
    }
  }

  return <Layout isMobile={isMobile}>{renderGameState()}</Layout>;
};

export default Game;
