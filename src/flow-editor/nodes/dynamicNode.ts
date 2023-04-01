import { ClassicPreset } from "rete";
import { socket } from "./socket";


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
    constructor() {
        super("DynamicNode");
        const left = new ClassicPreset.Input(socket, "Left");
        left.addControl(
            new ClassicPreset.InputControl("number", { initial: 0 })
        );

        this.addControl(
            "value",
            new ClassicPreset.InputControl("text", {
                readonly: true
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
