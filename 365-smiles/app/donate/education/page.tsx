import { Suspense } from "react";
import { EducationClient } from "./client";

export const dynamic = "force-dynamic";

export default function EducationDonatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
      <EducationClient />
    </Suspense>
  );
}
