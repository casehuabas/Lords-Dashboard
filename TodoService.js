const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_PATH = path.join(__dirname, 'data', 'todo_tasks.json');

/**
 * @typedef {Object} Task
 * @property {string} id - Unique identifier for the task.
 * @property {string} task - The description of the task.
 * @property {string} created - ISO date string of creation.
 * @property {boolean} resolved - Whether the task is completed.
 */

/**
 * Loads tasks from the JSON file.
 * @returns {Promise<Task[]>} An array of task objects.
 */
async function loadTasks() {
    try {
        const data = await fs.readFile(DATA_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading tasks:", error);
        // Return an empty array if the file is missing or corrupted
        return [];
    }
}

/**
 * Saves the provided array of tasks to the JSON file.
 * @param {Task[]} tasks - The array of tasks to save.
 * @returns {Promise<void>}
 */
async function saveTasks(tasks) {
    try {
        const data = JSON.stringify(tasks, null, 2);
        await fs.writeFile(DATA_PATH, data, 'utf-8');
    } catch (error) {
        console.error("Error saving tasks:", error);
        throw new Error("Failed to save task list.");
    }
}

/**
 * Adds a new task to the list.
 * @param {string} taskDescription - The description of the new task.
 * @returns {Promise<Task>} The newly created task object.
 */
async function addTask(taskDescription) {
    if (!taskDescription || typeof taskDescription !== 'string' || taskDescription.trim() === '') {
        throw new Error("Task description cannot be empty.");
    }

    const tasks = await loadTasks();
    
    const newTask = {
        id: uuidv4(),
        task: taskDescription.trim(),
        created: new Date().toISOString(),
        resolved: false
    };

    tasks.push(newTask);
    await saveTasks(tasks);
    return newTask;
}

/**
 * Retrieves all tasks, sorted by creation date.
 * @returns {Promise<Task[]>} A sorted array of task objects.
 */
async function listTasks() {
    const tasks = await loadTasks();
    // Sort by creation date ascending (oldest first)
    return tasks.sort((a, b) => new Date(a.created) - new Date(b.created));
}

/**
 * Marks a task as resolved by its ID.
 * @param {string} taskId - The unique ID of the task to resolve.
 * @returns {Promise<Task[]>} The updated list of tasks.
 * @throws {Error} If the task ID is not found.
 */
async function markTaskResolved(taskId) {
    let tasks = await loadTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
        throw new Error(`Task with ID ${taskId} not found.`);
    }

    // Check if it's already resolved to prevent unnecessary saves
    if (tasks[taskIndex].resolved === true) {
        console.warn(`Task ${taskId} is already resolved.`);
        return tasks;
    }

    // Update the task state
    tasks[taskIndex].resolved = true;
    await saveTasks(tasks);
    return tasks;
}

module.exports = {
    addTask,
    listTasks,
    markTaskResolved,
    // Exporting load/save for testing purposes if needed
    loadTasks,
    saveTasks
};