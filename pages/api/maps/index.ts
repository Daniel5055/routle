import { readFile } from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { MapData } from '../../../utils/types/MapData'


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<MapData[]>
) {

  // Ensure method is only GET
  if (req.method !== 'GET') {
    res.status(405)
    return
  }

  // Read the file containing map data and parse to json 
  readFile('public/mapList.json', (err, data) => {
    if (err) {
      console.error(err.message)
      res.status(500)
      return
    }

    try {
      const parsedData: MapData[] = JSON.parse(data.toString())
      res.status(200).json(parsedData)
    } catch {
      console.error('Error parsing json')
      res.status(500)
    }
  })
}