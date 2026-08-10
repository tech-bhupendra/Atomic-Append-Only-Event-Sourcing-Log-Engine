const http = require('http');

const CLUSTER_VAULT = new Map([['PROMO2026', { value: 100, claimed: false }]]);
const BUCKETS = new Map(); // Tracks client IP rate-limit structures

const BUCKET_CAPACITY = 5;
const REFILL_RATE_PER_SEC = 0.5; // Adds 1 token every 2 seconds

const checkRateLimit = (ip) => {
    const now = Date.now();
    if (!BUCKETS.has(ip)) {
        BUCKETS.set(ip, { tokens: BUCKET_CAPACITY, lastRefill: now });
        return true;
    }

    const bucket = BUCKETS.get(ip);
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    
    // Mathematically recalculate token balance based on time differential delta
    bucket.tokens = Math.min(BUCKET_CAPACITY, bucket.tokens + (elapsedSeconds * REFILL_RATE_PER_SEC));
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
        bucket.tokens -= 1; // Consume one bucket execution token
        return true;
    }
    return false;
};

const server = http.createServer((req, res) => {
    const clientIp = req.socket.remoteAddress;

    if (req.method === 'POST' && req.url === '/api/redeem') {
        let streamData = '';
        req.on('data', chunk => { streamData += chunk; });
        req.on('end', () => {
            // 1. Enforce proactive network rate limiting security layer
            if (!checkRateLimit(clientIp)) {
                res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': '2' });
                return res.end(JSON.stringify({ error: 'Too many requests. Rate limit bucket drained.' }));
            }

            try {
                const { voucherCode } = JSON.parse(streamData);
                if (!CLUSTER_VAULT.has(voucherCode)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: 'Voucher code mismatch' }));
                }

                const record = CLUSTER_VAULT.get(voucherCode);
                if (record.claimed) {
                    res.writeHead(410, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: 'Voucher asset already spent' }));
                }

                record.claimed = true;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: true, balanceAdded: record.value }));
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Malformed system request payload' }));
            }
        });
    } else { res.writeHead(404).end(); }
});

server.listen(3000, () => console.log('🚀 ratelimit-token-bucket active on port 3000'));
