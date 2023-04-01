import { createRoot } from "react-dom/client";
import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin } from "rete-connection-plugin";
import {
    ReactRenderPlugin,
    Presets,
    ReactArea2D
} from "rete-react-render-plugin";

import {
    ContextMenuExtra,
    ContextMenuPlugin,
    Presets as ContextMenuPresets
} from "rete-context-menu-plugin";
import { DataflowEngine } from "rete-engine";

import { AutoArrangePlugin } from "rete-auto-arrange-plugin";
import { CustomNode, CustomNodeElemeValue } from "../nodes/customNode";
import { StartNode } from "../nodes/startNode";
import { EndNode } from "../nodes/endNode";
import { AddNode } from "../nodes/addNode";
import { NumberNode } from "../nodes/numberNode";
import { DynamicNode } from "../nodes/dynamicNode";
import { AreaNodePickedEventType, IEditorItem } from "../../shared/types";
import { CustomSocket } from "../nodes/customSocket";
import { CustomConnection } from "../nodes/CustomConnection";
import { addCustomBackground } from "../nodes/custom-background";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";


class Connection<
    A extends Node,
    B extends Node
> extends ClassicPreset.Connection<A, B> { }

type Node = NumberNode | AddNode | DynamicNode;
type ConnProps = Connection<NumberNode, AddNode> | Connection<AddNode, AddNode> |
    Connection<DynamicNode, DynamicNode>
type Schemes = GetSchemes<Node, ConnProps>;

type AreaExtra = ReactArea2D<any> | ContextMenuExtra<Schemes>;


export type ReteEditorContextType = {
    editor: NodeEditor<Schemes> | undefined;
    area: AreaPlugin<Schemes, AreaExtra> | undefined;
    connection: ConnectionPlugin<Schemes, AreaExtra> | undefined;
    render: ReactRenderPlugin<Schemes> | undefined;
    arrange: AutoArrangePlugin<Schemes> | undefined;
    engine: DataflowEngine<Schemes> | undefined;
    destroy: (() => void) | undefined,
    itemAddedEventHandler: ((i: IEditorItem) => void) | undefined
}

const reteContextDefaultValue: ReteEditorContextType = {
    editor: undefined,
    area: undefined,
    connection: undefined,
    render: undefined,
    arrange: undefined,
    engine: undefined,
    itemAddedEventHandler: undefined,
    destroy: undefined
}


