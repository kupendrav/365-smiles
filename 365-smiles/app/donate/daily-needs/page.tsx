import { Suspense } from "react";
import { DailyNeedsClient } from "./client";

export const dynamic = "force-dynamic";

export default function DailyDonatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
      <DailyNeedsClient />
    </Suspense>
  );
}
