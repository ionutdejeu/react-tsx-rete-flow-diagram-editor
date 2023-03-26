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
import { socket } from "./socket";


export class StartNode extends ClassicPreset.Node<
    {},
    { value: ClassicPreset.Socket },
    {}
> {
    height = 120;
    width = 180;

    constructor() {
        super("Start");

    }


    data(): { value: number } {
        return {
            value: 0
        };
    }
}