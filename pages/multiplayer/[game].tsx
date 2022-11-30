import { raw } from 'body-parser';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Layout from '../../components/common/Layout';
import { useMobile } from '../../components/hooks/MobileHook';
import styles from '../../styles/Multiplayer.module.scss';
import { Player } from '../../utils/types/multiplayer/Player';

const Game: NextPage = () => {
  const isMobile = useMobile();
  const router = useRouter();

  const url = 'http://localhost:23177';

  const { game: gameId } = router.query;

  const [isValid, setIsValid] = useState(true);
  const [isLeader, setIsLeader] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);

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

    server.on('not-found', () => {
      setIsValid(false);
    });
  }, [gameId]);

  return (
    <Layout isMobile={isMobile}>
      {isValid ? (
        <div id={styles['start-container']}>
          <div id={styles['players']} className={styles['container']}>
            <h2>Players</h2>
            <div id={styles['player-list']}>
              {players.map((player) => (
                <div key={player.id}>
                  <p>{player.you ? <b>{player.name}</b> : player.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div id={styles['settings']} className={styles['container']}>
            <h2>Game Settings</h2>
          </div>
        </div>
      ) : (
        <h2>Game not found</h2>
      )}
    </Layout>
  );
};

export default Game;
