import { useEffect, useRef, useState } from "react";
import { createEditorWithSync } from "./flow-editor/editorCustomRenderer";
import { ItemsDnd } from "./form-editor/itemsDnd";
import { useReteEditorCreator } from "./flow-editor/state/reteEditorContext";
 
 
export default function App() {
  const ref = useRef(null);
  const {setContainer,dummyValue,editorInstance} = useReteEditorCreator()
  useEffect(() => {
    if (ref.current && ref.current!=null) {
      setContainer(ref.current);
      console.log('createEditorInstance',editorInstance)
      console.log('dummy value app',dummyValue)
    }
  }, [ref.current]);

  return (
    <div className="h-100 w-100">
      <div className="container-fluid no-gutters p-0 m-0 h-100 ">
        <div className="row h-100">
          <div className="col-4 border border-danger" >
            <ItemsDnd></ItemsDnd>
          </div>
          <div className="col w-75">
            <div ref={ref} className="h-100 w-100"></div>
          </div >
        </div >
      </div>
    </div>
  );
}