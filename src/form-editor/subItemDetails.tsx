import React, { Ref, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useForm, useFieldArray, Controller, UseFormRegister, Control, FieldArrayWithId, UseFieldArrayRemove, useController, useWatch, UseFormWatch, UseFormGetValues } from "react-hook-form";

import "./styles.css";
import { IEditorFormData, IEditorItem, IEditorSubItem, StoreItemType, uniqueItem } from "../shared/types";
import { useReteEditorReducer } from "../flow-editor/state/reteEditorContext";
import { editorActionUpdate, formActionAddSubItem, formActionRemoveSubItem, formActionUpdateItem } from "../shared/editorCustomState";
import { Trash2Fill } from "react-bootstrap-icons";

export function SubItemDetails({
    defaultNextItem,
    register, control,
    orderedItems,
    itemIndex,
    remove,
    item,
    subItem,
    subItemIndex,
    watch,
    getValues }: {
        defaultNextItem: React.MutableRefObject<uniqueItem>,
        register: UseFormRegister<IEditorFormData>,
        control: Control<IEditorFormData, any>,
        orderedItems: uniqueItem[],
        itemIndex: number,
        remove: UseFieldArrayRemove,
        item: FieldArrayWithId<IEditorFormData, "test", "id">,
        subItem: FieldArrayWithId,
        subItemIndex: number
        watch: UseFormWatch<IEditorFormData>,
        getValues: UseFormGetValues<IEditorFormData>
    }) {
    const [editorContext, dispatchEditorAction] = useReteEditorReducer()

    const itemName = watch(`test.${itemIndex}.subItems.${subItemIndex}.name`);
    const next = watch(`test.${itemIndex}.subItems.${subItemIndex}.nextItem`);

    useEffect(() => {
        let parentItem = getValues(`test.${itemIndex}`)
        let subItems = getValues(`test.${itemIndex}.subItems`)
        dispatchEditorAction(editorActionUpdate({
            uuid: item.uuid,
            itemName: parentItem.itemName,
            nextItem: parentItem.nextItem,
            subItems: subItems
        }))
        return () => {

        }
    }, [itemName, next])


    return (
        <>
            <input className="form-control"
                defaultValue={`${item.itemName}`}
                {...register(`test.${itemIndex}.subItems.${subItemIndex}.name`)}
            />
            <Controller
                name={`test.${itemIndex}.subItems.${subItemIndex}.nextItem` as const}
                control={control}

                rules={{ required: true }}
                render={({ field: { onChange, value, ref } }) => (
                    <div>
                        <select className="form-control" id={`test.${itemIndex}.subItems.${subItemIndex}.nextItem` as const}
                            onChange={(event: any) => {
                                //dispatch change 

                                onChange(event)
                            }}
                            defaultValue={value || defaultNextItem.current.uuid}
                            value={value || defaultNextItem.current.uuid}
                            ref={ref}>
                            <option value={defaultNextItem.current.uuid}>{defaultNextItem.current.name}</option>
                            {
                                orderedItems.map((opt, index) => {
                                    return (<option key={index} value={opt.uuid}>{opt.name}</option>)
                                })
                            }
                        </select>
                    </div>
                )}
            />
            <div className="input-group-append" id="button-addon4">
                <button className="btn btn-outline" onClick={() => {
                    remove(subItemIndex)
                    let parentItem = getValues(`test.${itemIndex}`)
                    let subItems = getValues(`test.${itemIndex}.subItems`)
                    dispatchEditorAction(editorActionUpdate({
                        uuid: item.uuid,
                        itemName: item.itemName,
                        nextItem: item.nextItem,
                        subItems: subItems
                    }))
                    //dispatchEditorAction(editorActionUpdate(item))
                }} type="button"><Trash2Fill color="red"></Trash2Fill></button>
            </div>
        </>
    );
}
