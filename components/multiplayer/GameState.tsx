import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { CityResponse } from "../../utils/types/GeoResponse";
import { MapData } from "../../utils/types/MapData";
import { Player } from "../../utils/types/multiplayer/Player";
import { Settings } from "../../utils/types/multiplayer/Settings";
import { useCities } from "../hooks/CityHook";

export const GameState = (
  players: Player[],
  settings: Settings,
  mapData: MapData[],
  server?: Socket,
) => {

  const map = mapData.find((m) => settings.map)!!;

  const [ promptData, setPromptData ] = useState<{ cities: CityResponse[], start: number, end: number}>();

  // Initialising your own cities
  let { cities, queryCity } = useCities(map, promptData?.cities ?? [], 1, promptData?.start, promptData?.end )

  // Ensure 'this' is retained and correct
  queryCity = queryCity.bind({ cities });

  const [ otherCities, setOtherCities ] = useState();

  useEffect(() => {
    server?.emit('state-ack', 'reveal')
    server?.on('prompt-cities', (msg) => {
      const data = JSON.parse(msg)
      setPromptData(data)
      console.log(data)
    })
  }, [server])
  return <h3>Gaming!</h3>;
};
