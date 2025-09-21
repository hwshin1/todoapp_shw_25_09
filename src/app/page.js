'use client';

import React, { useState, useRef } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';

export default function App() {
  const todosState = useTodosState();

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <main className="w-full px-4 py-5 sm:mx-auto sm:max-w-[640px] sm:px-6 md:max-w-[768px]">
        <h1 className="mb-3 text-base sm:text-xl md:text-2xl font-bold">간단 Todo App</h1>
        <TodoApp todosState={todosState} />
      </main>
    </div>
  );
}

function dateToStr(d) {
  const pad = (n) => (n < 10 ? '0' + n : n);
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    ' ' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes()) +
    ':' +
    pad(d.getSeconds())
  );
}

const NewTodoForm = ({ todosState, className = '' }) => {
  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    form.content.value = form.content.value.trim();
    if (form.content.value.length === 0) {
      alert('할일을 입력해주세요.');
      form.content.focus();
      return;
    }
    todosState.addTodo(form.content.value);
    form.content.value = '';
    form.content.focus();
  };

  return (
    <section className={className}>
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <TextField
          name="content"
          label="할 일"
          variant="outlined"
          size="small"
          placeholder="할일을 입력해주세요."
          autoComplete="off"
          className="w-full sm:flex-1"
        />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 w-full sm:w-auto">
          <Button variant="contained" size="small" type="submit" className="w-full sm:w-auto">
            추가
          </Button>
          <Button variant="outlined" size="small" type="reset" className="w-full sm:w-auto">
            취소
          </Button>
        </div>
      </form>
    </section>
  );
};

const TodoListItem = ({ todosState, todo, index }) => {
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(todo.content);
  const editRef = useRef(null);

  const removeTodo = () => todosState.removeTodo(index);
  const toggleDone = () => todosState.toggleDone(index);

  const commitEdit = () => {
    if (editContent.trim().length === 0) {
      alert('할일을 입력해 주세요.');
      editRef.current?.focus();
      return;
    }
    todosState.modifyTodo(index, editContent.trim());
    setEditMode(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditContent(todo.content);
  };

  return (
    <li
      className="
        grid items-start sm:items-center gap-2
        grid-cols-1 sm:grid-cols-[auto_auto_1fr_auto]
        px-0 py-2
        sm:rounded-xl sm:border sm:border-gray-200 sm:bg-white
        sm:px-4 sm:py-3 sm:shadow-sm
      ">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={todo.done}
          onChange={toggleDone}
          size="small"
          inputProps={{ 'aria-label': `${todo.id}번 완료 여부` }}
        />
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-semibold">#{todo.id}</span>
          <span className="whitespace-nowrap">{todo.regDate}</span>
        </div>
      </div>

      <div className="min-w-0 sm:col-span-2">
        {editMode ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <TextField
              inputRef={editRef}
              variant="outlined"
              size="small"
              placeholder="할일 입력"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
              <Button
                variant="contained"
                size="small"
                onClick={commitEdit}
                className="w-full sm:w-auto">
                수정완료
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={cancelEdit}
                className="w-full sm:w-auto">
                수정취소
              </Button>
            </div>
          </div>
        ) : (
          <span
            className={`block break-words ${
              todo.done ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
            {todo.content}
          </span>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        {!editMode && (
          <>
            <Button
              variant="contained"
              size="small"
              onClick={() => setEditMode(true)}
              className="w-full sm:w-auto">
              수정
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={removeTodo}
              className="w-full sm:w-auto">
              삭제
            </Button>
          </>
        )}
      </div>
    </li>
  );
};

const TodoList = ({ todosState }) => {
  if (todosState.todos.length === 0) {
    return <div className="text-gray-500">등록된 할 일이 없습니다.</div>;
  }
  return (
    <ul className="grid gap-2 sm:gap-3">
      {todosState.todos.map((todo, index) => (
        <TodoListItem key={todo.id} todosState={todosState} todo={todo} index={index} />
      ))}
    </ul>
  );
};

const TodoApp = ({ todosState }) => {
  return (
    <section
      className="
        p-0
        sm:rounded-2xl sm:border sm:border-gray-200 sm:bg-white sm:p-5 sm:shadow-sm
      ">
      <NewTodoForm todosState={todosState} />
      <Divider className="my-3 sm:my-5" />
      <TodoList todosState={todosState} />
    </section>
  );
};

const useTodosState = () => {
  const [todos, setTodos] = useState([]);
  const lastTodoIdRef = useRef(0);

  const addTodo = (newContent) => {
    const id = ++lastTodoIdRef.current;
    const newTodo = {
      id,
      content: newContent,
      regDate: dateToStr(new Date()),
      done: false,
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  const modifyTodo = (index, newContent) => {
    setTodos((prev) =>
      prev.map((todo, _index) => (_index !== index ? todo : { ...todo, content: newContent })),
    );
  };

  const removeTodo = (index) => {
    setTodos((prev) => prev.filter((_, _index) => _index !== index));
  };

  const toggleDone = (index) => {
    setTodos((prev) =>
      prev.map((todo, _index) => (_index !== index ? todo : { ...todo, done: !todo.done })),
    );
  };

  return { todos, addTodo, modifyTodo, removeTodo, toggleDone };
};
