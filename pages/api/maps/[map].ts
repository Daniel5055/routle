import { readFileSync } from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { MapData } from '../../../utils/types/MapData'


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<MapData>
) {

  // Ensure method is only GET
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }

  const { map } = req.query

  // Read the file containing map data and parse to json 
  const data = readFileSync('public/mapList.json');

  try {
    const parsedData: MapData[] = JSON.parse(data.toString())
    const result = parsedData.find((c) => c.name == map);
    return result ? res.status(200).json(result) : res.status(404).end(); 
  } catch {
    console.error('Error parsing json')
    res.status(500).end()
  }
}