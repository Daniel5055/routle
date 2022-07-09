import styles from '../../styles/Singleplayer.module.scss'
import { RefObject, useEffect, useRef, useState } from 'react'
import { MapData } from '../../utils/types/MapData';
import { CityPoint, PointType } from '../../utils/types/CityPoint';

// Seperating functionality
export const MapDisplay = ({
  mapData,
  setSearchRadius,
  mapRef,
  startPoint,
  currentPoint,
  endPoint,
  pastPoints,
  farPoints,
}: {
  mapData: MapData;
  setSearchRadius: (searchRadius: number) => void;
  mapRef: RefObject<HTMLImageElement>;
  startPoint?: CityPoint;
  currentPoint?: CityPoint;
  endPoint?: CityPoint;
  pastPoints: CityPoint[];
  farPoints: CityPoint[];
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mapWidth, setMapWidth] = useState(0)
  const [mapHeight, setMapHeight] = useState(0)

  // On map load
  useEffect(() => {
    mapWidth !== mapRef.current?.width && setMapWidth(mapRef.current ? mapRef.current!!.width : 0);
    mapHeight !== mapRef.current?.height && setMapHeight(mapRef.current ? mapRef.current!!.height : 0);
    setSearchRadius(mapRef.current!!.height / 8);
  }, [mapRef, setSearchRadius, mapWidth, mapHeight])

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    context?.clearRect(0, 0, canvasRef.current!!.width, canvasRef.current!!.height)
    if (context) {
      console.log("hello")
      // Draw the points
      pastPoints.forEach((point) => {
        context.beginPath();
        context.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        context.fill();
        context.fillStyle = PointType.past as string;
        context.closePath()
      })
      farPoints.forEach((point) => {
        context.beginPath();
        context.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        context.fill();
        context.fillStyle = PointType.far as string;
        context.closePath()
      })

      if (startPoint) {
        context.beginPath();
        context.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI);
        context.fill();
        context.fillStyle = '#F00' 
        context.closePath();
      }
      if (endPoint) {
        context.beginPath();
        context.arc(endPoint.x, endPoint.y, 2, 0, 2 * Math.PI);
        context.fill();
        context.fillStyle = PointType.end as string;
        context.closePath();
      }
      if (currentPoint) {
        context.beginPath();
        context.arc(currentPoint.x, currentPoint.y, 2, 0, 2 * Math.PI);
        context.fill();
        context.fillStyle = PointType.current as string;
        context.closePath();
      }
    }
  }, [currentPoint, endPoint, startPoint, farPoints, pastPoints]);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    
    if (context) {
      context.clearRect(0, 0, canvasRef.current!!.width, canvasRef.current!!.height)
    }

  }, [canvasRef, farPoints])

  return (
    <div className={styles['map-container']}>
      <picture>
        <source className={styles['map-container-child']} srcSet={mapData.path} type='image/png' />
        <img className={styles['map-container-child']}
          src={mapData.path}
          alt='Map'
          ref={mapRef}
        />
      </picture>
      <canvas
        className={styles['map-container-child']}
        ref={canvasRef}
        width={mapWidth}
        height={mapHeight}
      />
    </div>
  );
}