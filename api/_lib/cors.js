export function allowCors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

    // Required for browser preflight (OPTIONS)
    if (res.req.method === "OPTIONS") {
        res.status(200).end();
        return true;
    }

    return false;
}
