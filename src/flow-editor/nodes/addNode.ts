import { ClassicPreset } from "rete";
import { socket } from "./socket";

export class AddNode extends ClassicPreset.Node<
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
