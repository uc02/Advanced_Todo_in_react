import { useState, useEffect, useReducer } from 'react';
import { Trash, Edit2, Calendar, Clock, AlertCircle } from 'lucide-react';

// Action types
const ADD_TODO = 'ADD_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';
const DELETE_TODO = 'DELETE_TODO';
const EDIT_TODO = 'EDIT_TODO';
const SET_PRIORITY = 'SET_PRIORITY';
const CLEAR_COMPLETED = 'CLEAR_COMPLETED';
const SET_DUE_DATE = 'SET_DUE_DATE';

// Reducer function
function todoReducer(state, action) {
  switch (action.type) {
    case ADD_TODO:
      return [...state, action.payload];
    case TOGGLE_TODO:
      return state.map(todo => 
        todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
      );
    case DELETE_TODO:
      return state.filter(todo => todo.id !== action.payload);
    case EDIT_TODO:
      return state.map(todo => 
        todo.id === action.payload.id ? { ...todo, text: action.payload.text } : todo
      );
    case SET_PRIORITY:
      return state.map(todo => 
        todo.id === action.payload.id ? { ...todo, priority: action.payload.priority } : todo
      );
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

export default function TodoApp() {
  // Initialize state from localStorage or with empty array
  const [todos, dispatch] = useReducer(todoReducer, [], () => {
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
  const [newPriority, setNewPriority] = useState('medium');
  
  // Save todos to localStorage when they change
  useEffect(() => {
    localStorage.setItem('advancedTodos', JSON.stringify(todos));
  }, [todos]);
  
  // Check for overdue todos
  useEffect(() => {
    const now = new Date();
    const overdueExists = todos.some(todo => 
      !todo.completed && todo.dueDate && new Date(todo.dueDate) < now
    );
    
    if (overdueExists) {
      // In a real app, you might show notifications here
      document.title = "⚠️ Overdue Tasks - Todo App";
    } else {
      document.title = "Todo App";
    }
  }, [todos]);

  const addTodo = () => {
    if (input.trim() !== '') {
      const now = new Date();
      dispatch({
        type: ADD_TODO,
        payload: {
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
    dispatch({ type: TOGGLE_TODO, payload: id });
  };

  const deleteTodo = (id) => {
    dispatch({ type: DELETE_TODO, payload: id });
    if (selectedTodo && selectedTodo.id === id) {
      setSelectedTodo(null);
      setShowTodoDetail(false);
    }
  };

  const editTodo = (id, newText) => {
    dispatch({ 
      type: EDIT_TODO, 
      payload: { id, text: newText } 
    });
  };

  const setPriority = (id, priority) => {
    dispatch({ 
      type: SET_PRIORITY, 
      payload: { id, priority } 
    });
  };

  const setDueDate = (id, dueDate) => {
    dispatch({ 
      type: SET_DUE_DATE, 
      payload: { id, dueDate } 
    });
  };

  const clearCompleted = () => {
    dispatch({ type: CLEAR_COMPLETED });
  };

  const openTodoDetail = (todo) => {
    setSelectedTodo(todo);
    setShowTodoDetail(true);
  };

  // Filter todos based on current filter and search term
  let filteredTodos = todos.filter(todo => {
    // Filter by status
    const statusMatch = 
      filter === 'all' ? true : 
      filter === 'active' ? !todo.completed : 
      filter === 'completed' ? todo.completed :
      filter === 'overdue' ? (!todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()) :
      filter === 'today' ? (todo.dueDate && isToday(new Date(todo.dueDate))) :
      true;
      
    // Filter by search term
    const searchMatch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });
  
  // Sort todos
  filteredTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'createdAt') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return 0;
  });

  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  }

  function isOverdue(dateString) {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  }

  // Stats calculation
  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
    overdue: todos.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex">
      {/* Main todo list */}
      <div className="flex-grow mr-4">
        <h1 className="text-3xl font-bold mb-6">Task Manager</h1>
        
        {/* Search and input section */}
        <div className="mb-6">
          <div className="flex mb-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow p-2 border rounded-l focus:outline-none"
              placeholder="Add a new task"
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            />
            <button 
              onClick={addTodo}
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          
          {/* Add options */}
          <div className="flex space-x-2 mb-3">
            <select 
              value={newPriority} 
              onChange={(e) => setNewPriority(e.target.value)}
              className="p-2 border rounded text-sm"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            
            <input 
              type="date" 
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="p-2 border rounded text-sm"
              placeholder="Due date"
            />
          </div>
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none"
            placeholder="Search tasks..."
          />
        </div>
        
        {/* Filters */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-1">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={`px-3 py-1 text-sm rounded ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 text-sm rounded ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Completed
            </button>
            <button 
              onClick={() => setFilter('today')}
              className={`px-3 py-1 text-sm rounded ${filter === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Today
            </button>
            <button 
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1 text-sm rounded flex items-center ${filter === 'overdue' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
            >
              <AlertCircle size={14} className="mr-1" />
              Overdue
            </button>
          </div>
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-1 text-sm border rounded"
          >
            <option value="createdAt">Sort by: Date Created</option>
            <option value="dueDate">Sort by: Due Date</option>
            <option value="priority">Sort by: Priority</option>
          </select>
        </div>
        
        {/* Todo list */}
        <ul className="space-y-2 mb-4 transition-all">
          {filteredTodos.length === 0 ? (
            <li className="p-4 bg-gray-50 rounded text-center text-gray-500">
              No tasks match your criteria
            </li>
          ) : (
            filteredTodos.map(todo => (
              <li 
                key={todo.id} 
                className={`bg-white border rounded shadow-sm transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${
                  todo.completed ? 'opacity-70' : ''
                }`}
                onClick={() => openTodoDetail(todo)}
              >
                <div className="p-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleTodo(todo.id);
                      }}
                      className="mr-3"
                    />
                    
                    <div className="flex-grow">
                      <p className={`text-lg ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                        {todo.text}
                      </p>
                      
                      <div className="flex items-center text-xs mt-1 text-gray-500 space-x-3">
                        <span className={`flex items-center ${
                          todo.priority === 'high' ? 'text-red-500' : 
                          todo.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {todo.priority} priority
                        </span>
                        
                        {todo.dueDate && (
                          <span className={`flex items-center ${
                            isOverdue(todo.dueDate) && !todo.completed ? 'text-red-500' : ''
                          }`}>
                            <Calendar size={12} className="mr-1" /> 
                            {formatDate(todo.dueDate)}
                          </span>
                        )}
                        
                        <span className="flex items-center">
                          <Clock size={12} className="mr-1" /> 
                          {new Date(todo.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTodo(todo.id);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
        
        {/* Controls & Stats */}
        <div className="flex flex-wrap justify-between items-center text-sm text-gray-600 border-t pt-3">
          <div className="flex space-x-3">
            <span>{stats.active} remaining</span>
            <span>{stats.completed} completed</span>
            {stats.overdue > 0 && <span className="text-red-500">{stats.overdue} overdue</span>}
          </div>
          
          <button 
            onClick={clearCompleted}
            className="text-blue-500 hover:text-blue-700"
            disabled={stats.completed === 0}
          >
            Clear completed
          </button>
        </div>
      </div>
      
      {/* Detail panel */}
      {showTodoDetail && selectedTodo && (
        <div className="w-72 bg-gray-50 p-4 rounded border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Task Details</h3>
            <button 
              onClick={() => setShowTodoDetail(false)}
              className="text-gray-500"
            >
              Close
            </button>
          </div>
          
          {/* Edit task name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Task</label>
            <input 
              type="text"
              value={selectedTodo.text}
              onChange={(e) => editTodo(selectedTodo.id, e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          {/* Edit priority */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select 
              value={selectedTodo.priority}
              onChange={(e) => setPriority(selectedTodo.id, e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          {/* Edit due date */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input 
              type="date"
              value={selectedTodo.dueDate || ''}
              onChange={(e) => setDueDate(selectedTodo.id, e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            <p>Created: {new Date(selectedTodo.createdAt).toLocaleString()}</p>
            <p>Status: {selectedTodo.completed ? 'Completed' : 'Active'}</p>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => deleteTodo(selectedTodo.id)}
              className="w-full bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
            >
              Delete Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}