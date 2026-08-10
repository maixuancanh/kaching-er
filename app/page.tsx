"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Copy, ExternalLink, Loader2, ShieldCheck, Swords, Wallet } from "lucide-react";
import { connectWallet, explorerTx, hashMove, resolveDuel, sendMemoProof, shortKey } from "@/lib/solana";

const choices = [
  { id: "shield", label: "Shield", beats: "strike", tone: "from-cyan-300 to-emerald-300", symbol: "SH" },
  { id: "signal", label: "Signal", beats: "shield", tone: "from-violet-300 to-fuchsia-300", symbol: "SG" },
  { id: "strike", label: "Strike", beats: "signal", tone: "from-orange-300 to-red-400", symbol: "ST" },
] as const;

type Choice = (typeof choices)[number]["id"];
type Proof = { label: string; signature: string; route: "MagicBlock ER" | "Solana Devnet"; memo: string };

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [room, setRoom] = useState("gas-round-8842");
  const [amount, setAmount] = useState("0.05 SOL");
  const [move, setMove] = useState<Choice>("shield");
  const [nonce, setNonce] = useState(() => Math.random().toString(36).slice(2, 10));
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [opponentMove, setOpponentMove] = useState<Choice>("strike");

  const commitment = useMemo(() => hashMove(room, move, nonce), [room, move, nonce]);
  const result = useMemo(() => resolveDuel(move, opponentMove), [move, opponentMove]);

  async function onConnect() {
    setError("");
    setBusy("connect");
    try { setWallet(await connectWallet()); }
    catch (err) { setError(err instanceof Error ? err.message : "Wallet connection failed"); }
    finally { setBusy(""); }
  }

  async function writeProof(label: string, route: Proof["route"], memo: string) {
    setError("");
    setBusy(label);
    try {
      const signature = await sendMemoProof(route, memo);
      setProofs((items) => [{ label, signature, route, memo }, ...items]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="kaching-machine min-h-dvh overflow-hidden bg-black text-white">
      <Image src="/hero-bg.png" alt="" fill priority className="object-cover" />
      <div className="machine-vignette" />

      <header className="machine-top">
        <div className="flex items-center gap-3">
          <Image src="/brand-logo.png" alt="Ka-Ching ER logo" width={50} height={50} className="token-logo size-[50px] rounded-full object-cover" />
          <div>
            <p className="kaching-title text-2xl uppercase text-amber-300">Ka-Ching ER</p>
            <p className="font-mono text-[11px] uppercase text-emerald-200/70">decision wallet</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/judge" className="machine-link">Judge</a>
          <button onClick={onConnect} className="machine-wallet">
            {busy === "connect" ? <Loader2 className="size-4 animate-spin" /> : <Wallet className="size-4" />}
            {wallet ? shortKey(wallet) : "Connect"}
          </button>
        </div>
      </header>

      <section className="machine-copy">
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-black/45 px-3 py-2 font-mono text-xs uppercase text-emerald-100">
          <ShieldCheck className="size-4" /> Devnet Live
        </p>
        <h1 className="kaching-headline mt-4 text-5xl uppercase leading-[0.9] sm:text-7xl lg:text-8xl">Payment Duel</h1>
        <p className="mt-4 max-w-md text-base leading-7 text-amber-50/80">Pick a private move, commit through MagicBlock ER, reveal, then settle the payer assignment on Solana devnet.</p>
      </section>

      <section className="machine-controls">
        <div className="machine-fields">
          <label><span>Room</span><input value={room} onChange={(e) => setRoom(e.target.value)} /></label>
          <label><span>Pot</span><input value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
          <label><span>Opponent</span><select value={opponentMove} onChange={(e) => setOpponentMove(e.target.value as Choice)}>{choices.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
        </div>

        <div className="token-ring">
          {choices.map((choice) => (
            <button key={choice.id} onClick={() => setMove(choice.id)} className={`token-choice ${move === choice.id ? "is-active" : ""}`}>
              <span className={`bg-gradient-to-br ${choice.tone}`}>{choice.symbol}</span>
              <b>{choice.label}</b>
              <small>beats {choice.beats}</small>
            </button>
          ))}
        </div>

        <div className="hash-console">
          <div>
            <p>Commitment</p>
            <code>{commitment}</code>
            <button onClick={() => setNonce(Math.random().toString(36).slice(2, 10))}>nonce {nonce}</button>
          </div>
          <button onClick={() => navigator.clipboard.writeText(commitment)} aria-label="Copy commitment hash"><Copy className="size-4" /></button>
        </div>

        <div className="action-deck">
          <button disabled={!wallet || Boolean(busy)} onClick={() => writeProof("Commit move", "MagicBlock ER", `KACHING_ER_COMMIT:${room}:${amount}:${commitment}`)}>Commit ER</button>
          <button disabled={!wallet || Boolean(busy)} onClick={() => writeProof("Reveal move", "MagicBlock ER", `KACHING_ER_REVEAL:${room}:${move}:${nonce}`)}>Reveal</button>
          <button disabled={!wallet || Boolean(busy)} onClick={() => writeProof("Settle payer", "Solana Devnet", `KACHING_ER_SETTLE:${room}:${result}:${amount}`)}><Swords className="size-4" /> {result}</button>
        </div>
        {error ? <p className="machine-error">{error}</p> : null}
      </section>

      <aside className="machine-tape">
        <p>{proofs.length} proof tx</p>
        {proofs.slice(0, 3).map((proof) => (
          <a key={proof.signature} href={explorerTx(proof.signature)} target="_blank" rel="noreferrer">
            {proof.label}<ExternalLink className="size-3" />
          </a>
        ))}
      </aside>
    </main>
  );
}
