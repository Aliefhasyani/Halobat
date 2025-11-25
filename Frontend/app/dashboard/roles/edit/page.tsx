import React,{Suspense} from "react";
import EditRoleClient from "./EditRoleClient";
export default function Page(){
  return (
    <Suspense fallback={<div className='p-6'>Loading edit form</div>}>
      <EditRoleClient />
    </Suspense>
  )
}
