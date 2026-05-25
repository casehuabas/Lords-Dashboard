import React, { useState, useEffect, useCallback } from 'react';
import { addTask, listTasks, markTaskResolved } from './TodoService';

/**
 * A simple To-Do list component that interacts with the TodoService.
 * This component handles the UI and calls the service layer for state management.
 */
const TodoListComponent = () => {
    const [tasks, setTasks] = useState([]);
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- 1. Load Tasks on Mount ---
    const loadTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const loadedTasks = await listTasks();
            setTasks(loadedTasks);
        } catch (e) {
            console.error("Failed to load tasks:", e);
            setError("Failed to load task list. Check console for details.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // --- 2. Handle Adding a Task ---
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskDescription.trim()) return;

        try {
            // Call the service layer function
            const newTask = await addTask(newTaskDescription);
            
            // Optimistically update the local state
            setTasks(prevTasks => [...prevTasks, newTask]);
            setNewTaskDescription('');
        } catch (e) {
            console.error("Failed to add task:", e);
            setError(e.message || "Could not add task.");
        }
    };

    // --- 3. Handle Marking a Task as Resolved ---
    const handleMarkResolved = async (taskId) => {
        try {
            // Call the service layer function
            const updatedTasks = await markTaskResolved(taskId);
            
            // Update the local state with the server-side confirmed state
            setTasks(updatedTasks);
        } catch (e) {
            console.error("Failed to mark task resolved:", e);
            setError(e.message || "Could not mark task as resolved.");
        }
    };

    if (isLoading) {
        return <div className="todo-list-container">Loading tasks...</div>;
    }

    return (
        <div className="todo-list-container">
            <h1>📋 Lords To-Do List</h1>
            
            {error && <div style={{ color: 'red' }} className="error-message">Error: {error}</div>}

            {/* Task Input Form */}
            <form onSubmit={handleAddTask} className="task-input-form">
                <input
                    type="text"
                    placeholder="Add a new task..."
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    disabled={!!error}
                />
                <button type="submit" disabled={!!error || !newTaskDescription.trim()}>
                    Add Task
                </button>
            </form>

            {/* Task List */}
            <ul className="task-list">
                {tasks.length === 0 ? (
                    <p>No tasks found. Add one above!</p>
                ) : (
                    tasks.map(task => (
                        <li key={task.id} className={`task-item ${task.resolved ? 'resolved' : 'pending'}`}>
                            <span className="task-text">{task.task}</span>
                            <div className="task-actions">
                                <button 
                                    onClick={() => handleMarkResolved(task.id)}
                                    disabled={task.resolved}
                                >
                                    {task.resolved ? '✅ Resolved' : 'Mark Resolved'}
                                </button>
                                <small>({new Date(task.created).toLocaleDateString()})</small>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default TodoListComponent;