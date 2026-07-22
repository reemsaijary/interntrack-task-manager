"use strict";

/* 
   DOM ELEMENTS
 */

const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

const greetingText = document.getElementById("greetingText");
const currentDateElement = document.getElementById("currentDate");

const taskModal = document.getElementById("taskModal");
const taskModalTitle = document.getElementById("taskModalTitle");
const taskForm = document.getElementById("taskForm");

const openTaskModalButton = document.getElementById(
    "openTaskModalButton"
);

const closeTaskModalButton = document.getElementById(
    "closeTaskModalButton"
);

const cancelTaskButton = document.getElementById(
    "cancelTaskButton"
);

const taskList = document.getElementById("taskList");

const taskTitleInput = document.getElementById("taskTitle");

const taskDescriptionInput = document.getElementById(
    "taskDescription"
);

const taskPriorityInput = document.getElementById(
    "taskPriority"
);

const taskDeadlineInput = document.getElementById(
    "taskDeadline"
);

const taskStatusInput = document.getElementById(
    "taskStatus"
);

const descriptionCharacterCount = document.getElementById(
    "descriptionCharacterCount"
);

const taskSearchInput = document.getElementById(
    "taskSearch"
);

const filterButtons = document.querySelectorAll(
    ".filter-button"
);

const deleteModal = document.getElementById(
    "deleteModal"
);

const deleteTaskName = document.getElementById(
    "deleteTaskName"
);

const cancelDeleteButton = document.getElementById(
    "cancelDeleteButton"
);

const confirmDeleteButton = document.getElementById(
    "confirmDeleteButton"
);

/* 
   APPLICATION STATE
 */

let tasks = loadTasks();
let editingTaskId = null;
let currentStatusFilter = "all";
let currentSearchQuery = "";
let deletingTaskId = null;
/* 
   PAGE HEADER
 */

/**
 * Returns a greeting based on the current hour.
 *
 * @returns {string}
 */
function getGreeting() {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        return "Good morning";
    }

    if (currentHour < 18) {
        return "Good afternoon";
    }

    return "Good evening";
}

/**
 * Displays the greeting and today's date.
 */
function initializePageHeader() {
    greetingText.textContent = `${getGreeting()}, Reem!`;

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    currentDateElement.textContent = dateFormatter.format(
        new Date()
    );
}

/* 
   SIDEBAR
 */

/**
 * Opens or closes the mobile sidebar.
 */
function toggleSidebar() {
    const isOpen = sidebar.classList.toggle("mobile-open");

    sidebarToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );
}

/* 
   DATE HELPERS
 */

/**
 * Returns today's local date in YYYY-MM-DD format.
 *
 * @returns {string}
 */
function getCurrentLocalDate() {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60000;

    return new Date(today.getTime() - timezoneOffset)
        .toISOString()
        .split("T")[0];
}

/**
 * Prevents selecting a deadline before today.
 */
function setMinimumDeadline() {
    taskDeadlineInput.min = getCurrentLocalDate();
}

/* 
   TASK MODAL
 */

/**
 * Opens the modal for adding a new task.
 */
function openTaskModal() {
    editingTaskId = null;
    taskModalTitle.textContent = "Add New Task";

    resetTaskForm();
    clearFormErrors();

    taskModal.classList.add("open");
    taskModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    setTimeout(() => {
        taskTitleInput.focus();
    }, 100);
}

/**
 * Opens the modal and fills it with an existing task.
 *
 * @param {string} taskId
 */
function openEditTaskModal(taskId) {
    const taskToEdit = tasks.find(
        task => task.id === taskId
    );

    if (!taskToEdit) {
        return;
    }

    editingTaskId = taskId;
    taskModalTitle.textContent = "Edit Task";

    clearFormErrors();

    taskTitleInput.value = taskToEdit.title;
    taskDescriptionInput.value = taskToEdit.description;
    taskPriorityInput.value = taskToEdit.priority;
    taskDeadlineInput.value = taskToEdit.deadline;
    taskStatusInput.value = taskToEdit.status;

    updateDescriptionCharacterCount();

    taskModal.classList.add("open");
    taskModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    setTimeout(() => {
        taskTitleInput.focus();
    }, 100);
}

/**
 * Closes the task modal and resets edit mode.
 */
function closeTaskModal() {
    taskModal.classList.remove("open");
    taskModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    editingTaskId = null;
    taskModalTitle.textContent = "Add New Task";

    resetTaskForm();
}

/**
 * Closes the modal when clicking the overlay.
 *
 * @param {MouseEvent} event
 */
function handleOverlayClick(event) {
    if (event.target === taskModal) {
        closeTaskModal();
    }
}

/**
 * Closes the modal when Escape is pressed.
 *
 * @param {KeyboardEvent} event
 */
