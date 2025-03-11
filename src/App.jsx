import { useState } from "react";

import "./App.css";

import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import supabase from "./supabase-client";

function App() {
  const [newTodo, setNewTodo] = useState("");
  const queryClient = useQueryClient();

  const {
    data: todoList = [],
    // refetch,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("Todo-CRUD").select("*");
      if (error) throw new Error(error.message);
      return data;
    },
  });

  //Mutaton for adding a new todo
  const addTodo = useMutation({
    mutationFn: async (newTodoData) => {
      const { data, error } = await supabase
        .from("Todo-CRUD")
        .insert([newTodoData])
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["todos"]);
      setNewTodo("");
    },
  });

  const completeTask = useMutation({
    mutationFn: async ({ id, isCompleted }) => {
      await supabase
        .from("Todo-CRUD")
        .update({ isCompleted: !isCompleted })
        .eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries(["todos"]),
  });

  const deleteTodoTask = useMutation({
    mutationFn: async (id) => {
      await supabase.from("Todo-CRUD").delete().eq("id", id);
      // .then(() => refetch());
    },
    onSuccess: () => queryClient.invalidateQueries(["todos"]),
  });

  if (isLoading) return <p>Loading todos...</p>;
  if (error) return <p>Error fetching todos: {error.message}</p>;

  return (
    <div>
      <h1>Todo Supabase</h1>
      <div>
        <input
          type="text"
          id="todo"
          placeholder="Enter a todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button
          type="button"
          id="addnew-btn"
          onClick={() => addTodo.mutate({ name: newTodo, isCompleted: false })}
        >
          {addTodo.isLoading ? "Adding..." : "Add new Task"}
        </button>
      </div>
      <ul>
        {todoList.map((todo) => (
          <li key={todo.id}>
            <p>{todo.name}</p>
            <button
              type="button"
              id="complete-btn"
              onClick={() =>
                completeTask.mutate({
                  id: todo.id,
                  isCompleted: todo.isCompleted,
                })
              }
            >
              {todo.isCompleted ? "Undo" : "Complete Task"}
            </button>
            <button
              id="delete-btn"
              type="button"
              onClick={() => deleteTodoTask.mutate(todo.id)}
            >
              Delete Todo
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
