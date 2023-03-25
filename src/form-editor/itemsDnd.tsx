import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import ReactDOM from "react-dom";

import "./styles.css";
import { useEditor } from "../shared/editorContext";

let renderCount = 0;

export function ItemsDnd() {
  const [store,setStore] = useEditor()
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      test: [
        { items: "flight", firstName: "Add Description" },
        { items: "train", firstName: "Add Description" }
      ]
    }
  });
  const { fields, append, move, remove } = useFieldArray({
    control,
    name: "test"
  });

  const onSubmit = (data: any) => console.log("data", data);

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
          <Droppable droppableId="test">
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
                          key={item.id}
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
                          <select
                            defaultValue={`${item.items}`}
                            {...register(`test.${index}.items`)}
                          >
                            <option value="">Select</option>
                            <option value="flight">Travel via flight</option>
                            <option value="train">Travel via Train</option>
                            <option value="carBus">
                              Travel via car or bus
                            </option>
                            <option value="water">Travel via water</option>
                            <option value="bicycle">Travel via bicycle</option>
                            <option value="foot">Travel via foot</option>
                            <option value="travelOther">
                              Travel via other form
                            </option>
                            <option value="lodging">Lodging</option>
                            <option value="food">Food or Drink</option>
                            <option value="activity">Activity</option>
                          </select>

                          <input
                            defaultValue={`${item.firstName}`} // make sure to set up defaultValue
                            {...register(`test.${index}.firstName`)}
                          />

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
            append({ items: "flight", firstName: "Append Description" });
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
