import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Layout from '../../components/common/Layout';
import { useMobile } from '../../components/hooks/MobileHook';
import { GameScene } from '../../components/multiplayer/scenes/GameScene';
import { LobbyScene } from '../../components/multiplayer/scenes/LobbyScene';
import { multiplayerURL } from '../../utils/api/multiplayer';
import { MapData } from '../../utils/types/MapData';
import { Player } from '../../utils/types/multiplayer/Player';
import { Settings } from '../../utils/types/multiplayer/Settings';

type GameScene = 'invalid' | 'full' | 'loading' | 'lobby' | 'game';

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

  const { game: gameId } = router.query;

  const [server, setServer] = useState<Socket>();

  const [players, setPlayers] = useState<{ [id: string]: Player }>({});
  const [settings, setSettings] = useState<Settings>({
    map: 'Europe',
    difficulty: 'Normal',
  });

  const [gameScene, setGameScene] = useState<GameScene>('loading');
  const [mapData, setMapData] = useState<MapData[]>([]);

  useEffect(() => {
    fetch('/mapList.json')
      .then((res) => res.json())
      .then((data) => setMapData(data));
  }, []);

  useEffect(() => {
    if (!gameId) {
      return;
    }

    const server = io(`${multiplayerURL}/${gameId}`);

    server.on('update', (msg) => {
      if ('settings' in msg) {
        setSettings(msg.settings);
      }

      if ('players' in msg) {
        setPlayers(msg.players);
        console.log('player:', msg.players);
      }
    });

    server.on('scene', (scene) => {
      console.log('new scene: ', scene);
      setGameScene(scene);
    });

    server.on('closed', () => {
      setGameScene('invalid');
      unmount();
    });
    server.on('full', () => {
      setGameScene('full');
      unmount();
    });

    setServer(server);

    const unmount = () => {
      server.off('update');
      server.off('scene');
      server.off('closed');
      server.disconnect();
    };

    return unmount;
  }, [gameId]);

  function renderGameScene() {
    switch (gameScene) {
      case 'invalid':
        return <h2>Game not found</h2>;
      case 'full':
        return <h2>Game is full</h2>;
      case 'loading':
        return <h2>Loading...</h2>;
      case 'lobby':
        return (
          <LobbyScene
            players={players}
            settings={settings}
            setSettings={setSettings}
            mapData={mapData}
            server={server}
          />
        );
      case 'game':
        return (
          <GameScene
            isMobile={isMobile}
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

  return <Layout isMobile={isMobile}>{renderGameScene()}</Layout>;
};

export default Game;
