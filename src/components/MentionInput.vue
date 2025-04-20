<template>
    <div class="mention-input-wrapper">
        <div class="input-group">
            <input
                ref="inputRef"
                v-model="inputValue"
                @input="handleInput"
                @keydown="handleKeyDown"
                @keyup.enter="emitSend"
                @click="repositionDropdown"
                :placeholder="placeholder"
                class="form-control message-input"
                :disabled="disabled"
            />
            <button
                @click="emitSend"
                class="btn send-btn"
                :disabled="disabled || !canSend"
                :title="disabled ? 'Sending...' : 'Send message'"
            >
                <span v-if="disabled" class="sending-indicator">
                    <div class="sending-spinner"></div>
                </span>
                <template v-else>
                    <i class="fas fa-paper-plane"></i>
                </template>
            </button>
        </div>

        <!-- Mentions dropdown -->
        <div
            v-if="showMentionsDropdown"
            class="mentions-dropdown"
            ref="dropdownRef"
            :style="dropdownPosition"
        >
            <div v-if="filteredUsers.length === 0" class="no-mentions">
                No users found
            </div>
            <div
                v-for="(user, index) in filteredUsers"
                :key="user.uid"
                @click="selectMention(user)"
                :class="[
                    'mention-item',
                    { active: index === selectedMentionIndex },
                ]"
            >
                <img
                    :src="user.pfp || require('@/assets/pfp_default.jpg')"
                    alt="User avatar"
                    class="mention-avatar"
                />
                <span class="mention-name">{{ user.username }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, defineExpose } from "vue";
import { defineProps, defineEmits } from "vue";

const props = defineProps({
    chatType: {
        type: String,
        default: "private",
    },
    modelValue: {
        type: String,
        default: "",
    },
    users: {
        type: Array,
        default: () => [],
    },
    currentUser: {
        type: Object,
        default: null,
    },
    placeholder: {
        type: String,
        default: "Type a message...",
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["update:modelValue", "send"]);

// Refs
const inputRef = ref(null);
const dropdownRef = ref(null);
const inputValue = ref(props.modelValue);
const showMentionsDropdown = ref(false);
const mentionQuery = ref("");
const selectedMentionIndex = ref(0);
const dropdownPosition = ref({});

// Watch for external model changes
watch(
    () => props.modelValue,
    (newValue) => {
        inputValue.value = newValue;
    }
);

// Watch for changes in the input value to emit updates
watch(inputValue, (newValue) => {
    emit("update:modelValue", newValue);
});

// Computed values
const canSend = computed(() => inputValue.value.trim().length > 0);

const filteredUsers = computed(() => {
    if (!mentionQuery.value) return props.users;

    return props.users
        .filter(
            (user) =>
                // Don't include current user in mentions
                user.uid !== props.currentUser?.uid &&
                // Filter by username containing the query (case insensitive)
                user.username
                    .toLowerCase()
                    .includes(mentionQuery.value.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 results
});

// Check if we should show the mentions dropdown
const checkForMentionTrigger = () => {
    const cursorPosition = inputRef.value.selectionStart;
    const textBeforeCursor = inputValue.value.substring(0, cursorPosition);

    // Find the last @ character before the cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex === -1) {
        showMentionsDropdown.value = false;
        return;
    }

    // Check if there's a space between the last @ and the cursor
    const textBetweenAtAndCursor = textBeforeCursor.substring(lastAtIndex + 1);
    const hasSpaceAfterAt = /\s/.test(textBetweenAtAndCursor);

    // Only show dropdown if @ is at the beginning of a word
    const isAtStartOfWord =
        lastAtIndex === 0 || /\s/.test(textBeforeCursor[lastAtIndex - 1]);

    const isGroupChat = props.chatType === "group";

    if (!hasSpaceAfterAt && isAtStartOfWord && isGroupChat) {
        mentionQuery.value = textBetweenAtAndCursor;
        showMentionsDropdown.value = true;
        selectedMentionIndex.value = 0;
        calculateDropdownPosition();
    } else {
        showMentionsDropdown.value = false;
    }
};

// Calculate the position of the dropdown based on cursor position
const calculateDropdownPosition = () => {
    if (!inputRef.value) return;

    const input = inputRef.value;
    const cursorPosition = input.selectionStart;

    // Create a temporary element to calculate text width
    const span = document.createElement("span");

    // Apply same styling as input
    const computedStyle = window.getComputedStyle(input);
    span.style.font = computedStyle.font;
    span.style.fontSize = computedStyle.fontSize;
    span.style.padding = computedStyle.padding;
    span.style.position = "absolute";
    span.style.visibility = "hidden";
    span.style.whiteSpace = "pre";
    span.textContent = input.value.substring(0, cursorPosition);

    document.body.appendChild(span);

    // Calculate position
    const inputRect = input.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();

    document.body.removeChild(span);

    // Calculate the dropdown width
    const dropdownWidth = 200; // Width of the dropdown in pixels

    // Position the dropdown below the cursor, but aligned from bottom up
    dropdownPosition.value = {
        left: `${Math.min(spanRect.width, inputRect.width - dropdownWidth)}px`,
        bottom: `${inputRect.height + 2}px`, // Position from bottom of input
        top: "auto", // Override the default top positioning
    };
};

// Reposition dropdown when input is clicked
const repositionDropdown = () => {
    if (showMentionsDropdown.value) {
        calculateDropdownPosition();
    }
};

// Handle input changes
const handleInput = () => {
    checkForMentionTrigger();
};

// Handle keydown events for navigation
const handleKeyDown = (event) => {
    if (showMentionsDropdown.value) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            // Since the list is reversed, we need to go up in the index when pressing Down
            selectedMentionIndex.value =
                (selectedMentionIndex.value - 1 + filteredUsers.value.length) %
                filteredUsers.value.length;
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            // Since the list is reversed, we need to go down in the index when pressing Up
            selectedMentionIndex.value =
                (selectedMentionIndex.value + 1) % filteredUsers.value.length;
        } else if (event.key === "Enter" && filteredUsers.value.length > 0) {
            event.preventDefault();
            selectMention(filteredUsers.value[selectedMentionIndex.value]);
        } else if (event.key === "Escape") {
            event.preventDefault();
            showMentionsDropdown.value = false;
        } else if (event.key === "Tab") {
            event.preventDefault();
            if (filteredUsers.value.length > 0) {
                selectMention(filteredUsers.value[selectedMentionIndex.value]);
            }
        }
    }
};

// Select a mention from the dropdown
const selectMention = (user) => {
    const cursorPosition = inputRef.value.selectionStart;
    const textBeforeCursor = inputValue.value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    // Replace the @query with the username
    const textBeforeAt = inputValue.value.substring(0, lastAtIndex);
    const textAfterCursor = inputValue.value.substring(cursorPosition);

    // Format: @username with an appended space
    const mentionText = `@${user.username} `;

    inputValue.value = textBeforeAt + mentionText + textAfterCursor;

    // Close the dropdown
    showMentionsDropdown.value = false;

    // Set cursor position after the inserted mention
    nextTick(() => {
        const newCursorPosition = lastAtIndex + mentionText.length;
        inputRef.value.focus();
        inputRef.value.setSelectionRange(newCursorPosition, newCursorPosition);
    });
};

// Emit the send event
const emitSend = () => {
    if (canSend.value && !props.disabled) {
        emit("send");
    }
};

// Export a focus method that can be called from the parent component
const focus = () => {
    if (inputRef.value) {
        inputRef.value.focus();
    }
};

// Expose the focus method
defineExpose({
    focus,
});
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.mention-input-wrapper {
    position: relative;
    width: 100%;
}

.mentions-dropdown {
    position: absolute;
    background-color: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    width: 200px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    border: 1px solid var(--gray-200);
    display: flex;
    flex-direction: column-reverse; /* Reverse the order of dropdown items */
}

.mention-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.mention-item:hover,
.mention-item.active {
    background-color: var(--gray-100);
    cursor: pointer;
}

.mention-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 8px;
    object-fit: cover;
}

