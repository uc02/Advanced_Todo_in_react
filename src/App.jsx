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

  useEffect(() => {},[])
}