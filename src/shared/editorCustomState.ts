import { useContext } from "react";
import { IEditorAction, IEditorItem, IFormAction } from "./types";
import { EditorContextValue } from "./editorContext";
import { EditorItem } from "../editor-types";


export const EditorActionTypes = { 
    Add:"Add",
    Update:"Update",
    Remove:"Remove",
    UpdateName:"UpdateName",
    UpdateNextItem:"UpdateNextItem"
}

export const editorActionCreate = (i:IEditorItem):IEditorAction=>{
    return {
        type:EditorActionTypes.Add,
        payload:i
    }
}

export const editorActionUpdate = (item:IEditorItem):IEditorAction=>{
    return {
        type:EditorActionTypes.Update,
        payload:item
    }
}

export const editorActionDelete = (i:IEditorItem):IEditorAction=>{
    return {
        type:EditorActionTypes.Remove,
        payload:i
    }
}


export const useEditorDispatch = (): {
    dispatch: (action: IFormAction) => void
} => {
    const store = useContext(EditorContextValue);
    if (!store) {
        throw new Error("Store not found")
    }
    const dispatch = (action: IEditorAction) => {

    }

    return {
        dispatch
    }
}