async function useCreateEditorInstance(container: HTMLElement): Promise<ReteEditorContextType> {
    const editorRef = useRef(new NodeEditor<Schemes>());
    const areaRef = useRef(new AreaPlugin<Schemes, AreaExtra>(container));
    const connectionRef = useRef(new ConnectionPlugin<Schemes, AreaExtra>());
    const renderRef = useRef(new ReactRenderPlugin<Schemes>({ createRoot }));
    const arrangeRef = useRef(new AutoArrangePlugin<Schemes>());
    const engineRef = useRef(new DataflowEngine<Schemes>());


    function process() {
        engineRef.current.reset();

        editorRef.current
            .getNodes()
            .filter((n) => n instanceof AddNode)
            .forEach((n) => engineRef.current.fetch(n.id));
    }

    const contextMenu = new ContextMenuPlugin<Schemes, AreaExtra>({
        items: ContextMenuPresets.classic.setup([
            ["Number", () => new NumberNode(0, process)],
            ["Add", () => new AddNode(process, (n) => areaRef.current.update("node", n.id))]
        ])
    });
    areaRef.current.use(contextMenu);
    areaRef.current.addPipe((middlware) => {
        if (["nodepicked"].includes(middlware.type)) {
            let e = middlware as AreaNodePickedEventType
            let n = editorRef.current.getNode(e.data.id)
            console.log('area', 'addPipe', e, n)
        }
        return middlware
    })
    AreaExtensions.selectableNodes(areaRef.current, AreaExtensions.selector(), {
        accumulating: AreaExtensions.accumulateOnCtrl()
    });

    renderRef.current.addPreset(Presets.contextMenu.setup());
    //render.addPreset(Presets.classic.setup({ area }));
    renderRef.current.addPreset(
        Presets.classic.setup({
            area: areaRef.current,
            customize: {
                node(context) {
                    return CustomNode;
                },
                socket(context) {
                    return CustomSocket;
                },
                connection(context) {
                    return CustomConnection;
                }
            }
        })
    );
    addCustomBackground(areaRef.current);

    editorRef.current.use(engineRef.current);
    editorRef.current.use(areaRef.current);
    areaRef.current.use(connectionRef.current);
    areaRef.current.use(renderRef.current);
    areaRef.current.use(arrangeRef.current);

    AreaExtensions.simpleNodesOrder(areaRef.current);
    AreaExtensions.showInputControl(areaRef.current);

    editorRef.current.addPipe((context) => {
        if (["connectioncreated", "connectionremoved"].includes(context.type)) {
            process();
        }
        return context;
    });

    editorRef.current.addPipe((context) => {
        console.log('addPipe', 'click', context)
        return context;
    })

    const onItemAddedCallbackHandle = (item: IEditorItem) => {
        console.log('onItemAddedCallbackHandle', item)
        const newN = new DynamicNode();
        editorRef.current.addNode(newN).then((v) => {
            return v
        });
    }
    const a = new NumberNode(1, process);
    const b = new NumberNode(1, process);
    const c = new AddNode(process, (n) => areaRef.current.update("node", n.id));

    const con1 = new Connection(a, "value", c, "left");
    const con2 = new Connection(b, "value", c, "right");

    await editorRef.current.addNode(a);
    await editorRef.current.addNode(b);
    await editorRef.current.addNode(c);

    await editorRef.current.addConnection(con1);
    await editorRef.current.addConnection(con2);

    await arrangeRef.current.layout();
    await arrangeRef.current.layout({
        options: {

        }
    })
    AreaExtensions.zoomAt(areaRef.current, editorRef.current.getNodes());
    return {
        editor: editorRef.current,
        area: areaRef.current,
        connection: connectionRef.current,
        render: renderRef.current,
        arrange: arrangeRef.current,
        engine: engineRef.current,
        destroy: () => areaRef.current.destroy(),
        itemAddedEventHandler: onItemAddedCallbackHandle
    }
}

