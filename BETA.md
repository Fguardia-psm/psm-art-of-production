## Temporary (webhook offline)

Unlock form redirects to **Contact Us**: https://www.psmbrokerage.com/contact
Kit can still be claimed locally without NPN.

# Beta ops notes — The Art of Production

## Required before inviting agents on Vercel

1. Set **`LEAD_WEBHOOK_URL`** in the Vercel project (Zapier/Make/CRM).  
   Without it, production **rejects** NPN unlocks (fail-closed).  
   Local/dev can still store under `data/*.jsonl`.

2. Optional: `VITE_EMBED_PARENT_ORIGINS=https://www.psmbrokerage.com,...`  
   Restricts iframe height `postMessage` targets.

3. Optional demo-only: `ALLOW_EPHEMERAL_LEADS=1` — **do not** use with real NPNs.

## Manual smoke (non-developer)

1. Open production URL → **Begin the Campaign**  
2. Complete scout → map → Chapter I prep exercise  
3. **Start over** → confirm Begin again  
4. Walk to unlock with a **test** NPN → confirm webhook fires in Zapier  
5. Dossier shows face deck + Field Reports path  
6. Embed iframe on staging page → height resizes without scrollbar trap  

## Data handling

- Campaign progress: browser `localStorage` only  
- NPN/PII: server → webhook (and optional local file in non-serverless)  
- Logs redact email/NPN  
