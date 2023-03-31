import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import ReactDOM from "react-dom";

import "./styles.css";
import { useEditor, useEditorWithSubscription } from "../shared/editorContext";
import { IEditorItem, StoreItemType, uniqueItem } from "../shared/types";
import { v4 as uuid } from 'uuid'
import { compareItems } from "./shared";

let renderCount = 0;
 
export function ItemsDnd() {
  const [store, setStore, notifyTopic, subscribeTopic] = useEditorWithSubscription()
  const defaultNextItem = useRef<uniqueItem>({ "uuid": uuid().toString(), name: "Not selected" })
  const { register, control, handleSubmit, watch } = useForm({
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
      let mappedItem = originalItems.map((i)=>mapItemToUniqueitem(i))
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
      <span className="counter">Render Count: {renderCount}</span>
      <DragDropContext onDragEnd={handleDrag}>
        <ul>
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
                        <li
                          key={index}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              background: "skyblue",
                              width: "35%"
                            }}
                            {...provided.dragHandleProps}
                          >
                            D
                          </div>
                          <input
                            defaultValue={`${item.itemName}`} // make sure to set up defaultValue
                            {...register(`test.${index}.itemName`)}
                          />
                          <div className="form-group">
                            <Controller
                              name={`test.${index}.nextItem` as const}
                              control={control}
                              rules={{ required: true }}
                              render={({ field: { onChange, value, ref } }) => (
                                <div>
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
                          </div>
                        </li>
                      )}
                    </Draggable>
                  );
                })}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </ul>
      </DragDropContext>

      <section>
        <button
          type="button"
          onClick={() => {
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
          Append
        </button>

        <button
          type="button"
          onClick={() => {

            move(0, 1);
          }}
        >
          Move
        </button>

        <button
          type="button"
          onClick={() => {
            remove(0);
          }}
        >
          Remove
        </button>
      </section>

      <input type="submit" />
    </form>
  );
}
function mapItemToUniqueitem(i: IEditorItem): any {
    throw new Error("Function not implemented.");
}