export function useReteEditor() {
    const editorInstance = useContext(ReteEditorContextValue);
    if (!editorInstance) {
        throw new Error("Store not found");
    }

    const [state, setState] = useState(editorInstance)

    return [editorInstance.editorInstance]

}
export function useDefaultReteEditor(){
    const [initInProgress,setInitiInProgress] = useState(false);
    const editorInstance = useRef<ReteEditorContextType>(reteContextDefaultValue);
    return {initInProgress,setInitiInProgress, editorInstance };
}
export function useReteEditorCreator() {
    
    const reteContext = useContext(ReteEditorContextValue)
    const [container, setContainer] = useState(null);
    const editorRef = useRef<NodeEditor<Schemes> | null>(null);
    const areaRef = useRef<AreaPlugin<Schemes, AreaExtra> | null>(null);
    const connectionRef = useRef<ConnectionPlugin<Schemes, AreaExtra> | null>(null);
    const renderRef = useRef<ReactRenderPlugin<Schemes> | null>(null);
    const arrangeRef = useRef<AutoArrangePlugin<Schemes> | null>(null);
    const engineRef = useRef<DataflowEngine<Schemes> | null>(null);

    const createInstace = async (container: HTMLElement) => {
        editorRef.current = new NodeEditor<Schemes>();
        areaRef.current = new AreaPlugin<Schemes, AreaExtra>(container);
        connectionRef.current = new ConnectionPlugin<Schemes, AreaExtra>();
        renderRef.current = new ReactRenderPlugin<Schemes>({ createRoot });
        arrangeRef.current = new AutoArrangePlugin<Schemes>();
        engineRef.current = new DataflowEngine<Schemes>();

        function process() {
            engineRef.current?.reset();

            editorRef.current?.getNodes()
                .filter((n) => n instanceof AddNode)
                .forEach((n) => engineRef.current?.fetch(n.id));
        }

        const contextMenu = new ContextMenuPlugin<Schemes, AreaExtra>({
            items: ContextMenuPresets.classic.setup([
                ["Number", () => new NumberNode(0, process)],
                ["Add", () => new AddNode(process, (n) => areaRef.current?.update("node", n.id))]
            ])
        });
        areaRef.current.use(contextMenu);
        areaRef.current.addPipe((middlware) => {
            if (["nodepicked"].includes(middlware.type)) {
                let e = middlware as AreaNodePickedEventType
                let n = editorRef.current?.getNode(e.data.id)
                console.log('area', 'addPipe', e, n)
            }
            return middlware
        })
        AreaExtensions.selectableNodes(areaRef.current, AreaExtensions.selector(), {
            accumulating: AreaExtensions.accumulateOnCtrl()
        });

        renderRef.current.addPreset(Presets.contextMenu.setup());
        //render.addPreset(Presets.classic.setup({ area }));
        renderRef.current.addPreset(
            Presets.classic.setup({
                area: areaRef.current,
                customize: {
                    node(context) {
                        return CustomNode;
                    },
                    socket(context) {
                        return CustomSocket;
                    },
                    connection(context) {
                        return CustomConnection;
                    }
                }
            })
        );
        addCustomBackground(areaRef.current);

        editorRef.current.use(engineRef.current);
        editorRef.current.use(areaRef.current);
        areaRef.current.use(connectionRef.current);
        areaRef.current.use(renderRef.current);
        areaRef.current.use(arrangeRef.current);

        AreaExtensions.simpleNodesOrder(areaRef.current);
        AreaExtensions.showInputControl(areaRef.current);

        editorRef.current.addPipe((context) => {
            if (["connectioncreated", "connectionremoved"].includes(context.type)) {
                process();
            }
            return context;
        });

        editorRef.current.addPipe((context) => {
            console.log('addPipe', 'click', context)
            return context;
        })

        const onItemAddedCallbackHandle = (item: IEditorItem) => {
            console.log('onItemAddedCallbackHandle', item)
            const newN = new DynamicNode();
            editorRef.current?.addNode(newN).then((v) => {
                return v
            });
        }
        const a = new NumberNode(1, process);
        const b = new NumberNode(1, process);
        const c = new AddNode(process, (n) => areaRef.current?.update("node", n.id));

        const con1 = new Connection(a, "value", c, "left");
        const con2 = new Connection(b, "value", c, "right");

        await editorRef.current.addNode(a);
        await editorRef.current.addNode(b);
        await editorRef.current.addNode(c);

        await editorRef.current.addConnection(con1);
        await editorRef.current.addConnection(con2);

        await arrangeRef.current.layout();
        await arrangeRef.current.layout({
            options: {

            }
        })
        AreaExtensions.zoomAt(areaRef.current, editorRef.current.getNodes());
        let newEditorInstance = {
            editor: editorRef.current,
            area: areaRef.current,
            connection: connectionRef.current,
            render: renderRef.current,
            arrange: arrangeRef.current,
            engine: engineRef.current,
            destroy: () => areaRef.current?.destroy(),
            itemAddedEventHandler: onItemAddedCallbackHandle
        }

        //setEditorIstance({...newEditorInstance})
        //editorInstance.current = newEditorInstance
        return newEditorInstance
    }
    useEffect(() => {
        if (container && reteContext!=null && !reteContext.initInProgress) {
            reteContext?.setInitiInProgress(true)
            createInstace(container).then((i: ReteEditorContextType) => {
                console.log('setEditorIstance', i)
                //setEditorIstance({...i})
                reteContext.editorInstance.current = i
            })
        }
    }, [container]);

    useEffect(() => {
        return () => {
            //if (editorInstance && editorInstance.destroy != undefined) {
            //    editorInstance.destroy()
            //}
            if (reteContext?.editorInstance.current && reteContext.editorInstance.current.destroy != undefined) {
                reteContext?.editorInstance.current?.destroy()
            }
        };
    }, []);
    console.log('createEditorInstance new value', reteContext?.editorInstance)
    return { setContainer };
}
type UseReteEditorContextType = ReturnType<typeof useDefaultReteEditor>;

export const ReteEditorContextValue = createContext<UseReteEditorContextType | null>(null);

export function ReteEditorProvider({ children }: { children: React.ReactNode }) {
    return (
        <ReteEditorContextValue.Provider value={(useDefaultReteEditor())}>
            {children}
        </ReteEditorContextValue.Provider>
    )
}

export function useReteEditorReducer() {
    const editorInstance = useContext(ReteEditorContextValue);
    console.log("useReteEditorReducer", editorInstance)
    if (!editorInstance) {
        throw new Error("Store not found");
    }
    return [editorInstance]
}