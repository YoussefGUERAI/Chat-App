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
            <button
                v-else-if="query"
                @click="clearSearch"
                class="btn clear-btn"
            >
                <i class="fas fa-times"></i>
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

const clearSearch = () => {
    query.value = "";
    // Clear timer if it exists
    if (debounceTimer.value) {
        clearTimeout(debounceTimer.value);
        debounceTimer.value = null;
    }
    emit("clear");
    emit("search", "");
};
</script>

<style scoped>
.search-container {
    width: 100%;
    max-width: 100%;
    position: relative;
    margin-bottom: var(--spacing-md);
}

.input-group {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    align-items: stretch;
    width: 100%;
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
    height: 48px;
    border-radius: var(--radius-full) !important;
    border: 1px solid var(--gray-200);
    background-color: white;
    transition: all 0.3s ease;
    font-size: 0.95rem;
    box-shadow: var(--shadow-sm);
}

.search-input:focus {
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    border-color: var(--primary-color);
}

.search-input.is-loading {
    padding-right: 45px;
}

.btn {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    z-index: 5;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border-radius: 50%;
    transition: background-color 0.2s ease;
}

.clear-btn {
    color: var(--gray-500);
}

.clear-btn:hover {
    background-color: var(--gray-100);
    color: var(--gray-700);
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
}

/* Mobile styles */
@media screen and (max-width: 768px) {
    .search-container {
        margin-bottom: var(--spacing-sm);
    }

    .search-input {
        height: 42px;
        font-size: 0.9rem;
    }

    .btn {
        width: 34px;
        height: 34px;
    }
}

@media screen and (max-width: 480px) {
    .search-container {
        margin-bottom: var(--spacing-xs);
    }

    .search-input {
        height: 38px;
        font-size: 0.85rem;
        padding-left: 36px;
    }

    .search-icon {
        left: var(--spacing-sm);
        font-size: 0.85rem;
    }

    .btn {
        width: 30px;
        height: 30px;
    }
}
</style>
