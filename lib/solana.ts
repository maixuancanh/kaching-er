import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Buffer } from "buffer";

const DEVNET_RPC = "https://api.devnet.solana.com";
const MAGICBLOCK_ER_RPC = "https://devnet.magicblock.app";
export const PROJECT_PROGRAM_ID = new PublicKey("HieogJcAfZr8jSpRAgJ2PL1wVTt8qU6A34xRYCPggmdP");

type PhantomProvider = {
  publicKey?: PublicKey;
  connect: () => Promise<{ publicKey: PublicKey }>;
  signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }>;
};

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

export function shortKey(key: string) {
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export function explorerTx(signature: string) {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export function explorerAddress(address = PROJECT_PROGRAM_ID.toBase58()) {
  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
}

export async function connectWallet() {
  if (!window.solana) throw new Error("No Solana wallet found. Install Phantom or Backpack and switch to devnet.");
  const response = await window.solana.connect();
  return response.publicKey.toBase58();
}

export function hashMove(room: string, move: string, nonce: string) {
  const data = new TextEncoder().encode(`${room}:${move}:${nonce}`);
  return bytesToHex(sha256(data));
}

export function resolveDuel(player: string, opponent: string) {
  if (player === opponent) return "Tie: replay round";
  if (
    (player === "shield" && opponent === "strike") ||
    (player === "signal" && opponent === "shield") ||
    (player === "strike" && opponent === "signal")
  ) {
    return "You assign the payer";
  }
  return "Opponent assigns the payer";
}

export async function buildMemoTransaction(endpoint: string, memo: string) {
  if (!window.solana?.publicKey) throw new Error("Wallet is not connected");
  const connection = new Connection(endpoint, "confirmed");
  const transaction = new Transaction().add(
    new TransactionInstruction({
      keys: [],
      programId: PROJECT_PROGRAM_ID,
      data: Buffer.from(memo, "utf8"),
    }),
  );
  transaction.feePayer = window.solana.publicKey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
  return transaction;
}

export async function sendMemoProof(route: "MagicBlock ER" | "Solana Devnet", memo: string) {
  if (!window.solana) throw new Error("No Solana wallet found");
  const endpoint = route === "MagicBlock ER" ? MAGICBLOCK_ER_RPC : DEVNET_RPC;
  const transaction = await buildMemoTransaction(endpoint, memo);
  const { signature } = await window.solana.signAndSendTransaction(transaction);
  const connection = new Connection(endpoint, "confirmed");
  await connection.confirmTransaction(signature, "confirmed");
  return signature;
}
