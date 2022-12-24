import styles from '../../styles/Singleplayer.module.scss';
import { useState } from 'react';
import { MapData } from '../../utils/types/MapData';
import { CityPoint, PointType } from '../../utils/types/CityPoint';
import Image from 'next/image';
import { flattenCoords } from '../../utils/functions/coords';

// Separating functionality
export const MapDisplay = ({
  mapData,
  searchRadiusMultiplier,
  cities,
  isMobile,
  onMapLoad,
  otherCities,
  playerColors,
}: {
  mapData: MapData;
  searchRadiusMultiplier?: number;
  cities: {
    far: CityPoint[];
    past: CityPoint[];
    start: CityPoint;
    end: CityPoint;
    current: CityPoint;
  };
  isMobile: boolean;
  onMapLoad?: () => void;
  otherCities?: { [player: string]: CityPoint[] };
  playerColors?: { [player: string]: string };
}) => {
  const [mapRatio] = useState(() => {
    const flattenedMax = flattenCoords(mapData.latMax, mapData.longMax);
    const flattenedMin = flattenCoords(mapData.latMin, mapData.longMin);

    return (
      -(flattenedMax.long - flattenedMin.long) /
      (flattenedMax.lat - flattenedMin.lat)
    );
  });

  const height = isMobile ? 20 : 50;
  const pointRadius = `${0.6 * mapData.pointRadius}%`;
  const strokeWidth = `${0.3 * mapData.pointRadius}%`;

  const cleanName = (name: string) => name.toLowerCase().replace(' ', '-');

  // Rendering the map and the cities
  return (
    <div
      className={styles['map-container']}
      style={{ width: `${mapRatio * height}vh`, height: `${height}vh` }}
    >
      <Image
        src={mapData.imagePath}
        alt="Map"
        layout="fill"
        objectFit="contain"
        onLoad={onMapLoad}
      />

      <svg width="100%" height="100%" className={styles['map-container-child']}>
        {otherCities &&
          Object.entries(otherCities).flatMap(([id, oCities]) =>
            oCities.map((p1, i, a) => {
              if (i + 1 >= a.length) {
                return;
              }

              const p2 = a[i + 1];

              return (
                <line
                  key={id + i}
                  x1={`${p1.x * 100}%`}
                  y1={`${p1.y * 100}%`}
                  x2={`${p2.x * 100}%`}
                  y2={`${p2.y * 100}%`}
                  stroke={playerColors?.[id] ?? PointType.other}
                  strokeWidth={strokeWidth}
                  opacity={0.5}
                />
              );
            })
          )}
        {otherCities &&
          Object.entries(otherCities).flatMap(([id, oCities]) =>
            oCities.map((p, i) => (
              <circle
                key={id + i}
                cx={`${p.x * 100}%`}
                cy={`${p.y * 100}%`}
                r={pointRadius}
                fill={playerColors?.[id] ?? PointType.other}
                opacity={0.5}
                className={cleanName(p.name)}
              />
            ))
          )}
        <circle
          cx={`${cities.current.x * 100}%`}
          cy={`${cities.current.y * 100}%`}
          r={pointRadius}
          fill={playerColors?.['me'] ?? PointType.current}
          className={cleanName(cities.current.name)}
        />
        {cities.past.map((p1, i, a) => {
          const p2 = i + 1 >= a.length ? cities.current : a[i + 1];

          return (
            <line
              key={i}
              x1={`${p1.x * 100}%`}
              y1={`${p1.y * 100}%`}
              x2={`${p2.x * 100}%`}
              y2={`${p2.y * 100}%`}
              stroke={playerColors?.['me'] ?? PointType.past}
              strokeWidth={strokeWidth}
            />
          );
        })}
        {cities.past.map((p, i) => (
          <circle
            cx={`${p.x * 100}%`}
            cy={`${p.y * 100}%`}
            r={pointRadius}
            fill={playerColors?.['me'] ?? PointType.past}
            key={i}
            className={cleanName(p.name)}
          />
        ))}
        <circle
          cx={`${cities.end.x * 100}%`}
          cy={`${cities.end.y * 100}%`}
          r={pointRadius}
          fill={PointType.end}
          className={cleanName(cities.end.name)}
        />
        {cities.far.map((p, i) => (
          <circle
            cx={`${p.x * 100}%`}
            cy={`${p.y * 100}%`}
            r={pointRadius}
            fill={PointType.far}
            key={i}
            className={cleanName(p.name)}
          />
        ))}
        {searchRadiusMultiplier && (
          <circle
            cx={`${cities.current.x * 100}%`}
            cy={`${cities.current.y * 100}%`}
            r={mapRatio ? `${searchRadiusMultiplier * height}vh` : 0}
            stroke={playerColors?.['me'] ?? PointType.current}
            strokeWidth={strokeWidth}
            fill="none"
            className="search-radius"
          />
        )}
      </svg>
    </div>
  );
};
