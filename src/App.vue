<template>
    <router-view />
</template>

<style>
#app {
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--gray-800);
    background-color: var(--light-bg);
    min-height: 100vh;
}

body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background-color: var(--light-bg);
}

/* Global link styles */
a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.2s ease;
}

a:hover {
    color: var(--primary-hover);
    text-decoration: none;
}

/* Global button styles */
.btn {
    border-radius: var(--radius-md);
    padding: 0.5rem 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

/* Card overrides */
.card {
    border: none;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.3s ease;
}

.card:hover {
    box-shadow: var(--shadow-md);
}

/* Form control overrides */
.form-control {
    border-radius: var(--radius-md);
    border: 1px solid var(--gray-300);
    padding: 0.625rem 0.875rem;
}

/* Input group styling */
.input-group-text {
    background-color: var(--gray-100);
    border-color: var(--gray-300);
}
</style>
