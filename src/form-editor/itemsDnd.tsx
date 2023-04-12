import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import ReactDOM from "react-dom";

import "./styles.css";
import { useEditor, useEditorWithSubscription } from "../shared/editorContext";
import { IEditorFormData, IEditorItem, StoreItemType, uniqueItem } from "../shared/types";
import { v4 as uuid } from 'uuid'
import { SubItemDnD } from "./subItemDnD";
import { GripVertical, PlusSquare, Trash2Fill } from "react-bootstrap-icons";
import { useReteEditorReducer, useReteEditor } from "../flow-editor/state/reteEditorContext";
import { editorActionCreate } from "../shared/editorCustomState";
import { ItemDetails } from "./itemDetails";
import { DEFAULT_SELECTED_ITEM_ID } from "../shared/constants";

let renderCount = 0;
const compareItems = (a: uniqueItem, b: uniqueItem) => {
  const nameA = a.name.toUpperCase(); // ignore upper and lowercase
  const nameB = b.name.toUpperCase(); // ignore upper and lowercase
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

export function ItemsDnd() {
  const [store, setStore, notifyTopic, subscribeTopic] = useEditorWithSubscription()
  const [editorContext, dispatchEditorAction] = useReteEditorReducer()
  const defaultNextItem = useRef<uniqueItem>({ "uuid": DEFAULT_SELECTED_ITEM_ID, name: "Not selected" })
  const { register, control, handleSubmit, watch, getValues } = useForm<IEditorFormData>({
    defaultValues: {
      test: [
        { uuid: uuid().toString(), itemName: "Element1", nextItem: defaultNextItem.current.uuid },
        { uuid: uuid().toString(), itemName: "Element2", nextItem: defaultNextItem.current.uuid }
      ]
    }
  });
  const { fields, append, move, remove } = useFieldArray({
    control,
    name: "test"
  });
  const [orderedItem, setOrderedItems] = useState<uniqueItem[]>([])
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      let originalItems = value.test as IEditorItem[] || []
      let mappedItems = originalItems.map((i) => mapItemToUniqueitem(i))
      mappedItems.sort(compareItems)
      setOrderedItems([...mappedItems])
      console.log('updated ordered items', originalItems)
    });
    return () => subscription.unsubscribe();
  }, [watch]);
  const onSubmit = (data: any) => console.log("data", data);


  const watchFieldArrayChanges = watch('test')

  useEffect(() => {
    //sync the store 
    console.log('watch', watchFieldArrayChanges)
    setStore({
      formItems: fields
    })

  }, [watchFieldArrayChanges])
  //uses move from useFieldArray to change the position of the form
  const handleDrag = ({ source, destination }: any) => {
    if (destination) {
      move(source.index, destination.index);
    }
  };

  renderCount++;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="container">
        <div className="row">
          <div className="col-auto m-0 p-0 align-middle">
            <span className="align-middle m-0">Items:</span>
          </div>
          <div className="col">
            <a
              type="button"
              className="btn btn-light"
              onClick={() => {
                let newItem: IEditorItem = {
                  uuid: uuid().toString(),
                  itemName: "NewItemName",
                  nextItem: defaultNextItem.current.uuid,
                  subItems: []
                }
                dispatchEditorAction(editorActionCreate(newItem))
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
                {fields.map((item, index) => {
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
                          className="input-group border border-danger"
                          {...provided.draggableProps}

                        >
                          <div
                            {...provided.dragHandleProps}
                          >
                            <GripVertical size={20}></GripVertical>
                          </div>
                          <ItemDetails itemIndex={index} orderedItems={orderedItem} {...{ defaultNextItem, remove, register, control, item, watch, getValues }}></ItemDetails>
                          <div className="container">
                            <SubItemDnD itemIndex={index} orderedItems={orderedItem} {...{ defaultNextItem, register, control, item, watch, getValues }}></SubItemDnD>
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
    </form>
  );
}
