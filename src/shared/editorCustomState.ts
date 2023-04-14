import { useContext } from "react";
import { IEditorAction, IEditorItem, IEditorSubItem, IFormAction } from "./types";
import { EditorContextValue } from "./editorContext";
import { EditorItem } from "../editor-types";


export const EditorActionTypes = { 
    Add:"Add",
    Update:"Update",
    Remove:"Remove",
    AddSubItem:"AddSubItem",
    UpdateSubItem:"UpdateSubItem",
    RemoveSubItem:"RemoveSubItem",
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

export const formActionRemoveSubItem = (i:IEditorSubItem):IEditorAction=>{
    return {
        type:EditorActionTypes.RemoveSubItem,
        payload:i
    }
}
export const formActionAddSubItem = (i:IEditorSubItem):IEditorAction=>{
    return {
        type:EditorActionTypes.AddSubItem,
        payload:i
    }
}
export const formActionUpdateSubItem = (i:IEditorSubItem):IEditorAction=>{
    return {
        type:EditorActionTypes.UpdateSubItem,
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