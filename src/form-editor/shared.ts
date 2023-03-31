import { IEditorItem, uniqueItem } from "../shared/types";

export const compareItems = (a: IEditorItem, b: IEditorItem) => {
    const nameA = a.itemName.toUpperCase(); // ignore upper and lowercase
    const nameB = b.itemName.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }

    // names must be equal
    return 0;
}
const mapItemToUniqueitem = (editorItem: IEditorItem): uniqueItem => {
    return { uuid: editorItem.uuid, name: editorItem.itemName }
}