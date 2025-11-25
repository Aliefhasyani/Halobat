import React,{Suspense} from "react";
import EditBrandClient from "./EditBrandClient";
export default function Page(){
  return (
    <Suspense fallback={<div className='p-6'>Loading edit form</div>}>
      <EditBrandClient />
    </Suspense>
  )
}
