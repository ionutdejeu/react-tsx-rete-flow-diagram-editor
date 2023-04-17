import React, { Ref, useCallback, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useForm, useFieldArray, Controller, UseFormRegister, Control, FieldArrayWithId, UseFieldArrayRemove, useController, useWatch, UseFormWatch, UseFormGetValues, UseFormSetValue } from "react-hook-form";

import "./styles.css";
import { IEditorFormData, IEditorItem, IEditorSubItem, IReteEditorAction, StoreItemType, uniqueItem } from "../shared/types";
import { useReteEditorReducer, useReteEditorSubscription } from "../flow-editor/state/reteEditorContext";
import { editorActionUpdate, formActionAddSubItem, formActionRemoveSubItem, formActionUpdateSubItem } from "../shared/editorCustomState";
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
    getValues, setValue }: {
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
        getValues: UseFormGetValues<IEditorFormData>,
        setValue: UseFormSetValue<IEditorFormData>

    }) {
    const [editorContext, dispatchEditorAction] = useReteEditorReducer()
    const { setEntityId, callbackOnChange } = useReteEditorSubscription()

    const itemName = watch(`test.${itemIndex}.subItems.${subItemIndex}.name`);
    const next = watch(`test.${itemIndex}.subItems.${subItemIndex}.nextItem`);

    useEffect(() => {
        let parentItem = getValues(`test.${itemIndex}`)
        let subItems = getValues(`test.${itemIndex}.subItems`)
        let subItemValue = getValues(`test.${itemIndex}.subItems.${subItemIndex}`)

        dispatchEditorAction(formActionUpdateSubItem({ ...(subItemValue as unknown as IEditorSubItem) }))
        return () => {

        }
    }, [itemName, next])
    const onEditorConnectionChangedForThiItem = useCallback((i: IReteEditorAction) => {
        console.log('callbackOnChange', 'subItem', `test.${itemIndex}.subItems.${subItemIndex}`, i)
        setValue(`test.${itemIndex}.subItems.${subItemIndex}.nextItem`,i.payload.to)
    }, [])
    useEffect(() => {
        setEntityId((subItem as unknown as IEditorSubItem).uuid)
        callbackOnChange(onEditorConnectionChangedForThiItem)
    }, [subItem])
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
                    let parentItem = getValues(`test.${itemIndex}`)
                    let subItems = getValues(`test.${itemIndex}.subItems`)
                    dispatchEditorAction(formActionRemoveSubItem({ ...(subItem as unknown as IEditorSubItem) }))
                    remove(subItemIndex)

                }} type="button"><Trash2Fill color="red"></Trash2Fill></button>
            </div>
        </>
    );
}
