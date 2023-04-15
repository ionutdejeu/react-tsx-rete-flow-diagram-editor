import { ClassicPreset } from "rete";
import { Socket } from "rete/_types/presets/classic";

export interface uniqueItem {
    uuid: string
    name: string
}
export interface IEditorSubItem {
    outputSocket?:ClassicPreset.Output<ClassicPreset.Socket> | undefined
    uuid: string,
    parentUuid:string,
    name: string;
    nextItem: string
}

export interface IEditorFormData {
    test: IEditorItem[]
}

export interface IEditorItem {
    uuid: string,
    itemName: string;
    subItems: IEditorSubItem[]
    nextItem: string
}
export type StoreItemType = {
    formItemIndex: number,
    formId: string
    item: IEditorItem,
    node?: ClassicPreset.Node
}

export interface ISyncActions<T> {
    onSelect: <T>() => void
    onAdded: <T>(item: T) => void
    onRemoved: <T>(item: T) => void
    onOrderChanged: <T>(itemsChanged: T[]) => void
}
export interface AreaNodePickedEventType {
    type: 'nodepicked';
    data: {
        id: string;
    }
}

export interface IEditorAction {
    type: string,
    payload: IEditorItem | IEditorSubItem
}


export interface IFormAction {
    type: string
    payload: IEditorItem | IEditorSubItem
}

export interface IEditorConnection {
    from: string
    to: string
    label:string
}


export interface IReteEditorAction { 
    payload:IEditorConnection   
}