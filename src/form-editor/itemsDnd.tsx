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
import { useReteEditorReducer,useReteEditor } from "../flow-editor/state/reteEditorContext";

let renderCount = 0;
const compareItems = (a: IEditorItem, b: IEditorItem) => {
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

export function ItemsDnd() {
  const [store, setStore, notifyTopic, subscribeTopic] = useEditorWithSubscription()
  const [editorInstance,setContenxt] = useReteEditorReducer()
  const [editorInstance2] = useReteEditor()
  const defaultNextItem = useRef<uniqueItem>({ "uuid": uuid().toString(), name: "Not selected" })
  const { register, control, handleSubmit, watch } = useForm<IEditorFormData>({
    defaultValues: {
      test: [
        { uuid: uuid().toString(), itemName: "Element1", nextItem: defaultNextItem.current },
        { uuid: uuid().toString(), itemName: "Element2", nextItem: defaultNextItem.current }
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
      originalItems.sort(compareItems)
      let mappedItem = originalItems.map((i) => mapItemToUniqueitem(i))
      setOrderedItems([...mappedItem])
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
                console.log('editorInstance',editorInstance,editorInstance2)
                let newItem: IEditorItem = {
                  uuid: uuid().toString(),
                  itemName: "NewItemName",
                  nextItem: defaultNextItem.current,
                  subItems: []
                }
                notifyTopic("added", newItem)
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
                          <input className="form-control"
                            defaultValue={`${item.itemName}`} // make sure to set up defaultValue
                            {...register(`test.${index}.itemName`)}
                          />
                          <Controller
                            name={`test.${index}.nextItem` as const}
                            control={control}

                            rules={{ required: true }}
                            render={({ field: { onChange, value, ref } }) => (
                              <div>
                                {""&&console.log(value)}
                                <select className="form-control" id={`tests.${index}.parentItem` as const} onChange={onChange}
                                  defaultValue={value.uuid || defaultNextItem.current.uuid}
                                  value={value.uuid || defaultNextItem.current.uuid}
                                  ref={ref}>
                                  <option value={defaultNextItem.current.uuid}>{defaultNextItem.current.name}</option>
                                  {
                                    orderedItem.map((opt, index) => {
                                      return (<option key={index} value={opt.uuid}>{opt.name}</option>)
                                    })
                                  }
                                </select>
                              </div>
                            )}
                          />
                          <div className="input-group-append" id="button-addon4">
                            <button className="btn btn-outline" onClick={() => remove(index)} type="button"><Trash2Fill color="red"></Trash2Fill></button>
                          </div>
                          <div className="container">
                            <SubItemDnD itemIndex={index} orderedItems={orderedItem} {...{ defaultNextItem, register, control, item }}></SubItemDnD>
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
