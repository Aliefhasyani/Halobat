import React,{Suspense} from "react";
import EditUserClient from "./EditUserClient";
export default function Page(){
  return (
    <Suspense fallback={<div className='p-6'>Loading edit form</div>}>
      <EditUserClient />
    </Suspense>
  )
}
