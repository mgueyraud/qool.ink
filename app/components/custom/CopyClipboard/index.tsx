import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyClipboard({ url }: { url: string }) {
  const [hasCopied, setHasCopied] = useState(false);

  return (
    <button
      className="ml-2 hidden"
      onClick={() => {
        navigator.clipboard.writeText(url);
        setHasCopied(true);
        setTimeout(() => {
          setHasCopied(false);
        }, 2000);
      }}
    >
      {hasCopied ? (
        <Check width={15} height={15} />
      ) : (
        <Copy width={15} height={15} />
      )}
    </button>
  );
}
