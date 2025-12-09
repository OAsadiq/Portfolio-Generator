export function allowCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Required for browser preflight (OPTIONS)
  if (res.req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }

  return false;
}
