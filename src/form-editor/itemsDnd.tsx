import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import ReactDOM from "react-dom";

import "./styles.css";
import { useEditor, useEditorWithSubscription } from "../shared/editorContext";
import { IEditorItem, StoreItemType } from "../shared/types";

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

export function ItemsDnd() {
  const [store, setStore, notifyTopic, subscribeTopic] = useEditorWithSubscription()
  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: {
      test: [
        { parentItem: "", itemName: "Element1" },
        { parentItem: "Element1", itemName: "Element2" }
      ]
    }
  });
  const { fields, append, move, remove } = useFieldArray({
    control,
    name: "test"
  });
  const [orderedItem, setOrderedItems] = useState<IEditorItem[]>([])
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      let originalItems = value.test as IEditorItem[] || []
      originalItems.sort(compareItems)
      setOrderedItems([...originalItems])
      console.log('updated ordered items',originalItems)
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
                              name={`test.${index}.parentItem` as const}
                              control={control}
                              rules={{ required: true }}
                              render={({ field: { onChange, value, ref } }) => (
                                <div>
                                  <select className="form-control" id={`tests.${index}.parentItem` as const} onChange={onChange}
                                    defaultValue={value || "NotSelected"}
                                    value={value || "NotSelected"} ref={ref}>
                                    <option value="NotSelected">NotSelected</option>
                                    {
                                      orderedItem.map((opt, index) => {
                                        return (<option key={index} value={opt.itemName}>{opt.itemName}</option>)
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
            let newItem: IEditorItem = { parentItem: "", itemName: "NewItemName" }
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
