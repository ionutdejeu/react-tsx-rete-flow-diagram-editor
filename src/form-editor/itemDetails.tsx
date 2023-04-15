import React, { Ref, useCallback, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useForm, useFieldArray, Controller, UseFormRegister, Control, FieldArrayWithId, UseFieldArrayRemove, useController, useWatch, UseFormWatch, UseFormGetValues, UseFormSetValue } from "react-hook-form";

import "./styles.css";
import { IEditorFormData, IEditorItem, IEditorSubItem, IReteEditorAction, StoreItemType, uniqueItem } from "../shared/types";
import { v4 as uuid } from 'uuid'
import { GripVertical, PlusSquare, Trash2Fill } from "react-bootstrap-icons";
import { SubItemDnD } from "./subItemDnD";
import { useReteEditorReducer, useReteEditorSubscription } from "../flow-editor/state/reteEditorContext";
import { editorActionDelete, editorActionUpdate } from "../shared/editorCustomState";

export function ItemDetails({
    defaultNextItem,
    register, control,
    orderedItems,
    itemIndex,
    remove,
    item,
    watch,
    getValues, setValue }: {
        defaultNextItem: React.MutableRefObject<uniqueItem>,
        register: UseFormRegister<IEditorFormData>,
        control: Control<IEditorFormData, any>,
        orderedItems: uniqueItem[],
        itemIndex: number,
        remove: UseFieldArrayRemove,
        item: FieldArrayWithId<IEditorFormData, "test", "id">,
        watch: UseFormWatch<IEditorFormData>,
        getValues: UseFormGetValues<IEditorFormData>,
        setValue: UseFormSetValue<IEditorFormData>
    }) {
    const [editorContext, dispatchEditorAction] = useReteEditorReducer()
    const { setEntityId, callbackOnChange } = useReteEditorSubscription()

    const itemName = watch(`test.${itemIndex}.itemName`);
    const next = watch(`test.${itemIndex}.nextItem`);

    useEffect(() => {
        let subItems = getValues(`test.${itemIndex}.subItems`)
        let itemNewValue = getValues(`test.${itemIndex}`)
        console.log('dispatchEditorAction:editorActionUpdate', itemName, next, subItems, itemNewValue)

        dispatchEditorAction(editorActionUpdate({
            uuid: item.uuid,
            itemName: itemNewValue.itemName,
            nextItem: itemNewValue.nextItem,
            subItems: subItems
        }))
        return () => {

        }
    }, [itemName, next])
    const onEditorConnectionChangedForThiItem = useCallback((i: IReteEditorAction) => {
        console.log('callbackOnChange', 'item', `test.${itemIndex}.itemName`, i)
        setValue(`test.${itemIndex}.nextItem`,i.payload.to)
    }, [])
    useEffect(() => {
        setEntityId(item.uuid)
        callbackOnChange(onEditorConnectionChangedForThiItem)
        return () => {

        }
    }, [item])
    return (
        <>
            <input className="form-control"
                defaultValue={`${item.itemName}`}
                {...register(`test.${itemIndex}.itemName`)}
            />
            <Controller
                name={`test.${itemIndex}.nextItem` as const}
                control={control}

                rules={{ required: true }}
                render={({ field: { onChange, value, ref } }) => (
                    <div>
                        <select className="form-control" id={`tests.${itemIndex}.parentItem` as const}
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
                    dispatchEditorAction(editorActionDelete(item))
                    remove(itemIndex)
                }} type="button"><Trash2Fill color="red"></Trash2Fill></button>
            </div>
        </>
    );
}
