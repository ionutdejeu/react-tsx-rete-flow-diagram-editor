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
import { CustomNodeElemeValue } from "../nodes/customNode";
import { StartNode } from "../nodes/startNode";
import { EndNode } from "../nodes/endNode";
import { AddNode } from "../nodes/addNode";
import { NumberNode } from "../nodes/numberNode";
import { DynamicNode } from "../nodes/dynamicNode";


class Connection<
    A extends Node,
    B extends Node
> extends ClassicPreset.Connection<A, B> { }

type Node = NumberNode | AddNode | DynamicNode;
type ConnProps = Connection<NumberNode, AddNode> | Connection<AddNode, AddNode> |
    Connection<DynamicNode, DynamicNode>
type Schemes = GetSchemes<Node, ConnProps>;

type AreaExtra = ReactArea2D<any> | ContextMenuExtra<Schemes>;


export type reteContextType = {
    editor: NodeEditor<Schemes> | undefined;
    area: AreaPlugin<Schemes, AreaExtra> | undefined;
    connection: ConnectionPlugin<Schemes, AreaExtra> | undefined;
    render: ReactRenderPlugin<Schemes> | undefined;
    arrange: AutoArrangePlugin<Schemes> | undefined;
    engine: DataflowEngine<Schemes> | undefined;
}

const reteContextDefaultValue: reteContextType = {
    editor: undefined,
    area: undefined,
    connection: undefined,
    render: undefined,
    arrange: undefined,
    engine: undefined
}
