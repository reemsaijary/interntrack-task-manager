"use strict";

/* 
   DOM ELEMENTS
 */

const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

const greetingText = document.getElementById("greetingText");
const currentDateElement = document.getElementById("currentDate");

const taskModal = document.getElementById("taskModal");
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

const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById(
    "taskDescription"
);


const taskPriorityInput = document.getElementById("taskPriority");
const taskDeadlineInput = document.getElementById("taskDeadline");

const descriptionCharacterCount = document.getElementById(
    "descriptionCharacterCount"
);

/* 
   APPLICATION STATE
 */

let tasks = loadTasks();

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
   TASK MODAL
 */

/**
 * Opens the task modal and focuses the title input.
 */
function openTaskModal() {
    clearFormErrors();

    taskModal.classList.add("open");
    taskModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    setTimeout(() => {
        taskTitleInput.focus();
    }, 100);
}

/**
 * Closes the task modal and resets the form.
 */
function closeTaskModal() {
    taskModal.classList.remove("open");
    taskModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    resetTaskForm();
}

/**
 * Closes the modal when the user clicks the dark overlay.
 *
 * @param {MouseEvent} event
 */
function handleOverlayClick(event) {
    if (event.target === taskModal) {
        closeTaskModal();
    }
}

/**
 * Closes the modal when the Escape key is pressed.
 *
 * @param {KeyboardEvent} event
 */
function handleEscapeKey(event) {
    if (
        event.key === "Escape" &&
        taskModal.classList.contains("open")
    ) {
        closeTaskModal();
    }
}

/* 
   FORM VALIDATION
 */

/**
 * Displays a validation message for a form field.
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
 * Removes the validation message from a form field.
 *
 * @param {HTMLElement} input
 * @param {HTMLElement} errorElement
 */
function clearFieldError(input, errorElement) {
    input.classList.remove("invalid");
    errorElement.textContent = "";
}

/**
 * Removes all form validation messages.
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
 * Handles the form submission.
 *
 * Task storage will be implemented in the next phase.
 *
 * @param {SubmitEvent} event
 */
/**
 * Handles the task form submission.
 *
 * @param {SubmitEvent} event
 */
function handleTaskFormSubmit(event) {
    event.preventDefault();

    if (!validateTaskForm()) {
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        title: taskTitleInput.value.trim(),
        description: taskDescriptionInput.value.trim(),
        priority: taskPriorityInput.value,
        deadline: taskDeadlineInput.value,
        status: document.getElementById("taskStatus").value,
        createdAt: getCurrentLocalDate()
    };

    tasks.unshift(newTask);

    saveTasks(tasks);
    renderApplication(tasks);

    closeTaskModal();
}

/**
 * Resets the form and its character counter.
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

/**
 * Returns today's date in YYYY-MM-DD format.
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
 * Sets today's date as the minimum available deadline.
 */
function setMinimumDeadline() {
    taskDeadlineInput.min = getCurrentLocalDate();
}
/* 
   EVENT LISTENERS
 */

/**
 * Initializes application event listeners.
 */
function initializeEventListeners() {
    sidebarToggle.addEventListener("click", toggleSidebar);

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

    taskModal.addEventListener("click", handleOverlayClick);

    document.addEventListener("keydown", handleEscapeKey);

    taskForm.addEventListener(
        "submit",
        handleTaskFormSubmit
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
    document
    .getElementById("taskList")
    .addEventListener("click", handleTaskListClick);
}

/* 
   APPLICATION INITIALIZATION
 */

function initializeApp() {
    initializePageHeader();
    initializeEventListeners();
    setMinimumDeadline();
    renderApplication(tasks);
}

document.addEventListener("DOMContentLoaded", initializeApp);

/**
 * Handles clicks on dynamically created task-list elements.
 *
 * @param {MouseEvent} event
 */
function handleTaskListClick(event) {
    const addButton = event.target.closest(
        "#emptyStateAddButton"
    );

    if (addButton) {
        openTaskModal();
    }
}