import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="UDID Tools home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/20 transition-shadow group-hover:shadow-md group-hover:shadow-blue-500/30">
        <Image width={36} height={36} src="/logo-header.svg" alt="" priority />
      </span>
      <span className="text-xl font-semibold tracking-tight text-slate-900">UDID Tools</span>
    </Link>
  );
}
