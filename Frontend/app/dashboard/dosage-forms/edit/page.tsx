import React, { Suspense } from "react";
import EditDosageClient from "./EditDosageClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading edit form</div>}>
      <EditDosageClient />
    </Suspense>
  );
}
