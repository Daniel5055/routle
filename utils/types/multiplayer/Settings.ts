import SingleplayerSettings from '../Settings';

interface Settings extends SingleplayerSettings {
  map: string;
  holeDefs: {
    x: number;
    y: number;
    radius: number;
  }[];
}

export default Settings;