.mention-name {
    font-size: 0.9rem;
}

.no-mentions {
    padding: 8px 12px;
    color: var(--gray-500);
    font-size: 0.9rem;
    text-align: center;
}

.input-group {
    position: relative;
    box-shadow: var(--shadow-sm);
    border-radius: var(--radius-full);
    background-color: white;
}

.message-input {
    border-radius: var(--radius-full) 0 0 var(--radius-full) !important;
    padding: 0.75rem 1.25rem;
    height: 50px;
    border: 1px solid var(--gray-200);
    border-right: none;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    background-color: white;
}

.message-input:focus {
    box-shadow: none;
    border-color: var(--primary-color);
}

.message-input:disabled {
    background-color: var(--gray-100);
    cursor: not-allowed;
}

.send-btn {
    background-color: var(--primary-color);
    color: white;
    border-radius: 0 var(--radius-full) var(--radius-full) 0;
    width: 50px;
    height: 50px;
    padding: 0;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.send-btn:hover:not(:disabled) {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
}

.send-btn:active:not(:disabled) {
    transform: translateY(0);
}

.send-btn:disabled {
    background-color: var(--gray-400);
    cursor: not-allowed;
}

.send-btn i {
    font-size: 1.1rem;
}

.sending-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.sending-spinner {
    width: 1.2rem;
    height: 1.2rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spinner 0.8s linear infinite;
}

@media screen and (max-width: 768px) {
    .message-input {
        height: 45px;
        padding: 0.6rem 1rem;
        font-size: 0.9rem;
    }

    .send-btn {
        height: 45px;
        width: 45px;
    }

    .send-btn i {
        font-size: 1rem;
    }
}
</style>
