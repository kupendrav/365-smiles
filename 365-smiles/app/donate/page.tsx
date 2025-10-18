import { Suspense } from "react";
import { DonateClient } from "./client";

export const dynamic = "force-dynamic";

export default function DonatePage() {
  return (
    <Suspense fallback={<div className="relative min-h-screen w-full overflow-hidden bg-black text-white grid place-items-center"><div className="absolute inset-0 bg-black/50" /><p className="relative z-10 text-center text-lg md:text-xl">Checking availability</p></div>}>
      <DonateClient />
    </Suspense>
  );
}
