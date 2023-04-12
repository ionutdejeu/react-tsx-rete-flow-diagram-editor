import React, { Ref, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useForm, useFieldArray, Controller, UseFormRegister, Control, FieldArrayWithId, UseFormWatch, UseFormGetValues } from "react-hook-form";

import "./styles.css";
import { IEditorFormData, IEditorItem, IEditorSubItem, StoreItemType, uniqueItem } from "../shared/types";
import { v4 as uuid } from 'uuid'
import { GripVertical, PlusSquare, Trash2Fill } from "react-bootstrap-icons";
import { useReteEditorReducer } from "../flow-editor/state/reteEditorContext";
import { editorActionUpdate, formActionAddSubItem } from "../shared/editorCustomState";
import { SubItemDetails } from "./subItemDetails";

export function SubItemDnD({
  defaultNextItem,
  register, control,
  orderedItems,
  itemIndex,
  item,
  watch,
  getValues }: {
    defaultNextItem: React.MutableRefObject<uniqueItem>,
    register: UseFormRegister<IEditorFormData>,
    control: Control<IEditorFormData, any>,
    orderedItems: uniqueItem[],
    itemIndex: number,
    item: FieldArrayWithId<IEditorFormData, "test", "id">,
    watch: UseFormWatch<IEditorFormData>,
    getValues: UseFormGetValues<IEditorFormData>

  }) {

  const { fields, append, move, remove } = useFieldArray({
    control,
    name: `test.${itemIndex}.subItems`
  });

 
  const [editorContext, dispatchEditorAction] = useReteEditorReducer()

  //uses move from useFieldArray to change the position of the form
  const handleDrag = ({ source, destination }: any) => {
    if (destination) {
      move(source.index, destination.index);

    }
  };
   
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

                append(newItem);
                let itemNewValue = getValues(`test.${itemIndex}`)
                let updatedItem: IEditorItem = { ...itemNewValue }
                updatedItem.subItems = getValues(`test.${itemIndex}.subItems`)
                console.log('editorSubItem:addNewItem', updatedItem)
                dispatchEditorAction(editorActionUpdate(updatedItem))
              }}
            >
              <PlusSquare size={30}></PlusSquare>
            </a>
          </div>
        </div>
      </div>
      <DragDropContext onDragEnd={handleDrag}>
        <div>
          <Droppable droppableId={`test-${itemIndex}-sub-item`}>
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {fields.map((subItem, subItemIndex) => {
                  return (
                    <Draggable
                      key={`test.${itemIndex}.subItems.${subItemIndex}`}
                      draggableId={`test.${itemIndex}.subItems.${subItemIndex}`}
                      index={subItemIndex}
                    >
                      {(provided, snapshot) => (
                        <div
                          key={subItemIndex}
                          ref={provided.innerRef}
                          className="input-group"
                          {...provided.draggableProps}
                        >
                          <div
                            {...provided.dragHandleProps}
                          >
                            <GripVertical size={20}></GripVertical>

                          </div>
                          <SubItemDetails
                            itemIndex={itemIndex}
                            subItem={subItem}
                            subItemIndex={subItemIndex}
                            orderedItems={orderedItems}
                            {...{ defaultNextItem, register, control, item, watch, remove, getValues }}></SubItemDetails>
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
