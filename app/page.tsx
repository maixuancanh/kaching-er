"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Loader2, ShieldCheck, Swords, Wallet } from "lucide-react";
import { connectWallet, explorerTx, hashMove, resolveDuel, sendMemoProof, shortKey } from "@/lib/solana";

const choices = [
  { id: "shield", label: "Shield", beats: "strike", tone: "from-cyan-400 to-emerald-300" },
  { id: "signal", label: "Signal", beats: "shield", tone: "from-violet-400 to-fuchsia-300" },
  { id: "strike", label: "Strike", beats: "signal", tone: "from-orange-400 to-red-400" },
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

  async function onConnect() {
    setError("");
    setBusy("connect");
    try {
      const key = await connectWallet();
      setWallet(key);
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

  const invite = typeof window !== "undefined" ? `${window.location.origin}?room=${encodeURIComponent(room)}` : "";

  return (
    <main className="min-h-screen bg-[#101113] text-stone-100">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-8 px-5 py-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="flex flex-col justify-between gap-8 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/brand-logo.png" alt="Ka-Ching ER logo" width={48} height={48} className="h-12 w-12 rounded-lg object-cover" priority />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">Ka-Ching ER</p>
                <p className="text-xs text-stone-400">MagicBlock decision wallet</p>
              </div>
            </div>
            <a className="text-sm text-stone-300 underline-offset-4 hover:text-white hover:underline" href="/judge">
              Judge Proof
            </a>
          </nav>

          <div className="max-w-xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              <ShieldCheck className="h-4 w-4" /> ER commit/reveal
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] text-white sm:text-6xl">
              Decide who pays without slowing the squad down.
            </h1>
            <p className="mt-5 text-lg leading-8 text-stone-300">
              Ka-Ching ER is a fresh Solana Blitz V7 build inspired by collaborative multisig payment decisions. Squad members
              privately commit moves, reveal together, and settle the payer/executor assignment with verifiable devnet proof.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            {["Private commit", "ER reveal", "L1 settle"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <CheckCircle2 className="mb-3 h-5 w-5 text-orange-300" />
                <p className="font-medium text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#17181b] p-4 shadow-2xl shadow-black/30 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-semibold">Payment Duel Room</h2>
              <p className="text-sm text-stone-400">Create a room, commit privately, reveal, then settle the result.</p>
            </div>
            <button
              onClick={onConnect}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-orange-200"
            >
              {busy === "connect" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
              {wallet ? shortKey(wallet) : "Connect Wallet"}
            </button>
          </div>

          <div className="grid gap-5 py-5">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Room ID</span>
              <input value={room} onChange={(e) => setRoom(e.target.value)} className="h-12 rounded-lg border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-orange-300" />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Shared payment</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-lg border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-orange-300" />
            </label>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Your private move</p>
              <div className="grid grid-cols-3 gap-3">
                {choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => setMove(choice.id)}
                    className={`rounded-lg border p-4 text-left transition ${move === choice.id ? "border-orange-300 bg-orange-300/10" : "border-white/10 bg-black/20 hover:border-white/30"}`}
                  >
                    <div className={`mb-4 h-16 rounded-lg bg-gradient-to-br ${choice.tone}`} />
                    <p className="font-semibold">{choice.label}</p>
                    <p className="text-xs text-stone-400">beats {choice.beats}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Commitment hash</p>
                  <p className="mt-1 break-all font-mono text-xs text-orange-200">{commitment}</p>
                  <p className="mt-2 font-mono text-xs text-stone-500">nonce: {nonce}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setNonce(Math.random().toString(36).slice(2, 10))} className="rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white">
                    New nonce
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(commitment)} className="rounded-md border border-white/10 p-2 text-stone-300 hover:text-white">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <button
                disabled={!wallet || Boolean(busy)}
                onClick={() => writeProof("Commit move", "MagicBlock ER", `KACHING_ER_COMMIT:${room}:${amount}:${commitment}`)}
                className="h-12 rounded-lg bg-orange-500 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy === "Commit move" ? "Signing..." : "Commit via ER"}
              </button>
              <button
                disabled={!wallet || Boolean(busy)}
                onClick={() => writeProof("Reveal move", "MagicBlock ER", `KACHING_ER_REVEAL:${room}:${move}:${nonce}`)}
                className="h-12 rounded-lg border border-white/15 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reveal
              </button>
              <button
                disabled={!wallet || Boolean(busy)}
                onClick={() => writeProof("Settle payer", "Solana Devnet", `KACHING_ER_SETTLE:${room}:${result}:${amount}`)}
                className="h-12 rounded-lg border border-emerald-300/30 bg-emerald-300/10 font-semibold text-emerald-100 transition hover:bg-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Settle L1
              </button>
            </div>

            <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Opponent reveal</span>
                <select value={opponentMove} onChange={(e) => setOpponentMove(e.target.value as Choice)} className="h-11 rounded-lg border border-white/10 bg-[#101113] px-3 text-white">
                  {choices.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
                </select>
              </label>
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Resolver</p>
                <p className="mt-2 flex items-center gap-2 text-lg font-semibold"><Swords className="h-5 w-5 text-orange-300" /> {result}</p>
              </div>
            </div>

            {error ? <p className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</p> : null}

            <div className="rounded-lg border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="font-semibold">Live proof timeline</p>
                <p className="text-xs text-stone-500">{proofs.length} tx</p>
              </div>
              <div className="grid gap-2 p-3">
                {proofs.length === 0 ? (
                  <p className="py-6 text-center text-sm text-stone-500">No signed proof yet. Connect a devnet wallet and run the three steps.</p>
                ) : proofs.map((proof) => (
                  <a key={proof.signature} href={explorerTx(proof.signature)} target="_blank" rel="noreferrer" className="rounded-lg bg-black/20 p-3 hover:bg-black/30">
                    <span className="flex items-center justify-between gap-3 text-sm font-semibold">
                      {proof.label}
                      <ExternalLink className="h-4 w-4 text-stone-500" />
                    </span>
                    <span className="mt-1 block text-xs text-stone-400">{proof.route}</span>
                    <span className="mt-2 block break-all font-mono text-xs text-orange-200">{proof.signature}</span>
                  </a>
                ))}
              </div>
            </div>

            <button onClick={() => navigator.clipboard.writeText(invite)} className="h-11 rounded-lg border border-white/10 text-sm font-semibold text-stone-200 hover:bg-white/10">
              Copy squad invite
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
