"use strict";

const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const greetingText = document.getElementById("greetingText");
const currentDateElement = document.getElementById("currentDate");

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
 * Displays the greeting and today's formatted date.
 */
function initializePageHeader() {
    greetingText.textContent = `${getGreeting()}, Reem!`;

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    currentDateElement.textContent = dateFormatter.format(new Date());
}

/**
 * Opens or closes the mobile navigation.
 */
function toggleSidebar() {
    const isOpen = sidebar.classList.toggle("mobile-open");

    sidebarToggle.setAttribute("aria-expanded", String(isOpen));
}

/**
 * Initializes basic application interactions.
 */
function initializeApp() {
    initializePageHeader();

    sidebarToggle.addEventListener("click", toggleSidebar);
}

document.addEventListener("DOMContentLoaded", initializeApp);