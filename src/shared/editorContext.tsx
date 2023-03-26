import React, { useRef, createContext, useContext, useCallback, useState, useEffect } from "react";
import { ClassicPreset } from "rete";
import { IEditorItem, ISyncActions, StoreItemType } from './types'


export type StoreType = {
    formItems: any[],
    editorNodes: ClassicPreset.Node[]
    onEditorItemSelect: (node: ClassicPreset.Node) => void
    onTableOfContentItemSelected: (i: IEditorItem) => void
}

const editorContextValue: StoreType = {
    formItems: [],
    editorNodes: [],
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
        console.log('updated store', store.current)
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
function useSubscriptionStoreData(): {
    get: () => StoreType;
    set: (value: Partial<StoreType>) => void;
    subscribeStore: (callback: () => void) => () => void;
    notifyTopic: (topicName: string, i: IEditorItem) => void;
    subscribeTopic: (topicName: string, callback: (i: IEditorItem) => void) => () => void;
} {

    const store = useRef<StoreType>(editorContextValue);
    const get = useCallback(() => store.current, []);
    const set = (value: Partial<StoreType>) => {
        store.current = { ...store.current, ...value }
        console.log('updated store', store.current)
        subscribersList.current.forEach((callback) => callback())
    }
    const subscribersList = useRef(new Set<() => void>());
    const subscribeStore = useCallback((callback: () => void) => {
        subscribersList.current.add(callback)
        return () => subscribersList.current.delete(callback)
    }, [])

    const subscribersTopics = useRef(new Map<string, Set<(i: IEditorItem) => void>>)

    const subscribeTopic = useCallback((topicName: string, callback: (i: IEditorItem) => void) => {
        if (subscribersTopics.current && subscribersTopics.current.has(topicName)) {
            let callbacks = subscribersTopics.current.get(topicName)
            callbacks?.add(callback)
            subscribersTopics.current.set(topicName, callbacks || new Set())
        } else {
            let callbacks = new Set<(i: IEditorItem) => void>([callback])
            subscribersTopics.current.set(topicName, callbacks)
        }
        return () => {
            if (subscribersTopics.current && subscribersTopics.current.has(topicName)) {
                let callbacks = subscribersTopics.current.get(topicName)
                callbacks?.delete(callback)
                subscribersTopics.current.set(topicName, callbacks || new Set())
            }
        }
    }, [])

    const notifyTopic = useCallback((topicName: string, i: IEditorItem) => {
        //subscribersTopics.current.map()
        let subs = subscribersTopics.current.get(topicName)
        subs?.forEach((s) => {
            console.log("store notifyTopic", i)
            s(i)
        })
    }, [])

    return {
        get,
        set,
        subscribeStore,
        notifyTopic,
        subscribeTopic
    }
}
export function useStoreValue<SelectorOutput>(
    selector: (store: StoreType) => SelectorOutput
): [SelectorOutput, (value: Partial<StoreType>) => void] {
    const store = useContext(EditorContextValue);
    if (!store) {
        throw new Error("Store not found");
    }

    const [state, setState] = useState(store.get())
    useEffect(() => {
        return store.subscribeStore(() => { setState(store.get()) })
    }, [])
    return [selector(store.get()), store.set]
}
type UseStoreDataReturnType = ReturnType<typeof useSubscriptionStoreData>;

const EditorContextValue = createContext<UseStoreDataReturnType | null>(null);

/**
 * This hook is to be used in any component
 * @returns 
 */
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
        return store.subscribeStore(() => { setState(store.get()) })
    }, [])
    return [store.get(), store.set]
}



export function useEditorWithSubscription(): [
    StoreType,
    (value: Partial<StoreType>) => void,
    (topicName: string, i: IEditorItem) => void,
    (topicName: string, callback: (i: IEditorItem) => void) => () => void
] {
    const store = useContext(EditorContextValue);
    if (!store) {
        throw new Error("Store not found")
    }
    const [state, setState] = useState(store.get())
    useEffect(() => {
        return store.subscribeStore(() => { setState(store.get()) })
    }, [])
    return [store.get(), store.set, store.notifyTopic, store.subscribeTopic]
}




export function Provider({ children }: { children: React.ReactNode }) {
    return (
        <EditorContextValue.Provider value={useSubscriptionStoreData()}>
            {children}
        </EditorContextValue.Provider>
    )
}