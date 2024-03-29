import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../utils/api/init';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { map } = req.query;
    const docRef = db.collection('maps').doc(map as string);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      await docRef.update({
        played: (docSnap.data()?.played ?? 0) + 1,
      });
    } else {
      await docRef.set({
        played: 1,
      });
    }

    res.status(200).end();
  } catch (e) {
    res.status(500).json(e);
  }
}
