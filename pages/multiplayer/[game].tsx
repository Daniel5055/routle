import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Layout from '../../components/common/Layout';
import { useMobile } from '../../components/hooks/MobileHook';
import { GameScene } from '../../components/multiplayer/scenes/GameScene';
import { LobbyScene } from '../../components/multiplayer/scenes/LobbyScene';
import { multiplayerURL } from '../../utils/api/multiplayer';
import { MapData } from '../../utils/types/MapData';
import { Player } from '../../utils/types/multiplayer/Player';
import Settings from '../../utils/types/multiplayer/Settings';
import { DIFFICULTY_DEFAULT } from '../../utils/functions/settings/difficulty';
import { PRIORITY_DEFAULT } from '../../utils/functions/settings/priority';

type GameScene = 'invalid' | 'full' | 'loading' | 'lobby' | 'game';

const Game: NextPage = () => {
  const isMobile = useMobile();
  const router = useRouter();

  const { game: gameId } = router.query;

  const [server, setServer] = useState<Socket>();

  const [players, setPlayers] = useState<{ [id: string]: Player }>({});
  const [settings, setRawSettings] = useState<Settings>({
    map: 'europe',
    difficulty: DIFFICULTY_DEFAULT,
    priority: PRIORITY_DEFAULT,
    holes: 0,
    holeRadius: 1,
    holeDefs: [],
  });

  const [gameScene, setGameScene] = useState<GameScene>('loading');
  const [mapData, setMapData] = useState<MapData[]>([]);

  const selectedMapData = useMemo(
    () => mapData.find((map) => map.webPath === settings.map)!!,
    [mapData, settings.map]
  );

  function setSettings(settings: Settings) {
    setRawSettings(settings);
    server?.emit('update', { settings });
  }

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
        setRawSettings(msg.settings);
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
            mapData={selectedMapData}
            settings={settings}
          />
        );
      default:
        return <h2>???</h2>;
    }
  }

  return <Layout isMobile={isMobile}>{renderGameScene()}</Layout>;
};

export default Game;
