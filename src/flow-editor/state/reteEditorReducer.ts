import { useContext } from "react";
import { ReteEditorContextValue } from "./reteEditorContext";


export function useReteEditorReducer() {
    const editorInstance = useContext(ReteEditorContextValue);
    console.log("useReteEditorReducer",editorInstance)
    if (!editorInstance) {
        throw new Error("Store not found");
    }
    return [editorInstance]
}