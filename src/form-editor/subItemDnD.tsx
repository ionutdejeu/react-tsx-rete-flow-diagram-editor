import React, { Ref, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useForm, useFieldArray, Controller, UseFormRegister, Control, FieldArrayWithId, UseFormWatch } from "react-hook-form";

import "./styles.css";
import { IEditorFormData, IEditorItem, IEditorSubItem, StoreItemType, uniqueItem } from "../shared/types";
import { v4 as uuid } from 'uuid'
import { GripVertical, PlusSquare, Trash2Fill } from "react-bootstrap-icons";
import { useReteEditorReducer } from "../flow-editor/state/reteEditorContext";
import { editorActionUpdate } from "../shared/editorCustomState";

export function SubItemDnD({
  defaultNextItem,
  register, control,
  orderedItems,
  itemIndex,
  item,
  watch }: {
    defaultNextItem: React.MutableRefObject<uniqueItem>,
    register: UseFormRegister<IEditorFormData>,
    control: Control<IEditorFormData, any>,
    orderedItems: uniqueItem[],
    itemIndex: number,
    item: FieldArrayWithId<IEditorFormData, "test", "id">,
    watch: UseFormWatch<IEditorFormData>
  }) {

  const { fields, append, move, remove } = useFieldArray({
    control,
    name: `test.${itemIndex}.subItems`
  });

  const itemName = watch(`test.${itemIndex}.itemName`);
  const next = watch(`test.${itemIndex}.nextItem`);

  const [editorContext, dispatchEditorAction] = useReteEditorReducer()

  //uses move from useFieldArray to change the position of the form
  const handleDrag = ({ source, destination }: any) => {
    if (destination) {
      move(source.index, destination.index);

    }
  };
  useEffect(() => {
    console.log('dispatchEditorAction:editorActionUpdate', itemName, next)
    dispatchEditorAction(editorActionUpdate({
      uuid: item.uuid,
      itemName: itemName,
      nextItem: next,
      subItems: fields
    }))
    return () => {

    }
  }, [itemName, next])
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-auto m-0 p-0 align-middle">
            <span className="align-middle m-0">SubItems:</span>
          </div>
          <div className="col">
            <a
              type="button"
              className="btn btn-light"
              onClick={() => {
                let newItem: IEditorSubItem = {
                  uuid: uuid().toString(),
                  name: "SubItemName",
                  nextItem: defaultNextItem.current.uuid,
                }
                dispatchEditorAction(editorActionUpdate(item))
                //notifyTopic("added", newItem)
                append(newItem);
              }}
            >
              <PlusSquare size={30}></PlusSquare>
            </a>
          </div>
        </div>
      </div>
      <DragDropContext onDragEnd={handleDrag}>
        <div>
          <Droppable droppableId="test-items">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {fields.map((subItem, index) => {
                  return (
                    <Draggable
                      key={`test.${index}`}
                      draggableId={`test.${index}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          key={index}
                          ref={provided.innerRef}
                          className="input-group"
                          {...provided.draggableProps}
                        >
                          <div
                            {...provided.dragHandleProps}
                          >
                            <GripVertical size={20}></GripVertical>

                          </div>
                          <input
                            defaultValue={`${subItem.name}`}
                            className="form-control"
                            {...register(`test.${itemIndex}.subItems.${index}.name`)}
                          />
                          <Controller
                            name={`test.${itemIndex}.subItems.${index}.nextItem` as const}
                            control={control}
                            rules={{ required: true }}
                            render={({ field: { onChange, value, ref } }) => (
                              <div>
                                <select className="form-control" id={`tests.${index}.parentItem` as const} onChange={onChange}
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
                            <button className="btn btn-outline-secondary" onClick={() => {
                              remove(index)
                              dispatchEditorAction(editorActionUpdate(item))
                            }} type="button"><Trash2Fill size={10}></Trash2Fill></button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </>
  );
}
