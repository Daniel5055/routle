import styles from '../../styles/Singleplayer.module.scss';
import { useState } from 'react';
import { MapData } from '../../utils/types/MapData';
import { CityPoint, Point, PointType } from '../../utils/types/CityPoint';
import Image from 'next/image';
import { flattenCoords } from '../../utils/functions/coords';

// Separating functionality
export const MapDisplay = ({
  mapData,
  searchRadiusMultiplier,
  holeRadiusMultiplier,
  cities,
  isMobile,
}: {
  mapData: MapData;
  searchRadiusMultiplier?: number;
  holeRadiusMultiplier?: number;
  cities: {
    far: CityPoint[];
    past: CityPoint[];
    start: CityPoint;
    end: CityPoint;
    current: CityPoint;
    holes: Point[];
  };
  isMobile: boolean;
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
      />

      <svg width="100%" height="100%" className={styles['map-container-child']}>
        <circle
          cx={`${cities.current.x * 100}%`}
          cy={`${cities.current.y * 100}%`}
          r={pointRadius}
          fill={PointType.current}
          className={cleanName(cities.current.name)}
        />
        <circle
          cx={`${cities.end.x * 100}%`}
          cy={`${cities.end.y * 100}%`}
          r={pointRadius}
          fill={PointType.end}
          className={cleanName(cities.end.name)}
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
              stroke={PointType.past}
              strokeWidth={strokeWidth}
            />
          );
        })}
        {cities.past.map((p, i) => (
          <circle
            cx={`${p.x * 100}%`}
            cy={`${p.y * 100}%`}
            r={pointRadius}
            fill={PointType.past}
            key={i}
            className={cleanName(p.name)}
          />
        ))}
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
        {holeRadiusMultiplier &&
          cities.holes.map((h, i) => (
            <circle
              key={i + '_hole'}
              cx={`${h.x * 100}%`}
              cy={`${h.y * 100}%`}
              r={mapRatio ? `${holeRadiusMultiplier * height}vh` : 0}
              fill={PointType.hole}
              className={styles.hole}
            />
          ))}
        {searchRadiusMultiplier && (
          <circle
            cx={`${cities.current.x * 100}%`}
            cy={`${cities.current.y * 100}%`}
            r={mapRatio ? `${searchRadiusMultiplier * height}vh` : 0}
            stroke={PointType.current}
            strokeWidth={strokeWidth}
            fill="none"
            className="search-radius"
          />
        )}
      </svg>
    </div>
  );
};
