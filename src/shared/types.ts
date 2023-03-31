import { ClassicPreset } from "rete";

export interface uniqueItem  {
    uuid:string
    name:string
}
export interface IEditorSubItem {
    name: string;
    nextItem:uniqueItem
}


export interface IEditorItem {
    uuid:string,
    itemName: string;
    subItems:IEditorSubItem[]
    nextItem:uniqueItem
}
export type StoreItemType = {
    formItemIndex: number,
    formId:string
    item: IEditorItem,
    node?: ClassicPreset.Node
}

export interface ISyncActions<T> { 
    onSelect:<T>()=>void
    onAdded:<T>(item:T)=>void
    onRemoved:<T>(item:T)=>void
    onOrderChanged:<T>(itemsChanged:T[])=>void
}