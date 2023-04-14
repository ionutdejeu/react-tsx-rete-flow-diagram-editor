import { createRoot } from "react-dom/client";
import { NodeEditor, GetSchemes, ClassicPreset, ConnectionBase } from "rete";
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
import { AreaNodePickedEventType, IEditorAction, IEditorConnection, IEditorItem, IEditorSubItem } from "../../shared/types";
import { CustomSocket } from "../nodes/customSocket";
import { CustomConnection } from "../nodes/CustomConnection";
import { addCustomBackground } from "../nodes/custom-background";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { EditorActionTypes } from "../../shared/editorCustomState";
import { DEFAULT_SELECTED_ITEM_ID } from "../../shared/constants";
import { socket } from "../nodes/socket";
import { constants } from "buffer";


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

export function useReteEditor() {
    const editorInstance = useContext(ReteEditorContextValue);
    if (!editorInstance) {
        throw new Error("Store not found");
    }

    const [state, setState] = useState(editorInstance)

    return [editorInstance.editorInstance]

}
export function useDefaultReteEditor() {
    const [initInProgress, setInitiInProgress] = useState(false);
    const editorInstance = useRef<ReteEditorContextType>(reteContextDefaultValue);
    return { initInProgress, setInitiInProgress, editorInstance };
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
        //
        //
        //const a = new NumberNode(1, process);
        //const b = new NumberNode(1, process);
        //const c = new AddNode(process, (n) => areaRef.current?.update("node", n.id));
        //
        //const con1 = new Connection(a, "value", c, "left");
        //const con2 = new Connection(b, "value", c, "right");
        //
        //await editorRef.current.addNode(a);
        //await editorRef.current.addNode(b);
        //await editorRef.current.addNode(c);
        //
        //await editorRef.current.addConnection(con1);
        //await editorRef.current.addConnection(con2);

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
            itemAddedEventHandler: undefined
        }

        //setEditorIstance({...newEditorInstance})
        //editorInstance.current = newEditorInstance
        return newEditorInstance
    }
    useEffect(() => {
        if (container && reteContext != null && !reteContext.initInProgress) {
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



const handedAddAction = async (action: IEditorAction, editorContext: ReteEditorContextType) => {
    let item = action.payload as IEditorItem
    const newN = new DynamicNode(action.payload as IEditorItem);

    editorContext.editor?.addNode(newN).then((v) => {
        return v
    });
    await editorContext.arrange?.layout();
}
const handleRemoveSubItem = (action: IEditorAction, editorContext: ReteEditorContextType) => {

}
const handleUpdateSubItem = (action: IEditorAction, editorContext: ReteEditorContextType) => {

}
const handleAddSubItem = (action: IEditorAction, editorContext: ReteEditorContextType) => {

}
const handleUpdateAction = async (action: IEditorAction, editorContext: ReteEditorContextType) => {
    let item = action.payload as IEditorItem
    if (!item && item == null) {
        return
    }
    let node = editorContext.editor?.getNode(item.uuid)
    console.log(`found node for id ${item.uuid} `, node, item)
    let editor = editorContext.editor
    if (node) {
        node.label = item.itemName
        editorContext.area?.update("node", node.id)
        // output nodes 
    }
    if (editor) {
        mapEditorConnectionsToMap(editor)
        //check if connections are according to the changed event 

        //output values are according to the changed event 
        // 
    }
    if (node && editor) {
        updateOutputPorts(item, node as DynamicNode)
        updateConnections(item, node as DynamicNode, editor)
    }
    await editorContext.arrange?.layout();

}
const handleDeleteAction = async (action: IEditorAction, editorContext: ReteEditorContextType) => {
    let item = action.payload as IEditorItem
    if (!item && item == null) {
        return
    }
    let node = editorContext.editor?.getNode(item.uuid)
    let editor = editorContext.editor
    if (node && editor) {
        // delete all connections to this node 
        let connctionMap = mapConnectionForItem(item)
        connctionMap = getConnectionsFromMappedItems(connctionMap, editor)
        console.log("connection map", connctionMap)
        await deleteMappedConnections(connctionMap, editor)
        let invConnectionMap = getConnctionToMappedItem(item,editor)
        await deleteMappedConnections(invConnectionMap, editor)
        await editor?.removeNode(item.uuid)
        await editorContext.arrange?.layout();
    }

}
const deleteMappedConnections = async (conMap: Map<IEditorConnection, ConnProps | null>, e: NodeEditor<Schemes>) => {
    for (let [connDescription, connction] of Array.from(conMap.entries())) {
        if (connction) {
            await e.removeConnection(connction?.id)
        }
    }
}
const mapConnectionForItem = (item: IEditorItem) => {
    let connectionSourceOutputToTargetNode = new Map<IEditorConnection, ConnProps | null>();
    connectionSourceOutputToTargetNode.set({ from: item.uuid, label: "next", to: item.nextItem }, null)
    item.subItems.map((subItem) => {
        connectionSourceOutputToTargetNode.set({ from: item.uuid, label: subItem.uuid, to: subItem.nextItem }, null)
    })
    return connectionSourceOutputToTargetNode
}

const getConnectionsFromMappedItems = (connMap: Map<IEditorConnection, ConnProps | null>, e: NodeEditor<Schemes>) => {
    let result = new Map<IEditorConnection, ConnProps | null>();
    connMap.forEach((connction, connDescription) => {
        result.set(connDescription, null)
        e.getConnections().map((c) => {
            if (c.source == connDescription.from
                && c.sourceOutput == connDescription.label) {
                result.set(connDescription, c)
            }
        })
    })

    return result
}
const getConnctionToMappedItem = (item: IEditorItem, e: NodeEditor<Schemes>) => {
    let result = new Map<IEditorConnection, ConnProps | null>();
    e.getConnections().map((c) => {
        if (c.target == item.uuid) {
            result.set({
                from: c.target,
                label: c.sourceOutput,
                to: c.target
            }, c)
        }
    })

    return result
}
const updateConnections = (item: IEditorItem, n: DynamicNode, e: NodeEditor<Schemes>) => {
    let nextConnction: ConnProps | null = null
    let connectionSourceOutputToTargetNode = new Map<string, string>();
    connectionSourceOutputToTargetNode.set("next", item.nextItem)
    item.subItems.map((subItem) => {
        connectionSourceOutputToTargetNode.set(subItem.uuid, subItem.nextItem)
    })
    connectionSourceOutputToTargetNode.forEach((targetUuid, connctionLabel) => {
        let connctionFound: ConnProps | null = null
        e.getConnections().map((c) => {
            if (c.source == item.uuid
                && c.sourceOutput == connctionLabel) {
                connctionFound = c
                console.log('found matching connction for item', item, c)
            }
        })
        if (connctionFound == null) {
            //create it
            let targetNode = e.getNode(targetUuid) as DynamicNode
            if (targetNode) {
                e.addConnection(new Connection(n, connctionLabel, targetNode, "input"));
            } else {
                console.warn("Was not able to find target node for item", item)
            }
        }

        if (connctionFound != null && targetUuid == DEFAULT_SELECTED_ITEM_ID) {
            e.removeConnection(connctionFound['id'])
        }
    })


    e.getConnections().map((c) => {
        if (c.source == item.uuid && c.sourceOutput == "next") {
            nextConnction = c
            //mappedConnections.set([])

        }

    })
    if (nextConnction == null) {
        //create it
        let targetNode = e.getNode(item.nextItem) as DynamicNode
        if (targetNode) {
            e.addConnection(new Connection(n, "next", targetNode, "input"));
        } else {
            console.warn("Was not able to find target node for item", item)
        }
    }
    if (nextConnction && item.nextItem == DEFAULT_SELECTED_ITEM_ID) {
        e.removeConnection(nextConnction['id'])
    }
}
const getRemovedPorts = (item: IEditorItem, n: DynamicNode):string[]=>{
    let subItemsNames = item.subItems.map((i) => i.uuid)
    let outputKeys = Object.keys(n.outputs)
    let removedSubItems = outputKeys.filter(item => (subItemsNames.indexOf(item) < 0 && item != 'next'));
     
    return removedSubItems
}

const deleteConnectionsForRemovedPorts = (item:IEditorItem, n: DynamicNode,e: NodeEditor<Schemes>,removedSubItems:string[])=>{
    if (removedSubItems.length > 0) {
        //remove these keys
        removedSubItems.map(removedOutput => {
            e.getConnections().map(c=>{
                if(c.source == item.uuid){}
            })
        })
    }
}
const updateOutputPorts = (item: IEditorItem, n: DynamicNode) => {

    console.log('updateOutputPorts', n.outputs, item)
    let subItemsNames = item.subItems.map((i) => i.uuid)
    let outputKeys = Object.keys(n.outputs)

    let removedSubItems = outputKeys.filter(item => (subItemsNames.indexOf(item) < 0 && item != 'next'));
    if (removedSubItems.length > 0) {
        //remove these keys
        removedSubItems.map(removedOutput => {
            n.removeOutput(removedOutput)
        })
    }
    
    item.subItems.map((subItem) => {
        if (subItem.outputSocket != undefined) {
            subItem.outputSocket.label = subItem.name
        }
        else {
            n.addOutput(subItem.uuid, new ClassicPreset.Output(socket, subItem.name));
            let newOutput = n.outputs[subItem.uuid]
            subItem.outputSocket = newOutput
        }
    })
}
const updateSubItemsConnections = (item: IEditorItem, n: DynamicNode) => {

}
const mapEditorConnectionsToMap = (e: NodeEditor<Schemes>) => {
    let mappedConnections = new Map<string[], ConnProps>()
    e.getConnections().map((c) => {
        let source = c.source
        //mappedConnections.set([])
        console.log('mapEditorConnectionsToMap', c)
    })
}

const editorStateReducer = async (action: IEditorAction, editorContext: ReteEditorContextType) => {
    switch (action.type) {
        case EditorActionTypes.Add:
            await handedAddAction(action, editorContext)
            break;
        case EditorActionTypes.Update:
            await handleUpdateAction(action, editorContext)
            break;

        case EditorActionTypes.Remove:
            await handleDeleteAction(action, editorContext)
            break;
        default:
            console.log('default action', action)
    }

}
export function useReteEditorReducer(): [
    editorContext: UseReteEditorContextType,
    dispatchEditorAction: (action: IEditorAction) => void
] {
    const editorContext = useContext(ReteEditorContextValue);
    const dispatchEditorAction = useCallback((action: IEditorAction) => {
        if (editorContext?.editorInstance == undefined) {
            throw new Error("Unable to perform add node, the editor is not initialised");
        }
        else if (editorContext?.editorInstance != undefined) {
            editorStateReducer(action, editorContext?.editorInstance.current).then(() => {

            })
        }
    }, [])
    if (!editorContext) {
        throw new Error("Store not found");
    }

    return [editorContext, dispatchEditorAction]
}