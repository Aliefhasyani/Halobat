import React, { Suspense } from "react";
import EditIngredientClient from "./EditIngredientClient";

export default function Page(){
  return (
    <Suspense fallback={<div className="p-6">Loading edit form</div>}>
      <EditIngredientClient />
    </Suspense>
  )
}
