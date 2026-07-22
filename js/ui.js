"use strict";

/* 
   UI ELEMENTS
 */

const taskListElement = document.getElementById("taskList");

const totalTasksCountElement = document.getElementById(
    "totalTasksCount"
);

const completedTasksCountElement = document.getElementById(
    "completedTasksCount"
);

const pendingTasksCountElement = document.getElementById(
    "pendingTasksCount"
);

const highPriorityCountElement = document.getElementById(
    "highPriorityCount"
);

const sidebarProgressValue = document.getElementById(
    "sidebarProgressValue"
);

const sidebarProgressBar = document.getElementById(
    "sidebarProgressBar"
);

const progressTrack = document.querySelector(".progress-track");

/* 
   HELPER FUNCTIONS
 */

/**
 * Escapes HTML-sensitive characters before inserting user text.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeHTML(value) {
    const temporaryElement = document.createElement("div");

    temporaryElement.textContent = value;

    return temporaryElement.innerHTML;
}

/**
 * Formats a stored deadline.
 *
 * @param {string} deadline
 * @returns {string}
 */
function formatTaskDeadline(deadline) {
    const date = new Date(`${deadline}T00:00:00`);

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(date);
}

/**
 * Returns true when a pending task has passed its deadline.
 *
 * @param {Object} task
 * @returns {boolean}
 */
function isTaskOverdue(task) {
    if (task.status === "completed") {
        return false;
    }

    const today = new Date();
    const deadline = new Date(`${task.deadline}T23:59:59`);

    return deadline < today;
}

/**
 * Converts stored values into readable labels.
 *
 * @param {string} value
 * @returns {string}
 */
function capitalizeLabel(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

/* 
   TASK CARD
 */

/**
 * Creates the HTML for one task card.
 *
 * @param {Object} task
 * @returns {string}
 */
function createTaskCard(task) {
    const completedClass =
        task.status === "completed" ? "completed" : "";

    const overdue = isTaskOverdue(task);

    const description = task.description
        ? `
            <p class="task-description">
                ${escapeHTML(task.description)}
            </p>
        `
        : "";

    const overdueBadge = overdue
        ? `<span class="task-badge overdue-badge">Overdue</span>`
        : "";

    return `
        <article
            class="task-card ${completedClass}"
            data-task-id="${task.id}"
        >
            <div class="task-card-main">
                <button
                    class="task-checkbox"
                    type="button"
                    data-action="toggle"
                    data-task-id="${task.id}"
                    aria-label="${
                        task.status === "completed"
                            ? "Mark task as pending"
                            : "Mark task as completed"
                    }"
                >
                    ${task.status === "completed" ? "✓" : ""}
                </button>

                <div class="task-card-content">
                    <div class="task-card-header">
                        <div>
                            <h3>${escapeHTML(task.title)}</h3>

                            <div class="task-badges">
                                <span
                                    class="task-badge priority-${task.priority}"
                                >
                                    ${capitalizeLabel(task.priority)}
                                    Priority
                                </span>

                                <span
                                    class="task-badge status-${task.status}"
                                >
                                    ${capitalizeLabel(task.status)}
                                </span>

                                ${overdueBadge}
                            </div>
                        </div>

                        <div class="task-actions">
                            <button
                                class="task-action-button"
                                type="button"
                                data-action="edit"
                                data-task-id="${task.id}"
                                aria-label="Edit ${escapeHTML(task.title)}"
                            >
                                ✎
                            </button>

                            <button
                                class="task-action-button delete"
                                type="button"
                                data-action="delete"
                                data-task-id="${task.id}"
                                aria-label="Delete ${escapeHTML(task.title)}"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    ${description}

                    <div class="task-footer">
                        <span>
                            Deadline:
                            <strong>
                                ${formatTaskDeadline(task.deadline)}
                            </strong>
                        </span>

                        <span>
                            Created:
                            ${formatTaskDeadline(task.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    `;
}

/* 
   RENDERING
 */

/**
 * Renders all tasks or the empty state.
 *
 * @param {Array} tasks
 */
function renderTasks(tasks) {
    if (tasks.length === 0) {
        taskListElement.innerHTML = `
            <div class="empty-state" id="emptyState">
                <div class="empty-state-illustration">
                    <span>☁</span>
                    <span>✓</span>
                </div>

                <h3>Your task list is ready</h3>

                <p>
                    Add your first internship task and start
                    tracking your progress.
                </p>

                <button
                    class="secondary-button"
                    id="emptyStateAddButton"
                    type="button"
                >
                    Add Your First Task
                </button>
            </div>
        `;

        return;
    }

    taskListElement.innerHTML = tasks
        .map(createTaskCard)
        .join("");
}

/**
 * Updates the statistic cards.
 *
 * @param {Array} tasks
 */
function updateTaskStatistics(tasks) {
    const completedTasks = tasks.filter(
        task => task.status === "completed"
    ).length;

    const pendingTasks = tasks.filter(
        task => task.status === "pending"
    ).length;

    const highPriorityTasks = tasks.filter(
        task =>
            task.priority === "high" &&
            task.status !== "completed"
    ).length;

    totalTasksCountElement.textContent = tasks.length;
    completedTasksCountElement.textContent = completedTasks;
    pendingTasksCountElement.textContent = pendingTasks;
    highPriorityCountElement.textContent = highPriorityTasks;
}

/**
 * Updates the sidebar progress bar.
 *
 * @param {Array} tasks
 */
function updateProgress(tasks) {
    const completedTasks = tasks.filter(
        task => task.status === "completed"
    ).length;

    const progressPercentage =
        tasks.length === 0
            ? 0
            : Math.round(
                (completedTasks / tasks.length) * 100
            );

    sidebarProgressValue.textContent =
        `${progressPercentage}%`;

    sidebarProgressBar.style.width =
        `${progressPercentage}%`;

    progressTrack.setAttribute(
        "aria-valuenow",
        String(progressPercentage)
    );
}

/**
 * Updates all dynamic interface sections.
 *
 * @param {Array} tasks
 */
function renderApplication(tasks) {
    renderTasks(tasks);
    updateTaskStatistics(tasks);
    updateProgress(tasks);
}