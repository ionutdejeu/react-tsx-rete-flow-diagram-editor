import { ClassicPreset } from "rete";


export class EndNode extends ClassicPreset.Node<
    {},
    { value: ClassicPreset.Socket },
    { value: ClassicPreset.InputControl<"text"> }
> {


    constructor(string:string) {
        super(string);
        
    }
    
    
    data(): { value: number } {
        return {
            value: 0
        };
    }
}