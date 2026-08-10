# Ka-Ching ER Program Sketch

This folder documents the intended custom Solana program surface for the next step after the browser-wallet MVP.

Instructions:

- `initialize_room(room_id, amount_label_hash)`
- `commit_move(commitment_hash)`
- `reveal_move(move_id, nonce)`
- `resolve_round()`
- `settle_assignment()`

State:

- `PaymentRoom`
- `PlayerCommit`
- `RoundResult`

The current MVP emits signed devnet memo proofs through MagicBlock ER and Solana devnet. The custom program should replace memo proofs once the local Solana/Anchor toolchain is available.
