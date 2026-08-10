# Ka-Ching ER

Independent Solana Blitz V7 submission inspired by collaborative payment-game wallets.

Ka-Ching ER lets a small team resolve shared payment responsibility with a commit/reveal mini-game. Commit and reveal proof transactions are routed through MagicBlock ER, while the final payer assignment is settled on Solana devnet.

## Demo Flow

1. Connect a Solana devnet wallet.
2. Create or join a payment duel room.
3. Commit a private move hash.
4. Reveal the move and nonce.
5. Resolve the deterministic duel.
6. Settle the payer assignment on Solana devnet.

## MagicBlock Use

- MagicBlock ER endpoint: `https://devnet.magicblock.app`
- Solana L1 endpoint: `https://api.devnet.solana.com`
- Proof format: signed Solana memo transactions for the hackathon MVP.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Judge Mode

Open `/judge` for the rubric mapping and demo checklist.

## Reference

The concept is adapted from Ka-Ching's public ETHGlobal showcase. This repository is a new Solana/MagicBlock implementation with new branding and assets.
