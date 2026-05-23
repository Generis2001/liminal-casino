"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAccount } from "wagmi";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { truncateAddress } from "@/lib/utils";

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!address) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive USDC">
      <div className="flex flex-col items-center gap-6 py-4">
        <p className="text-sm text-[var(--text-muted)] text-center">
          Send USDC (Arc Testnet) to this address to fund your Liminal account.
        </p>

        <div className="p-4 bg-white rounded-2xl shadow-xl">
          <QRCodeSVG
            value={address}
            size={200}
            level="H"
            includeMargin={false}
          />
        </div>

        <div className="w-full space-y-2">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            Your Wallet Address
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] font-mono text-sm break-all text-[var(--text-primary)]">
              {address}
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full mt-2"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
