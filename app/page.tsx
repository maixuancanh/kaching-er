"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Loader2, ShieldCheck, Swords, Wallet } from "lucide-react";
import { connectWallet, explorerTx, hashMove, resolveDuel, sendMemoProof, shortKey } from "@/lib/solana";

const choices = [
  { id: "shield", label: "Shield", beats: "strike", tone: "from-cyan-300 to-emerald-300", symbol: "SH" },
  { id: "signal", label: "Signal", beats: "shield", tone: "from-violet-300 to-fuchsia-300", symbol: "SG" },
  { id: "strike", label: "Strike", beats: "signal", tone: "from-orange-300 to-red-400", symbol: "ST" },
] as const;

type Choice = (typeof choices)[number]["id"];
type Proof = { label: string; signature: string; route: "MagicBlock ER" | "Solana Devnet"; memo: string };

export default function Home() {
  const [wallet, setWallet] = useState<string>("");
  const [room, setRoom] = useState("gas-round-8842");
  const [amount, setAmount] = useState("0.05 SOL");
  const [move, setMove] = useState<Choice>("shield");
  const [nonce, setNonce] = useState(() => Math.random().toString(36).slice(2, 10));
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState("");
  const [opponentMove, setOpponentMove] = useState<Choice>("strike");

  const commitment = useMemo(() => hashMove(room, move, nonce), [room, move, nonce]);
  const result = useMemo(() => resolveDuel(move, opponentMove), [move, opponentMove]);
  const invite = typeof window !== "undefined" ? `${window.location.origin}?room=${encodeURIComponent(room)}` : "";

  async function onConnect() {
    setError("");
    setBusy("connect");
    try {
      setWallet(await connectWallet());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connection failed");
    } finally {
      setBusy("");
    }
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
    <main className="kaching-stage min-h-screen overflow-hidden bg-[#070806] text-[#fff7e8]">
      <div className="coin-rain" />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <Image src="/brand-logo.png" alt="Ka-Ching ER logo" width={56} height={56} className="token-logo h-14 w-14 rounded-full object-cover" priority />
          <div>
            <p className="kaching-title text-2xl uppercase text-amber-300">Ka-Ching ER</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-200/70">MagicBlock decision wallet</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a className="hidden h-11 items-center rounded-full border border-amber-300/25 px-4 font-mono text-xs uppercase tracking-[0.18em] text-amber-100 hover:bg-amber-300/10 sm:inline-flex" href="/judge">
            Judge Proof
          </a>
          <button onClick={onConnect} className="inline-flex h-11 items-center gap-2 rounded-full bg-amber-300 px-4 text-sm font-black uppercase text-black transition hover:bg-emerald-200">
            {busy === "connect" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            {wallet ? shortKey(wallet) : "Connect"}
          </button>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-5 px-5 pb-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="console-rail order-2 rounded-lg border border-amber-300/20 bg-black/45 p-4 lg:order-1">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-200/70">Room</p>
          <input value={room} onChange={(e) => setRoom(e.target.value)} className="mt-3 h-12 w-full rounded-md border border-white/10 bg-[#11130d] px-3 font-mono text-sm outline-none focus:border-amber-300" />
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-amber-200/70">Shared pot</p>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-3 h-12 w-full rounded-md border border-white/10 bg-[#11130d] px-3 font-mono text-sm outline-none focus:border-amber-300" />
          <div className="mt-5 rounded-md border border-emerald-300/20 bg-emerald-300/10 p-3">
            <ShieldCheck className="mb-2 h-5 w-5 text-emerald-200" />
            <p className="text-sm font-semibold">Commit/reveal lane</p>
            <p className="mt-1 text-xs leading-5 text-emerald-50/70">Move hash goes through MagicBlock ER, final payer proof settles to Solana devnet memo.</p>
          </div>
        </aside>

        <section className="duel-table order-1 min-h-[620px] rounded-[32px] border border-amber-300/25 bg-[#151108]/90 p-5 shadow-2xl shadow-black/50 lg:order-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-emerald-200">Devnet Live</p>
              <h1 className="kaching-headline mt-3 max-w-3xl text-5xl uppercase leading-[0.92] text-white sm:text-7xl">
                Pick the payer. Keep the squad moving.
              </h1>
            </div>
            <div className="rounded-full border border-amber-300/25 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-amber-100">{proofs.length} tx</div>
          </div>

          <div className="relative mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-3 sm:gap-6">
            {choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => setMove(choice.id)}
                className={`move-token group aspect-square rounded-full border p-3 transition duration-300 ${move === choice.id ? "active-token border-amber-200" : "border-white/10 hover:border-amber-200/60"}`}
              >
                <span className={`grid h-full place-items-center rounded-full bg-gradient-to-br ${choice.tone} text-3xl font-black text-black shadow-inner sm:text-5xl`}>
                  {choice.symbol}
                </span>
                <span className="mt-4 block text-center text-sm font-black uppercase tracking-[0.12em] text-white">{choice.label}</span>
                <span className="block text-center font-mono text-[11px] uppercase text-white/45">beats {choice.beats}</span>
              </button>
            ))}
          </div>

          <div className="mt-16 grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="rounded-lg border border-white/10 bg-black/35 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Commitment hash</p>
                <button onClick={() => navigator.clipboard.writeText(commitment)} className="rounded-md border border-white/10 p-2 text-white/60 hover:text-white" aria-label="Copy commitment hash">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 break-all font-mono text-xs text-amber-200">{commitment}</p>
              <button onClick={() => setNonce(Math.random().toString(36).slice(2, 10))} className="mt-3 rounded-full border border-amber-300/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100 hover:bg-amber-300/10">
                nonce {nonce}
              </button>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/35 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Opponent</p>
              <select value={opponentMove} onChange={(e) => setOpponentMove(e.target.value as Choice)} className="mt-3 h-11 w-full rounded-md border border-white/10 bg-[#11130d] px-3 text-sm">
                {choices.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
              </select>
              <p className="mt-4 flex items-center gap-2 text-lg font-black"><Swords className="h-5 w-5 text-amber-300" /> {result}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button disabled={!wallet || Boolean(busy)} onClick={() => writeProof("Commit move", "MagicBlock ER", `KACHING_ER_COMMIT:${room}:${amount}:${commitment}`)} className="h-14 rounded-full bg-amber-300 font-black uppercase text-black transition hover:bg-emerald-200 disabled:opacity-40">
              {busy === "Commit move" ? "Signing" : "Commit ER"}
            </button>
            <button disabled={!wallet || Boolean(busy)} onClick={() => writeProof("Reveal move", "MagicBlock ER", `KACHING_ER_REVEAL:${room}:${move}:${nonce}`)} className="h-14 rounded-full border border-white/15 font-black uppercase hover:bg-white/10 disabled:opacity-40">
              Reveal
            </button>
            <button disabled={!wallet || Boolean(busy)} onClick={() => writeProof("Settle payer", "Solana Devnet", `KACHING_ER_SETTLE:${room}:${result}:${amount}`)} className="h-14 rounded-full border border-emerald-300/40 bg-emerald-300/10 font-black uppercase text-emerald-100 hover:bg-emerald-300/20 disabled:opacity-40">
              Settle L1
            </button>
          </div>
          {error ? <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</p> : null}
        </section>

        <aside className="proof-strip order-3 rounded-lg border border-white/10 bg-black/50 p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <p className="font-black uppercase">Proof tape</p>
            <CheckCircle2 className="h-5 w-5 text-amber-300" />
          </div>
          <div className="mt-3 grid max-h-[520px] gap-3 overflow-auto pr-1">
            {proofs.length === 0 ? (
              <p className="py-8 text-center text-sm text-white/45">Connect a devnet wallet and run the three actions.</p>
            ) : proofs.map((proof) => (
              <a key={proof.signature} href={explorerTx(proof.signature)} target="_blank" rel="noreferrer" className="rounded-md border border-white/10 bg-white/[0.04] p-3 transition hover:border-amber-300/40">
                <span className="flex items-center justify-between gap-3 text-sm font-bold">{proof.label}<ExternalLink className="h-4 w-4 text-amber-200" /></span>
                <span className="mt-1 block font-mono text-[11px] uppercase text-white/40">{proof.route}</span>
                <span className="mt-2 block break-all font-mono text-xs text-amber-200">{proof.signature}</span>
              </a>
            ))}
          </div>
          <button onClick={() => navigator.clipboard.writeText(invite)} className="mt-4 h-11 w-full rounded-full border border-white/10 font-mono text-xs uppercase tracking-[0.14em] text-white/80 hover:bg-white/10">
            Copy Invite
          </button>
        </aside>
      </section>
    </main>
  );
}
