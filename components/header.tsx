import Image from "next/image";
import { memo } from "react";

import GithubIcon from "@/components/icons/github-icon";
import Link from "next/link";

function Header() {
  return (
    <header className="relative mx-auto flex w-full shrink-0 items-center justify-center py-6">
      <Link href="/" className="flex flex-row items-center gap-3">
        <img
          src="/logo.png"
          alt="Aura.app"
          className="mx-auto h-8 object-contain"
        />
        <span className="text-xl font-semibold text-white">Aura.app</span>
      </Link>

      <div className="absolute right-3">
        <a
          href="https://github.com/Revenn0/llamacoder"
          target="_blank"
          className="ml-auto hidden items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 px-2 py-2 text-sm font-medium text-gray-300 sm:flex"
        >
          <GithubIcon className="h-[18px] w-[18px]" />
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white">GitHub</span>
          </div>
        </a>
      </div>
    </header>
  );
}

export default memo(Header);
