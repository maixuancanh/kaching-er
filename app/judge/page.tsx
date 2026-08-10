import { ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";

const rows = [
  ["Eligibility", "MagicBlock ER endpoint is used for commit/reveal proof transactions against a deployed custom Solana program."],
  ["Creativity", "A squad wallet uses a fast mini-game to resolve shared payment responsibility."],
  ["Technical depth", "Commitment hash, nonce reveal, deterministic resolver, custom program instruction logs, and L1 settlement proof are separated."],
  ["Showcase", "The live app produces clickable devnet proof links from a browser wallet."],
];

const programId = "HieogJcAfZr8jSpRAgJ2PL1wVTt8qU6A34xRYCPggmdP";
const deployTx = "2ZrWv6Tg8EQuXmX84zznHycBu3cUKNWPFgYLdCFM1E7aFgZ6bNznMRxgtqyhUEx8dDnBcE6jDZv8vagxDE9gEQK5";

export default function JudgePage() {
  return (
    <main className="min-h-screen bg-[#101113] px-5 py-8 text-stone-100">
      <section className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-stone-400 hover:text-white">Back to app</Link>
        <div className="mt-8 rounded-xl border border-white/10 bg-[#17181b] p-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">
            <ShieldCheck className="h-4 w-4" /> Judge mode
          </p>
          <h1 className="mt-5 text-4xl font-semibold">Ka-Ching ER Proof Board</h1>
          <p className="mt-4 max-w-3xl leading-7 text-stone-300">
            This independent Blitz V7 submission adapts the collaborative payment-game idea into Solana. The demo flow
            uses MagicBlock ER for fast commit/reveal proof and Solana devnet for final settlement proof.
          </p>

          <div className="mt-8 grid gap-3">
            {rows.map(([label, detail]) => (
              <div key={label} className="grid gap-2 rounded-lg border border-white/10 bg-black/20 p-4 sm:grid-cols-[180px_1fr]">
                <p className="font-semibold text-orange-200">{label}</p>
                <p className="text-stone-300">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-white/10">
            <div className="border-b border-white/10 px-4 py-3 font-semibold">Onchain deployment</div>
            <div className="grid gap-3 p-4 text-sm text-stone-300">
              <a className="break-all text-orange-200 hover:text-orange-100" href={`https://explorer.solana.com/address/${programId}?cluster=devnet`} target="_blank" rel="noreferrer">Program ID: {programId}</a>
              <a className="break-all text-orange-200 hover:text-orange-100" href={`https://explorer.solana.com/tx/${deployTx}?cluster=devnet`} target="_blank" rel="noreferrer">Deploy tx: {deployTx}</a>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-white/10">
            <div className="border-b border-white/10 px-4 py-3 font-semibold">Demo checklist</div>
            <ol className="grid gap-3 p-4 text-sm text-stone-300">
              <li>1. Connect a Solana devnet wallet.</li>
              <li>2. Pick Shield, Signal, or Strike and commit the hash through MagicBlock ER.</li>
              <li>3. Reveal the nonce and move through MagicBlock ER.</li>
              <li>4. Settle the payer assignment on Solana devnet.</li>
              <li>5. Open each generated signature in Solana Explorer and verify the custom program instruction.</li>
            </ol>
          </div>

          <a
            href="https://hackathon.magicblock.app/?utm_source=luma"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-orange-200"
          >
            Blitz V7 criteria <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
