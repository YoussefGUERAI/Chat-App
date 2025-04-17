import { ref, watch } from "vue";
import { cloneDeep } from "lodash";

/**
 * Composable for handling search functionality in conversations
 *
 * This composable provides a reusable search and filtering system for conversations.
 * It maintains the original list of conversations while providing filtered results
 * based on search queries. The filtering logic supports both group and private chats.
 *
 * @param {Object} options - Configuration options
 * @param {Ref<Array>} options.conversations - Reference to the conversations to be filtered
 * @param {Function} options.getConversationName - Function to get conversation name for private chats
 * @returns {Object} Search functionality with reactive properties and methods
 */
export function useSearch({ conversations, getConversationName }) {
    const searchQuery = ref("");
    const originalConversations = ref([]);
    const filteredConversations = ref([]);

    // Initialize originalConversations when conversations change
    watch(
        conversations,
        (newConversations) => {
            if (newConversations.length > 0) {
                // Always keep the original conversations updated
                originalConversations.value = cloneDeep(newConversations);

                // Only update filtered conversations if no search is active
                if (!searchQuery.value.trim()) {
                    filteredConversations.value = cloneDeep(newConversations);
                } else {
                    // If a search is active, reapply the search filter to the new conversations
                    handleSearch();
                }
            } else {
                // If conversations is empty, reset both arrays
                originalConversations.value = [];
                filteredConversations.value = [];
            }
        },
        { immediate: true }
    );

    /**
     * Handle search functionality for conversations
     * Filters conversations based on search query for both group and private chats
     */
    const handleSearch = () => {
        if (!searchQuery.value.trim()) {
            // If search is cleared, restore original conversations
            filteredConversations.value = cloneDeep(
                originalConversations.value
            );
            return;
        }

        // Filter conversations based on search query
        const query = searchQuery.value.toLowerCase();

        // Search in chats (private) and groups based on schema structure
        const filtered = originalConversations.value.filter((conv) => {
            if (!conv) return false;

            if (conv.type === "group") {
                // For groups, search by name
                return conv.name?.toLowerCase().includes(query);
            } else {
                // For private chats, search by other user's name
                const name = getConversationName(conv);
                return name?.toLowerCase().includes(query);
            }
        });

        // Update filtered conversations with results
        filteredConversations.value = cloneDeep(filtered);
    };

    /**
     * Reset search to empty and show all conversations
     */
    const resetSearch = () => {
        searchQuery.value = "";
        filteredConversations.value = cloneDeep(originalConversations.value);
    };

    return {
        searchQuery,
        filteredConversations,
        handleSearch,
        resetSearch,
    };
}
