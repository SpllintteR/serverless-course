import { getEndedAuctions } from './lib/getEndedAuctions';

async function processAuctions(event, context) {
  const endedAuctions = await getEndedAuctions();
  console.log(endedAuctions);
}

export const handler = processAuctions;