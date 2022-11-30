import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { io } from 'socket.io-client';
import Layout from '../../components/common/Layout';
import { useMobile } from '../../components/hooks/MobileHook';

const Game: NextPage = () => {
  const isMobile = useMobile();
  const router = useRouter();

  const url = 'http://localhost:23177';

  const { game: gameId } = router.query;

  const [isLeader, setIsLeader] = useState(false);

  const server = io(url);

  server.emit('join-game', gameId);

  server.on('new-leader', (id) => {
    setIsLeader(server.id === id);
  });

  return (
    <Layout isMobile={isMobile}>
      <p>Here {gameId}!</p>
    </Layout>
  );
};

export default Game;
