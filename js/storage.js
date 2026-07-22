"use strict";

const TASKS_STORAGE_KEY = "interntrack_tasks";

/**
 * Loads tasks from the browser's local storage.
 *
 * @returns {Array}
 */
function loadTasks() {
    try {
        const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);

        if (!storedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(storedTasks);

        return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch (error) {
        console.error("Could not load tasks:", error);

        return [];
    }
}

/**
 * Saves tasks to the browser's local storage.
 *
 * @param {Array} tasks
 */
function saveTasks(tasks) {
    try {
        localStorage.setItem(
            TASKS_STORAGE_KEY,
            JSON.stringify(tasks)
        );
    } catch (error) {
        console.error("Could not save tasks:", error);
    }
}