function handleEscapeKey(event) {
    if (event.key !== "Escape") {
        return;
    }

    if (taskModal.classList.contains("open")) {
        closeTaskModal();
        return;
    }

    if (deleteModal.classList.contains("open")) {
        closeDeleteModal();
    }
}

/* 
   FORM VALIDATION
 */

/**
 * Displays an error for a form field.
 *
 * @param {HTMLElement} input
 * @param {HTMLElement} errorElement
 * @param {string} message
 */
function showFieldError(input, errorElement, message) {
    input.classList.add("invalid");
    errorElement.textContent = message;
}

/**
 * Removes an error from a form field.
 *
 * @param {HTMLElement} input
 * @param {HTMLElement} errorElement
 */
function clearFieldError(input, errorElement) {
    input.classList.remove("invalid");
    errorElement.textContent = "";
}

/**
 * Clears all form errors.
 */
function clearFormErrors() {
    clearFieldError(
        taskTitleInput,
        document.getElementById("taskTitleError")
    );

    clearFieldError(
        taskPriorityInput,
        document.getElementById("taskPriorityError")
    );

    clearFieldError(
        taskDeadlineInput,
        document.getElementById("taskDeadlineError")
    );
}

/**
 * Validates the task form.
 *
 * @returns {boolean}
 */
function validateTaskForm() {
    let isValid = true;

    clearFormErrors();

    if (taskTitleInput.value.trim().length < 3) {
        showFieldError(
            taskTitleInput,
            document.getElementById("taskTitleError"),
            "Task name must contain at least 3 characters."
        );

        isValid = false;
    }

    if (!taskPriorityInput.value) {
        showFieldError(
            taskPriorityInput,
            document.getElementById("taskPriorityError"),
            "Please select a priority."
        );

        isValid = false;
    }

    if (!taskDeadlineInput.value) {
        showFieldError(
            taskDeadlineInput,
            document.getElementById("taskDeadlineError"),
            "Please select a deadline."
        );

        isValid = false;
    }

    return isValid;
}

/**
 * Resets the task form.
 */
function resetTaskForm() {
    taskForm.reset();
    clearFormErrors();

    descriptionCharacterCount.textContent = "0 / 300";
}

/**
 * Updates the description character counter.
 */
function updateDescriptionCharacterCount() {
    const currentLength = taskDescriptionInput.value.length;

    descriptionCharacterCount.textContent =
        `${currentLength} / 300`;
}

/* 
   ADD AND EDIT TASKS
 */

/**
 * Handles adding a new task or updating an existing task.
 *
 * @param {SubmitEvent} event
 */
function handleTaskFormSubmit(event) {
    event.preventDefault();

    if (!validateTaskForm()) {
        return;
    }

    const taskValues = {
        title: taskTitleInput.value.trim(),
        description: taskDescriptionInput.value.trim(),
        priority: taskPriorityInput.value,
        deadline: taskDeadlineInput.value,
        status: taskStatusInput.value
    };

    if (editingTaskId) {
        tasks = tasks.map(task => {
            if (task.id !== editingTaskId) {
                return task;
            }

            return {
                ...task,
                ...taskValues
            };
        });
    } else {
        const newTask = {
            id: crypto.randomUUID(),
            ...taskValues,
            createdAt: getCurrentLocalDate()
        };

        tasks.unshift(newTask);
    }

    saveTasks(tasks);
    renderFilteredTasks();

    closeTaskModal();
}

/* 
   COMPLETE TASK
 */

/**
 * Toggles a task between pending and completed.
 *
 * @param {string} taskId
 */
function toggleTaskStatus(taskId) {
    tasks = tasks.map(task => {
        if (task.id !== taskId) {
            return task;
        }

        return {
            ...task,
            status:
                task.status === "completed"
                    ? "pending"
                    : "completed"
        };
    });

    saveTasks(tasks);
    renderFilteredTasks();
}

/* 
   DELETE TASK
 */

/**
 * Opens the delete confirmation modal.
 *
 * @param {string} taskId
 */
function openDeleteModal(taskId) {
    const taskToDelete = tasks.find(
        task => task.id === taskId
    );

    if (!taskToDelete) {
        return;
    }

    deletingTaskId = taskId;
    deleteTaskName.textContent = `"${taskToDelete.title}"`;

    deleteModal.classList.add("open");
    deleteModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    confirmDeleteButton.focus();
}

/**
 * Closes the delete confirmation modal.
 */
function closeDeleteModal() {
    deleteModal.classList.remove("open");
    deleteModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    deletingTaskId = null;
    deleteTaskName.textContent = "";
}

/**
 * Permanently removes the selected task.
 */
