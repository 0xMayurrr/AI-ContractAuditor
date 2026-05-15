"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Search,
  Wallet,
  X,
} from "lucide-react";

interface WalletConnectProps {
  onContractFetched: (code: string, address: string) => void;
}

type Network = "mainnet" | "sepolia" | "goerli" | "polygon" | "arbitrum";

const NETWORKS: { id: Network; label: string; chainId: string; etherscanBase: string; color: string }[] = [
  { id: "mainnet",  label: "Ethereum",  chainId: "0x1",    etherscanBase: "https://api.etherscan.io",          color: "text-blue-400" },
  { id: "sepolia",  label: "Sepolia",   chainId: "0xaa36a7", etherscanBase: "https://api-sepolia.etherscan.io", color: "text-purple-400" },
  { id: "polygon",  label: "Polygon",   chainId: "0x89",   etherscanBase: "https://api.polygonscan.com",        color: "text-violet-400" },
  { id: "arbitrum", label: "Arbitrum",  chainId: "0xa4b1", etherscanBase: "https://api.arbiscan.io",            color: "text-cyan-400" },
];

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export function WalletConnect({ onContractFetched }: WalletConnectProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState("");
  const [network, setNetwork] = useState<Network>("mainnet");
  const [status, setStatus] = useState<"idle" | "connecting" | "fetching" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fetchedName, setFetchedName] = useState("");

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setStatus("error");
      setErrorMsg("MetaMask not detected. Install MetaMask to use this feature.");
      return;
    }
    setStatus("connecting");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      setWalletAddress(accounts[0]);
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMsg("Wallet connection rejected.");
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setStatus("idle");
    setContractAddress("");
    setFetchedName("");
  }, []);

  const fetchContract = useCallback(async () => {
    const addr = contractAddress.trim();
    if (!addr || !/^0x[0-9a-fA-F]{40}$/.test(addr)) {
      setStatus("error");
      setErrorMsg("Enter a valid 0x contract address.");
      return;
    }

    setStatus("fetching");
    setErrorMsg("");

    try {
      const net = NETWORKS.find((n) => n.id === network)!;
      const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY ?? "YourApiKeyToken";
      const url = `${net.etherscanBase}/api?module=contract&action=getsourcecode&address=${addr}&apikey=${apiKey}`;

      const res = await fetch(url);
      const data = await res.json() as {
        status: string;
        result: { SourceCode: string; ContractName: string; ABI: string }[];
      };

      if (data.status !== "1" || !data.result?.[0]?.SourceCode) {
        throw new Error("Contract source not verified on Etherscan. Only verified contracts can be fetched.");
      }

      let source = data.result[0].SourceCode;
      // Handle multi-file JSON format
      if (source.startsWith("{{")) {
        try {
          const inner = JSON.parse(source.slice(1, -1)) as { sources: Record<string, { content: string }> };
          source = Object.values(inner.sources).map((s) => s.content).join("\n\n");
        } catch {
          // use raw
        }
      } else if (source.startsWith("{")) {
        try {
          const inner = JSON.parse(source) as { sources: Record<string, { content: string }> };
          source = Object.values(inner.sources).map((s) => s.content).join("\n\n");
        } catch {
          // use raw
        }
      }

      setFetchedName(data.result[0].ContractName || "Contract");
      setStatus("success");
      onContractFetched(source, addr);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Failed to fetch contract.");
    }
  }, [contractAddress, network, onContractFetched]);

  const shortAddr = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <div className="space-y-3">
      {/* Wallet connection row */}
      {!walletAddress ? (
        <button
          type="button"
          onClick={connectWallet}
          disabled={status === "connecting"}
          className={cn(
            "btn-press group relative w-full overflow-hidden rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3",
            "flex items-center justify-center gap-3 text-sm font-semibold text-violet-300",
            "transition-all duration-300 hover:border-violet-400/50 hover:bg-violet-500/20 hover:shadow-lg hover:shadow-violet-500/20",
            "disabled:opacity-50"
          )}
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-violet-500/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {status === "connecting" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          {status === "connecting" ? "Connecting…" : "Connect MetaMask"}
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />
            </div>
            <span className="font-mono text-xs text-emerald-300">{shortAddr(walletAddress)}</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">Connected</span>
          </div>
          <button type="button" onClick={disconnectWallet} className="text-zinc-600 transition hover:text-zinc-400">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Network selector */}
      <div className="grid grid-cols-4 gap-1.5">
        {NETWORKS.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setNetwork(n.id)}
            className={cn(
              "rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition-all duration-200",
              network === n.id
                ? cn("border-violet-500/40 bg-violet-500/15", n.color)
                : "border-white/5 bg-white/[0.02] text-zinc-600 hover:border-white/10 hover:text-zinc-400"
            )}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* Address input */}
      <div className="relative">
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => { setContractAddress(e.target.value); setStatus("idle"); }}
          placeholder="0x contract address…"
          className={cn(
            "w-full rounded-xl border bg-black/40 px-4 py-3 pr-12 font-mono text-sm text-zinc-200 placeholder:text-zinc-700",
            "transition-all duration-200 focus:outline-none",
            status === "error"
              ? "border-red-500/40 focus:border-red-500/60"
              : "border-white/8 focus:border-violet-500/40 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
          )}
          onKeyDown={(e) => e.key === "Enter" && fetchContract()}
        />
        <button
          type="button"
          onClick={fetchContract}
          disabled={status === "fetching" || !contractAddress.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 transition hover:bg-violet-500/30 disabled:opacity-40"
        >
          {status === "fetching" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Status messages */}
      {status === "error" && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
          <p className="text-xs text-red-300">{errorMsg}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-300">
              <span className="font-semibold">{fetchedName}</span> loaded — ready to analyze
            </span>
          </div>
          <a
            href={`${NETWORKS.find((n) => n.id === network)?.etherscanBase.replace("api.", "").replace("/api", "")}/address/${contractAddress}`}
            target="_blank"
            rel="noreferrer"
            className="text-zinc-600 transition hover:text-zinc-400"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {status === "fetching" && (
        <div className="flex items-center gap-2 rounded-lg border border-violet-500/15 bg-violet-500/5 px-3 py-2">
          <div className="flex gap-1">
            {[0,1,2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: `${i*150}ms` }} />
            ))}
          </div>
          <span className="text-xs text-violet-300">Fetching verified source from Etherscan…</span>
        </div>
      )}
    </div>
  );
}
