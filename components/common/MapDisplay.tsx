import styles from '../../styles/Singleplayer.module.scss';
import { RefObject, useEffect, useRef, useState } from 'react';
import { MapData } from '../../utils/types/MapData';
import { CityPoint, PointType } from '../../utils/types/CityPoint';
import Image from 'next/image';

// Seperating functionality
export const MapDisplay = ({
  mapData,
  setSearchRadius,
  searchRadius,
  svgRef,
  currentPoint,
  endPoint,
  pastPoints,
  farPoints,
}: {
  mapData: MapData;
  setSearchRadius: (searchRadius: number) => void;
  searchRadius: number;
  svgRef: RefObject<SVGSVGElement>;
  currentPoint?: CityPoint;
  endPoint?: CityPoint;
  pastPoints: CityPoint[];
  farPoints: CityPoint[];
}) => {
  const [mapRatio, setMapRatio] = useState(0);

  const onMapLoad = (info: { naturalWidth: number; naturalHeight: number }) => {
    setSearchRadius(searchRadius / 8);
    setMapRatio(info.naturalWidth / info.naturalHeight);
  };

  const height = 40;
  const pointRadius = `${0.6 * mapData.pointRadius}%`;

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
        onLoadingComplete={onMapLoad}
      />

      <svg
        width="100%"
        height="100%"
        className={styles['map-container-child']}
        ref={svgRef}
      >
        <circle
          cx={`${(currentPoint?.x ?? 10000) * 100}%`}
          cy={`${(currentPoint?.y ?? 10000) * 100}%`}
          r={pointRadius}
          fill={PointType.current}
        />
        <circle
          cx={`${(endPoint?.x ?? 10000) * 100}%`}
          cy={`${(endPoint?.y ?? 10000) * 100}%`}
          r={pointRadius}
          fill={PointType.end}
        />
        {pastPoints.map((p1, i, a) => {
          const p2 =
            i + 1 >= a.length ? currentPoint ?? { x: 0, y: 0 } : a[i + 1];

          return (
            <line
              key={i}
              x1={`${p1.x * 100}%`}
              y1={`${p1.y * 100}%`}
              x2={`${p2.x * 100}%`}
              y2={`${p2.y * 100}%`}
              stroke={PointType.past}
            />
          );
        })}
        {pastPoints.map((p, i) => (
          <circle
            cx={`${p.x * 100}%`}
            cy={`${p.y * 100}%`}
            r={pointRadius}
            fill={PointType.past}
            key={i}
          />
        ))}
        {farPoints.map((p, i) => (
          <circle
            cx={`${p.x * 100}%`}
            cy={`${p.y * 100}%`}
            r={pointRadius}
            fill={PointType.far}
            key={i}
          />
        ))}
        <circle
          cx={`${(currentPoint?.x ?? 10000) * 100}%`}
          cy={`${(currentPoint?.y ?? 10000) * 100}%`}
          r={mapRatio ? `${searchRadius * height}vh` : 0}
          stroke={PointType.current}
          strokeWidth={`${mapData.pointRadius * 0.3}%`}
          fill="none"
        />
      </svg>
    </div>
  );
};
