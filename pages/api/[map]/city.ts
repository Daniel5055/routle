import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../utils/api/init';

interface CityReqBody {
  id?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { map } = req.query;
    const body = req.body as CityReqBody;
    if (body.id == undefined) {
      res.status(400).end();
      return;
    }

    const docRef = db
      .collection('maps')
      .doc(map as string)
      .collection('cities')
      .doc(body.id.toString());
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      await docRef.update({
        count: (docSnap.data()?.count ?? 0) + 1,
      });
    } else {
      await docRef.set({
        count: 1,
      });
    }

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
}
