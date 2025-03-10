import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import "./App.css";
import supabase from "./supabase-client";

function App() {
  // const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const queryClient = useQueryClient();
  // Not ideal to use this method to fetch data, use the react query istead, for tutorial purposel we can use useEffect for now.
  // useEffect(() => {
  //   fetchTodo();
  // }, []);

  // const fetchTodo = async () => {
  //   const { data, error } = await supabase.from("Todo-CRUD").select("*");

  //   if (error) {
  //     console.log(`Error fetching data: ${error}`);
  //   } else {
  //     setTodoList([data]);
  //   }
  // };

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

  // const addTodo = async () => {
  //   const newTodoData = {
  //     name: newTodo,
  //     isCompleted: false,
  //   };
  //   const { data, error } = await supabase
  //     .from("Todo-CRUD")
  //     .insert([newTodoData])
  //     .single();

  //   if (error) {
  //     console.log(`Error: ${error}`);
  //   } else {
  //     setTodoList((prev) => [...prev, data]);
  //     setNewTodo("");
  //   }
  // };

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

  // const completeTask = async (id, isCompleted) => {
  //   const { _, error } = await supabase
  //     .from("Todo-CRUD")
  //     .update({ isCompleted: !isCompleted })
  //     .eq("id", id);

  //   if (error) {
  //     console.log(`Error toggling todo: ${error}`);
  //   } else {
  //     const updatedTodoList = todoList.map((todo) =>
  //       todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
  //     );
  //     setTodoList(updatedTodoList);
  //   }
  // };

  const completeTask = useMutation({
    mutationFn: async ({ id, isCompleted }) => {
      await supabase
        .from("Todo-CRUD")
        .update({ isCompleted: !isCompleted })
        .eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries(["todos"]),
  });

  // const deleteTodoTask = async (id) => {
  //   const { _, error } = await supabase.from("Todo-CRUD").delete().eq("id", id);
  //   if (error) {
  //     console.log(`Error deleting todo-list: ${error}`);
  //   } else {
  //     setTodoList((prev) => prev.filter((todo) => todo.id !== id));
  //   }
  // };

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
