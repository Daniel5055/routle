import { NextPage } from 'next';
import Layout from '../../components/common/Layout';
import { useMobile } from '../../components/hooks/MobileHook';
import styles from '../../styles/Multiplayer.module.scss';
import { useRouter } from 'next/router';

const Multiplayer: NextPage = () => {
  const isMobile = useMobile();
  const router = useRouter();

  const url = 'http://localhost:23177';

  async function hostGame() {
    const response = await fetch(`${url}/host-game`, {
      method: 'POST',
    }).then((res) => res.json());
    const gameId = response.id;
    router.push(`/multiplayer/${gameId}`);
  }
  return (
    <Layout isMobile={isMobile}>
      <p>Join a game with a url or host one here:</p>
      <button className={styles.option} onClick={hostGame}>
        Host Game
      </button>
    </Layout>
  );
};

export default Multiplayer;
