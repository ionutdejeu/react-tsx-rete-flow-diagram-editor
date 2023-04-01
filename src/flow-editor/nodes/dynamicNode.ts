import { ClassicPreset } from "rete";
import { socket } from "./socket";

export class DynamicNode extends ClassicPreset.Node<
    { input: ClassicPreset.Socket },
    { next: ClassicPreset.Socket },
    { value: ClassicPreset.InputControl<"number"> }
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
            new ClassicPreset.InputControl("number", {
                readonly: true
            })
        );

        this.addOutput("next", new ClassicPreset.Output(socket, "Number"));
    }

    data(inputs: { left?: number[]; right?: number[] }): { value: number } {
        const leftControl = this.inputs.input?.control as ClassicPreset.InputControl<
            "number"
        >;
        
        const { left, right } = inputs;
        const value = 0
        this.controls.value.setValue(value);

        return { value };
    }
}
