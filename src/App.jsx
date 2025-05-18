import { useState, useEffect, useReducer } from "react";
import { Trash, Edit2, Calendar, Clock, AlertCircle } from 'lucide-react'

const ADD_TODO = 'ADD_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';
const DELETE_TODO = 'DELETE_TODO';
const EDIT_TODO = 'EDIT_TODO';
const SET_PRIORITY = 'SET_PRIORITY';
const CLEAR_COMPLETED = 'CLEAR_COMPLETED';
const SET_DUE_DATE = 'SET_DUE_DATE';

function todoReducer(state, action) {
  switch(action.type){
    case ADD_TODO:
       return[...state, action.payload];
    case TOGGLE_TODO: 
       return state.map(todo =>
         todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
       );
    case DELETE_TODO:
      return state.filter(todo => todo.id !== action.payload);
    case EDIT_TODO:
      return state.map(todo =>
        todo.id === action.payload.id ? {...todo, text: action.payload.text } : todo
      );
    case SET_PRIORITY:
      return state.map(todo =>
        todo.id === action.payload.id ? {...todo, priority: action.payload.priority } : todo
      )
    case SET_DUE_DATE:
      return state.map(todo => 
        todo.id === action.payload.id ? { ...todo, dueDate: action.payload.dueDate } : todo
      );
    case CLEAR_COMPLETED: 
       return state.filter(todo => !todo.completed);
    default:
      return state;
  }
}

export default function TodoApp(){
  const [todos, dispatch ] = useReducer(todoReducer,[], () => {
    const savedTodos = localStorage.getItem('advancedTodos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [showTodoDetail, setShowTodoDetail] = useState(false);
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('medium')

  useEffect(() => {
    localStorage.setItem('advancedTodos', JSON.stringify(todos))
  },[todos]);

  useEffect(() => {
    const now = new Date();
    const overdueExists = todos.some(todo => 
      !todo.completed && todo.dueDate && new Date(todo.dueDate) < now 
    );

    if(overdueExists){
      document.title = " Overdue Task - Todo App"
    }else{
      document.title = "Todo App"
    }
  },[todos]);

  const addTodo = () => {
    if(input.trim() !== ''){
      const now = new Date();
      dispatch({
        type: ADD_TODO,
        payload:{
          id: Date.now(),
          text: input,
          completed: false,
          createdAt: now.toISOString(),
          priority: newPriority,
          dueDate: newDueDate || null,
          notes: ''
        }
      });
      setInput('');
      setNewDueDate('');
      setNewPriority('medium');
    }
  };

  const toggleTodo = (id) => {
    dispatch({ type: TOGGLE_TODO, payload: id})
  };

  const deleteTodo = (id) => {
    dispatch({ type: DELETE_TODO, payload: id});
    if(selectedTodo && selectedTodo.id === id){
      setSelectedTodo(null);
      setShowTodoDetail(false)
    }
  };

  const editTodo = (id, newText) => {
    dispatch({
      type: EDIT_TODO,
      payload: {id, text: newText}
    })
  };

  const setPriority = (id, priority) => {
    dispatch({
      type: SET_PRIORITY,
      payload: { id, priority }
    });
  }

  const setDueDate = (id, dueDate) => {
    dispatch({
      type: SET_DUE_DATE,
      payload: { id, dueDate }
    })
  }
  
  const clearCompleted = () => {
    dispatch({ type: CLEAR_COMPLETED })
  }

  const openTodoDetail = (todo) => {
    setSelectedTodo(todo);
    setShowTodoDetail(true)
  }

  let filteredTodos = todos.filter(todo => {
    const statusMatch = 
      filter === 'all' ? true :
      filter === 'active' ? !todo.completed :
      filter === 'completed' ? todo.completed :
      filter === 'overdue' ? (!todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()) :
      filter === 'today' ? (todo.dueDate && isToday(new Date(todo.dueDate))) :
      true;

      const searchMatch = todo.text.toLowerCase().includes(searchTerm.toLowerCase())

      return statusMatch && searchMatch;
  });

  filteredTodos = [...filteredTodos].sort((a,b) => {
    if(sortBy === 'createdAt'){
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if(sortBy === 'dueDate'){
      if(!a.dueDate) return 1;
      if(!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }else if(sortBy === 'priority'){
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return 0;
  });

  function isToday(date){
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  function formatDate(dateString){
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function isOverdue(dateString){
    if(!dateString) return false;
    return new Date(dateString)
  }
}