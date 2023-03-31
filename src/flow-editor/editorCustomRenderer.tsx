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
import { IEditorItem } from "../shared/types";
import { StartNode } from "./nodes/startNode";
import { CustomNode, CustomNodeElemeValue } from "./nodes/customNode";
import { StyledNode } from "./nodes/styledNode";
import { addCustomBackground } from "./nodes/custom-background";
import { CustomSocket } from "./nodes/customSocket";
import { CustomConnection } from "./nodes/CustomConnection";

const socket = new ClassicPreset.Socket("socket");

interface AreaNodePickedEventType {
    type: 'nodepicked';
    data: {
        id: string;
    }
}

class NumberNode extends ClassicPreset.Node<
    {},
    { value: ClassicPreset.Socket },
    { value: ClassicPreset.InputControl<"number"> }
> {
    height = 120;
    width = 180;

    constructor(initial: number, change?: () => void) {
        super("Number");
        this.addControl(
            "value",
            new ClassicPreset.InputControl("number", { initial, change })
        );
        this.addOutput("value", new ClassicPreset.Output(socket, "Number"));
    }


    data(): { value: number } {
        return {
            value: this.controls.value.value || 0
        };
    }
}

class AddNode extends ClassicPreset.Node<
    { left: ClassicPreset.Socket; right: ClassicPreset.Socket },
    { value: ClassicPreset.Socket },
    { value: ClassicPreset.InputControl<"number"> }
> {
    height = 190;
    width = 180;
    constructor(change?: () => void, private update?: (node: AddNode) => void) {
        super("Add");
        const left = new ClassicPreset.Input(socket, "Left");
        const right = new ClassicPreset.Input(socket, "Right");
        left.addControl(
            new ClassicPreset.InputControl("number", { initial: 0, change })
        );
        right.addControl(
            new ClassicPreset.InputControl("number", { initial: 0, change })
        );

        this.addInput("left", left);
        this.addInput("right", right);
        this.addControl(
            "value",
            new ClassicPreset.InputControl("number", {
                readonly: true
            })
        );

        this.addOutput("value", new ClassicPreset.Output(socket, "Number"));
    }

    data(inputs: { left?: number[]; right?: number[] }): { value: number } {
        const leftControl = this.inputs.left?.control as ClassicPreset.InputControl<
            "number"
        >;
        const rightControl = this.inputs.right
            ?.control as ClassicPreset.InputControl<"number">;

        const { left, right } = inputs;
        const value =
            (left ? left[0] : leftControl.value || 0) +
            (right ? right[0] : rightControl.value || 0);

        this.controls.value.setValue(value);

        if (this.update) this.update(this);

        return { value };
    }
}


class Connection<
    A extends Node,
    B extends Node
> extends ClassicPreset.Connection<A, B> { }

type Node = NumberNode | AddNode | StartNode | CustomNodeElemeValue;
type ConnProps = Connection<NumberNode, AddNode> | Connection<AddNode, AddNode>;
type Schemes = GetSchemes<Node, ConnProps>;

type AreaExtra = ReactArea2D<any> | ContextMenuExtra<Schemes>;

