import { NextPage } from 'next';
import Layout from '../../components/common/Layout';
import { useMobile } from '../../components/hooks/MobileHook';

const Multiplayer: NextPage = () => {
  const isMobile = useMobile();

  return (
    <Layout isMobile={isMobile}>
      <p>Work in progress</p>
    </Layout>
  );
};

export default Multiplayer;
