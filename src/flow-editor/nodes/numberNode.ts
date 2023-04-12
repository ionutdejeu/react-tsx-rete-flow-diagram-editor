import { ClassicPreset } from "rete";
import { socket } from "./socket";
export class NumberNode extends ClassicPreset.Node<
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