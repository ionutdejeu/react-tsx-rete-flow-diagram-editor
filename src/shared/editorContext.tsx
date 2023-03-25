import React, { useRef, createContext, useContext, useCallback, useState, useEffect } from "react";
import { ClassicPreset } from "rete";
import { IEditorItem } from './types'

type StoreItemType = { item: IEditorItem, node: ClassicPreset.Node }
type StoreType = {
    items: {
        [index: string]: StoreItemType
    }
    onEditorItemSelect: (node: ClassicPreset.Node) => void
    onTableOfContentItemSelected: (i: IEditorItem) => void
}

const editorContextValue: StoreType = {
    items: {},
    onEditorItemSelect: (node: ClassicPreset.Node) => { },
    onTableOfContentItemSelected: (i: IEditorItem) => { }
}
function useEditorData(): {
    get: () => StoreType;
    set: (value: Partial<StoreType>) => void;
    subscribe: (callback: () => void) => () => void;
} {

    const store = useRef<StoreType>(editorContextValue);
    const get = useCallback(() => store.current, []);
    const set = (value: Partial<StoreType>) => {
        store.current = { ...store.current, ...value }
        subscribersList.current.forEach((callback) => callback())
    }
    const subscribersList = useRef(new Set<() => void>());

    const subscribe = useCallback((callback: () => void) => {
        subscribersList.current.add(callback)
        return () => subscribersList.current.delete(callback)
    }, [])

    return {
        get,
        set,
        subscribe
    }
}
type UseStoreDataReturnType = ReturnType<typeof useEditorData>;

const EditorContextValue = createContext<UseStoreDataReturnType | null>(null);


export function useEditor(): [
    StoreType,
    (value: Partial<StoreType>) => void
] {
    const store = useContext(EditorContextValue);
    if (!store) {
        throw new Error("Store not found")
    }
    const [state, setState] = useState(store.get())
    useEffect(() => {
        return store.subscribe(() => { setState(store.get()) })
    }, [])
    return [store.get(), store.set]
}

function useEditorWithForm(): [
    StoreType,
    (value: Partial<StoreType>) => void
] {
    const store = useContext(EditorContextValue);
    if (!store) {
        throw new Error("Store not found")
    }
    const [state, setState] = useState(store.get())
    useEffect(() => {
        return store.subscribe(() => { setState(store.get()) })
    }, [])
    return [store.get(), store.set]
}

function Provider({ children }: { children: React.ReactNode }) {
    return (
        <EditorContextValue.Provider value={useEditorData()}>
            {children}
        </EditorContextValue.Provider>
    )
}