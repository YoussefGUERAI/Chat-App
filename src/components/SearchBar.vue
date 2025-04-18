<template>
    <div class="search-container">
        <div class="input-group">
            <span class="search-icon">
                <i class="fas fa-search"></i>
            </span>
            <input
                type="text"
                v-model="query"
                @input="onInput"
                :placeholder="placeholder"
                class="form-control search-input"
                :class="{ 'is-loading': isLoading }"
            />
            <button v-if="isLoading" disabled class="btn loading-btn">
                <span class="loading-spinner-sm"></span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { defineProps, defineEmits } from "vue";

const props = defineProps({
    modelValue: {
        type: String,
        default: "",
    },
    placeholder: {
        type: String,
        default: "Search...",
    },
    debounceTime: {
        type: Number,
        default: 300,
    },
    isLoading: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["update:modelValue", "search", "clear"]);

const query = computed({
    get: () => props.modelValue,
    set: (value) => emit("update:modelValue", value),
});

// Debounce timer
const debounceTimer = ref(null);

const onInput = () => {
    // Clear existing timer
    if (debounceTimer.value) {
        clearTimeout(debounceTimer.value);
    }

    // Set new timer
    debounceTimer.value = setTimeout(() => {
        emit("search", query.value);
    }, props.debounceTime);
};
</script>

<style scoped>
.search-container {
    width: 100%;
    max-width: 100%;
    position: relative;
    /* Remove margin-bottom and padding, let parent control spacing */
}
.input-group {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    align-items: stretch;
    width: 100%;
    /* Removed box-shadow */
    border-radius: var(--radius-full);
    overflow: hidden;
    background-color: var(--gray-100); /* Added background color */
}

.search-icon {
    position: absolute;
    left: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-500);
    z-index: 5;
}

.search-input {
    padding-left: 40px;
    padding-right: 45px;
    height: 44px;
    border-radius: var(--radius-full) !important;
    border: none; /* Removed border */
    background-color: transparent; /* Make input background transparent to use group's bg */
    transition: box-shadow 0.2s ease-in-out; /* Removed border-color transition */
    font-size: 0.9rem;
    width: 100%;
    flex: 1;
    box-sizing: border-box; /* Ensure padding/border are included in width */
}

.search-input:focus {
    border: 1px solid var(--primary-color); /* Added border on focus */
    background-color: var(--white); /* Added background color on focus */
    box-shadow: 0 0 0 3px var(--primary-focus-ring); /* Adjusted focus shadow */
    outline: none;
}

.btn {
    position: absolute;
    /* Adjust right positioning for better inset */
    right: 8px;
    top: 50%;
    background: none;
    border: none;
    z-index: 5;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border-radius: 50%;
    transition: background-color 0.2s ease, color 0.2s ease;
}

.clear-btn {
    color: var(--gray-400);
}

.clear-btn:hover {
    background-color: var(--gray-100);
    color: var(--gray-600);
}

.loading-btn {
    cursor: default;
}

.loading-spinner-sm {
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--gray-200);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spinner 0.8s linear infinite;
    margin: auto;
}

/* Mobile styles */
@media screen and (max-width: 768px) {
    .search-input {
        height: 40px;
        font-size: 0.85rem;
        padding-left: 35px; /* Adjusted padding */
        padding-right: 40px; /* Adjusted padding */
    }

    .btn {
        width: 32px;
        height: 32px;
        right: 6px;
    }
    .search-icon {
        left: var(--spacing-sm);
        font-size: 0.9rem;
    }
}

@media screen and (max-width: 480px) {
    .search-input {
        height: 38px;
        font-size: 0.8rem;
        padding-left: 32px; /* Adjusted padding */
        padding-right: 38px; /* Adjusted padding */
    }

    .search-icon {
        left: var(--spacing-xs);
        font-size: 0.8rem;
    }

    .btn {
        width: 30px;
        height: 30px;
        right: 6px;
    }
}
</style>
