import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { InputHTMLAttributes, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
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
  const [editMode, setEditMode] = useState(false);
  const [server, setServer] = useState<Socket>();

  const [players, setPlayers] = useState<Player[]>([]);

  const player = players.find((player) => player.you);

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
          </div>
        </div>
      ) : (
        <h2>Game not found</h2>
      )}
    </Layout>
  );
};

export default Game;
