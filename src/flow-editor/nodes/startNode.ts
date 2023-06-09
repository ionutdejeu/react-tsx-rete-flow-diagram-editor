import { ClassicPreset } from "rete";


export class StartNode extends ClassicPreset.Node<
    {},
    { value: ClassicPreset.Socket },
    { value: ClassicPreset.InputControl<"text"> }
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