function confirmTaskDeletion() {
    if (!deletingTaskId) {
        return;
    }

    tasks = tasks.filter(
        task => task.id !== deletingTaskId
    );

    saveTasks(tasks);
    renderFilteredTasks();

    closeDeleteModal();
}

/* 
   TASK LIST CLICKS
 */

/**
 * Handles clicks on task-list buttons.
 *
 * @param {MouseEvent} event
 */
function handleTaskListClick(event) {
    const addButton = event.target.closest(
        "#emptyStateAddButton"
    );

    if (addButton) {
        openTaskModal();
        return;
    }

    const actionButton = event.target.closest(
        "[data-action]"
    );

    if (!actionButton) {
        return;
    }

    const taskId = actionButton.dataset.taskId;
    const action = actionButton.dataset.action;

    if (action === "toggle") {
        toggleTaskStatus(taskId);
        return;
    }

    if (action === "edit") {
        openEditTaskModal(taskId);
        return;
    }

    if (action === "delete") {
    openDeleteModal(taskId);
}
}

/**
 * Closes the delete modal when its overlay is clicked.
 *
 * @param {MouseEvent} event
 */
function handleDeleteOverlayClick(event) {
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
}

/**
 * Returns tasks that match the current search and status filters.
 *
 * @returns {Array}
 */
function getFilteredTasks() {
    return tasks.filter(task => {
        const matchesStatus =
            currentStatusFilter === "all" ||
            task.status === currentStatusFilter;

        const searchableText = `
            ${task.title}
            ${task.description}
            ${task.priority}
        `.toLowerCase();

        const matchesSearch = searchableText.includes(
            currentSearchQuery
        );

        return matchesStatus && matchesSearch;
    });
}

/**
 * Renders tasks using the current filters.
 */
function renderFilteredTasks() {
    const filteredTasks = getFilteredTasks();

    renderTasks(filteredTasks);
    updateTaskStatistics(tasks);
    updateProgress(tasks);
}

/**
 * Updates the search query and refreshes the task list.
 *
 * @param {InputEvent} event
 */
function handleTaskSearch(event) {
    currentSearchQuery = event.target.value
        .trim()
        .toLowerCase();

    renderFilteredTasks();
}

/**
 * Changes the active status filter.
 *
 * @param {MouseEvent} event
 */
function handleStatusFilter(event) {
    const clickedButton = event.target.closest(
        ".filter-button"
    );

    if (!clickedButton) {
        return;
    }

    currentStatusFilter = clickedButton.dataset.filter;

    filterButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button === clickedButton
        );
    });

    renderFilteredTasks();
}

/* 
   EVENT LISTENERS
 */

/**
 * Initializes all application event listeners.
 */
function initializeEventListeners() {
    sidebarToggle.addEventListener(
        "click",
        toggleSidebar
    );

    openTaskModalButton.addEventListener(
        "click",
        openTaskModal
    );

    closeTaskModalButton.addEventListener(
        "click",
        closeTaskModal
    );

    cancelTaskButton.addEventListener(
        "click",
        closeTaskModal
    );

    taskModal.addEventListener(
        "click",
        handleOverlayClick
    );

    document.addEventListener(
        "keydown",
        handleEscapeKey
    );

    taskForm.addEventListener(
        "submit",
        handleTaskFormSubmit
    );

    taskList.addEventListener(
        "click",
        handleTaskListClick
    );

    taskDescriptionInput.addEventListener(
        "input",
        updateDescriptionCharacterCount
    );

    taskTitleInput.addEventListener("input", () => {
        if (taskTitleInput.value.trim().length >= 3) {
            clearFieldError(
                taskTitleInput,
                document.getElementById("taskTitleError")
            );
        }
    });

    taskPriorityInput.addEventListener("change", () => {
        if (taskPriorityInput.value) {
            clearFieldError(
                taskPriorityInput,
                document.getElementById(
                    "taskPriorityError"
                )
            );
        }
    });

    taskDeadlineInput.addEventListener("change", () => {
        if (taskDeadlineInput.value) {
            clearFieldError(
                taskDeadlineInput,
                document.getElementById(
                    "taskDeadlineError"
                )
            );
        }
    });
    taskSearchInput.addEventListener(
    "input",
    handleTaskSearch
);

document
    .querySelector(".filter-group")
    .addEventListener(
        "click",
        handleStatusFilter
    );
    cancelDeleteButton.addEventListener(
    "click",
    closeDeleteModal
);

confirmDeleteButton.addEventListener(
    "click",
    confirmTaskDeletion
);

deleteModal.addEventListener(
    "click",
    handleDeleteOverlayClick
);
}

/* 
   APPLICATION INITIALIZATION
 */

function initializeApp() {
    initializePageHeader();
    initializeEventListeners();
    setMinimumDeadline();
    renderFilteredTasks();
}

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);