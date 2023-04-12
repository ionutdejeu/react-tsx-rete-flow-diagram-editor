import { createRoot } from "react-dom/client";
import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin } from "rete-connection-plugin";
import {
    ReactRenderPlugin,
    Presets,
    ReactArea2D
} from "rete-react-render-plugin";
import { CustomNode } from "./nodes/customNode";
import { StyledNode } from "./nodes/styledNode";
import { CustomSocket } from "./nodes/customSocket";
import { CustomConnection } from "./nodes/CustomConnection";
import { addCustomBackground } from "./nodes/custom-background";
import { IEditorItem } from "../shared/types";
import { AutoArrangePlugin } from "rete-auto-arrange-plugin";

type Schemes = GetSchemes<
    ClassicPreset.Node,
    ClassicPreset.Connection<any, any>
>;
type AreaExtra = ReactArea2D<any>;

export async function createEditor(container: HTMLElement) {
    const socket = new ClassicPreset.Socket("socket");
  
    const editor = new NodeEditor<Schemes>();
    const area = new AreaPlugin<Schemes, AreaExtra>(container);
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const render = new ReactRenderPlugin<Schemes>({ createRoot });
  
    AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
      accumulating: AreaExtensions.accumulateOnCtrl()
    });
  
    render.addPreset(
      Presets.classic.setup({
        area,
        customize: {
          node(context) {
            if (context.payload.label === "Fully customized") {
              return CustomNode;
            }
            if (context.payload.label === "Override styles") {
              return StyledNode;
            }
            return Presets.classic.Node;
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
  
    editor.use(area);
    area.use(connection);
    area.use(render);
  
    AreaExtensions.simpleNodesOrder(area);
  
    const a = new ClassicPreset.Node("Override styles");
    a.addOutput("a", new ClassicPreset.Output(socket));
    a.addInput("a", new ClassicPreset.Input(socket));
    await editor.addNode(a);
  
    const b = new ClassicPreset.Node("Fully customized");
    b.addOutput("a", new ClassicPreset.Output(socket));
    b.addInput("a", new ClassicPreset.Input(socket));
    await editor.addNode(b);
  
    await area.translate(a.id, { x: 0, y: 0 });
    await area.translate(b.id, { x: 1300, y: 100 });
  
    await editor.addConnection(new ClassicPreset.Connection(a, "a", b, "a"));
     
    setTimeout(() => {
      AreaExtensions.zoomAt(area, editor.getNodes());
    }, 100);
  
    return () => area.destroy();
  }
  