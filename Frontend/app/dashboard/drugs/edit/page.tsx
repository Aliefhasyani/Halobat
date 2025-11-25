import React,{Suspense} from "react";
import EditDrugClient from "./EditDrugClient";
export default function Page(){
  return (
    <Suspense fallback={<div className='p-6'>Loading edit form</div>}>
      <EditDrugClient />
    </Suspense>
  )
}
