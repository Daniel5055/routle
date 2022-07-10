// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { readdir, readdirSync } from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name: string[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const out = readdirSync('.');

  res.status(200).json({ name: out });
}
