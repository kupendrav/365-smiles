import { Suspense } from "react";
import { MedicineSupportClient } from "./client";

export const dynamic = "force-dynamic";

export default function MedicineDonatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
      <MedicineSupportClient />
    </Suspense>
  );
}