export async function createEditor(container: HTMLElement) {
    const editor = new NodeEditor<Schemes>();
    const area = new AreaPlugin<Schemes, AreaExtra>(container);
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const render = new ReactRenderPlugin<Schemes>({ createRoot });
    const arrange = new AutoArrangePlugin<Schemes>();
    const engine = new DataflowEngine<Schemes>();

    render.addPreset(
        Presets.classic.setup({
            area,
            customize: {
                node(context) {
                    return StyledNode;
                },
            }
        })
    );
    function process() {
        engine.reset();

        editor
            .getNodes()
            .filter((n) => n instanceof AddNode)
            .forEach((n) => engine.fetch(n.id));
    }

    const contextMenu = new ContextMenuPlugin<Schemes, AreaExtra>({
        items: ContextMenuPresets.classic.setup([
            ["Number", () => new NumberNode(0, process)],
            ["Add", () => new AddNode(process, (n) => area.update("node", n.id))]
        ])
    });
    area.use(contextMenu);
    area.addPipe((middlware) => {
        if (["nodepicked"].includes(middlware.type)) {
            let e = middlware as AreaNodePickedEventType
            let n = editor.getNode(e.data.id)
            console.log('area', 'addPipe', e, n)
        }
        return middlware
    })
    AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
        accumulating: AreaExtensions.accumulateOnCtrl()
    });

    render.addPreset(Presets.contextMenu.setup());
    //render.addPreset(Presets.classic.setup({ area }));

    editor.use(engine);
    editor.use(area);
    area.use(connection);
    area.use(render);
    area.use(arrange);

    AreaExtensions.simpleNodesOrder(area);
    AreaExtensions.showInputControl(area);

    editor.addPipe((context) => {
        if (["connectioncreated", "connectionremoved"].includes(context.type)) {
            process();
        }
        return context;
    });

    editor.addPipe((context) => {
        console.log('addPipe', 'click', context)
        return context;
    })

    const a = new NumberNode(1, process);
    const b = new NumberNode(1, process);
    const c = new AddNode(process, (n) => area.update("node", n.id));

    const con1 = new Connection(a, "value", c, "left");
    const con2 = new Connection(b, "value", c, "right");

    await editor.addNode(a);
    await editor.addNode(b);
    await editor.addNode(c);

    await editor.addConnection(con1);
    await editor.addConnection(con2);

    //const a1 = new CustomNodeElemeValue("Override styles");
    //a1.addOutput("a", new ClassicPreset.Output(socket));
    //a1.addInput("a", new ClassicPreset.Input(socket));
    //await editor.addNode(a);

    //const b1 = new ClassicPreset.Node("Fully customized");
    //b1.addOutput("a", new ClassicPreset.Output(socket));
    //b1.addInput("a", new ClassicPreset.Input(socket));
    //await editor.addNode(b);

    //await area.translate(a.id, { x: 0, y: 0 });
    //await area.translate(b.id, { x: 300, y: 0 });

    //await editor.addConnection(new ClassicPreset.Connection(a, "a", b, "a"));


    await arrange.layout();
    AreaExtensions.zoomAt(area, editor.getNodes());

    return () => area.destroy();
}


const createStartNode = () => {
    return new StartNode();
}
export async function createEditorWithSync(container: HTMLElement) {
    const editor = new NodeEditor<Schemes>();
    const area = new AreaPlugin<Schemes, AreaExtra>(container);
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const render = new ReactRenderPlugin<Schemes>({ createRoot });
    const arrange = new AutoArrangePlugin<Schemes>();
    const engine = new DataflowEngine<Schemes>();


    function process() {
        engine.reset();

        editor
            .getNodes()
            .filter((n) => n instanceof AddNode)
            .forEach((n) => engine.fetch(n.id));
    }

    const contextMenu = new ContextMenuPlugin<Schemes, AreaExtra>({
        items: ContextMenuPresets.classic.setup([
            ["Number", () => new NumberNode(0, process)],
            ["Add", () => new AddNode(process, (n) => area.update("node", n.id))]
        ])
    });
    area.use(contextMenu);
    area.addPipe((middlware) => {
        if (["nodepicked"].includes(middlware.type)) {
            let e = middlware as AreaNodePickedEventType
            let n = editor.getNode(e.data.id)
            console.log('area', 'addPipe', e, n)
        }
        return middlware
    })
    AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
        accumulating: AreaExtensions.accumulateOnCtrl()
    });

    render.addPreset(Presets.contextMenu.setup());
    //render.addPreset(Presets.classic.setup({ area }));
    render.addPreset(
        Presets.classic.setup({
            area,
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
    addCustomBackground(area);

    editor.use(engine);
    editor.use(area);
    area.use(connection);
    area.use(render);
    area.use(arrange);

    AreaExtensions.simpleNodesOrder(area);
    AreaExtensions.showInputControl(area);

    editor.addPipe((context) => {
        if (["connectioncreated", "connectionremoved"].includes(context.type)) {
            process();
        }
        return context;
    });

    editor.addPipe((context) => {
        console.log('addPipe', 'click', context)
        return context;
    })

    const onItemAddedCallbackHandle = (item: IEditorItem) => {
        console.log('onItemAddedCallbackHandle', item)
        const newN = new CustomNodeElemeValue(item.itemName, item);
        editor.addNode(newN).then((v) => {
            return v
        });
    }
    const a = new NumberNode(1, process);
    const b = new NumberNode(1, process);
    const c = new AddNode(process, (n) => area.update("node", n.id));

    const con1 = new Connection(a, "value", c, "left");
    const con2 = new Connection(b, "value", c, "right");

    await editor.addNode(createStartNode())
    await editor.addNode(a);
    await editor.addNode(b);
    await editor.addNode(c);

    await editor.addConnection(con1);
    await editor.addConnection(con2);

    await arrange.layout();
    await arrange.layout({
        options: {

        }
    })
    AreaExtensions.zoomAt(area, editor.getNodes());

    return {
        destroy: () => area.destroy(),
        itemAddedEventHandler: onItemAddedCallbackHandle
    }
}

