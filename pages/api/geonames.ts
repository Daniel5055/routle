import { NextApiRequest, NextApiResponse } from 'next';

// Calling http requests through dynamic next api as prevented from fetching
// mixed content on the browser
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const url = req.url;
  const path = `http://api.geonames.org/searchJSON${url?.substring(
    url.indexOf('?')
  )}`;
  const data = await fetch(path).then((res) => res.json());

  res.status(200).send(data);
}
