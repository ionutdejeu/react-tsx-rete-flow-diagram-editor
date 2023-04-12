import { ClassicPreset } from "rete";
import { socket } from "./socket";
import { IEditorAction, IEditorItem } from "../../shared/types";


export class DynamicNode extends ClassicPreset.Node<
    { input: ClassicPreset.Socket },
    {
        [key in string]: ClassicPreset.Socket
    },
    {
        value: ClassicPreset.InputControl<"text">
    }
> {
    height = 190;
    width = 180;
    item: IEditorItem | null = null;
    constructor(i: IEditorItem) {
        super(i.itemName);
        this.item = i
        this.id = i.uuid
        const input = new ClassicPreset.Input(socket, "Input");
        input.addControl(
            new ClassicPreset.InputControl("number", { initial: 0 })
        );
        this.addInput("input", input)
        this.addControl(
            "value",
            new ClassicPreset.InputControl("text", {
                readonly: false
            })
        );

        this.addOutput("next", new ClassicPreset.Output(socket, "next"));
        this.addOutput("errors", new ClassicPreset.Output(socket, "errors"));
    }

    data(inputs: { left?: number[]; right?: number[] }): { value: string } {
        const leftControl = this.inputs.input?.control as ClassicPreset.InputControl<
            "number"
        >;

        const { left, right } = inputs;
        const value = "dwada"
        this.controls.value.setValue("");

        return { value };
    }
}
