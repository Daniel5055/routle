import styles from '../../styles/Singleplayer.module.scss'
import { RefObject, useEffect, useRef, useState } from 'react'
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

  const [mapWidth, setMapWidth] = useState(0)
  const [mapHeight, setMapHeight] = useState(0)

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const onMapLoad = (info: {naturalWidth: number, naturalHeight: number}) => {
      setMapWidth(mapContainerRef.current!!.clientHeight / info.naturalHeight * info.naturalWidth);
      setMapHeight(mapContainerRef.current!!.clientHeight);
      setSearchRadius(searchRadius * mapContainerRef.current!!.clientHeight / 8);
  }

  return (
    <div className={styles['map-container']} ref={mapContainerRef} style={{ width: mapWidth}}>
      <Image
        src={mapData.path}
        alt='Map'
        layout='fill'
        objectFit='contain'
        onLoadingComplete={onMapLoad} />
        
      <svg
        width='100%'
        height='100%'
        className={styles['map-container-child']}
        ref={svgRef}
      > 
        <circle cx={(currentPoint?.x ?? 10000) * mapWidth} cy={(currentPoint?.y ?? 10000) * mapHeight} r={2} fill={PointType.current}/> 
        <circle cx={(endPoint?.x ?? 10000) * mapWidth} cy={(endPoint?.y ?? 10000) * mapHeight} r={2} fill={PointType.end}/> 
        {pastPoints.map((p1, i, a) => {
            const p2 = i + 1 >= a.length
              ? currentPoint ?? {x: 0, y: 0}
              : a[i + 1]

              return <line key={i} x1={p1.x * mapWidth} y1={p1.y * mapHeight} x2={p2.x * mapWidth} y2={p2.y * mapHeight} stroke={PointType.past}/>
          })}
        {pastPoints.map((p, i) => <circle
          cx={p.x * mapWidth} cy={p.y * mapHeight} r={2} fill={PointType.past} key={i} />)}
        {farPoints.map((p, i) => <circle
          cx={p.x * mapWidth} cy={p.y * mapHeight} r={2} fill={PointType.far} key={i} />)}
        <circle cx={(currentPoint?.x ?? 10000) * mapWidth} cy={(currentPoint?.y ?? 10000) * mapHeight} r={searchRadius} stroke={PointType.current} fill='none' /> 
      </svg>
    </div>
  );
}