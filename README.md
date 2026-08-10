# 📜 event-ledger-shifter

A database-less voucher system built natively in Node.js that processes voucher allocations using an append-only event sourcing architectural design patterns.

## 🧠 Architectural Design Blueprint
- **Event Sourcing Ledger**: The server avoids state mutations in local runtime memory variables. Instead, it reads a history stream line-by-line (`.jsonl`) to dynamically compute object profiles.
- **Immutable Audit Trails**: Creates an unalterable chain of filesystem historical benchmarks. This style is optimal for accounting protocols and high-integrity cloud networks.

## 🚀 Execution & Verification Track
1. **Fire Up the Application Instance**:
   ```bash
   node server.js
   ```

2. **Submit a Voucher Claims Request**:
   ```bash
   curl -X POST http://localhost:3000/api/ledger/consume \
     -H "Content-Type: application/json" \
     -d '{"voucherCode": "ALPHA_VOUCHER_2026"}'
   ```

3. **Verify State History Replay Protection**:
   Attempt to fire the same request a second time. The server will parse the historic log, detect the prior event id record, and return an explicit `HTTP 410 Gone` error.
   
4. **Inspect the Filesystem Ledger Structure**:
   Open `immutable_ledger.jsonl` to review your cryptographically isolated audit track.

