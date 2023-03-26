import { ClassicPreset } from "rete";


export interface IEditorItem {
    parentItem: string;
    itemName: string;
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