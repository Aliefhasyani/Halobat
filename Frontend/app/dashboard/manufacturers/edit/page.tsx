import React,{Suspense} from "react";
import EditManufacturerClient from "./EditManufacturerClient";
export default function Page(){
  return (
    <Suspense fallback={<div className='p-6'>Loading edit form</div>}>
      <EditManufacturerClient />
    </Suspense>
  )
}
