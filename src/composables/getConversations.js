import { db, auth } from "@/firebase/config";
import { onMounted } from "vue";
import { ref } from "vue";

const conversations = ref([]);

async function getConversations() {
    onMounted(async () => {
        await db
            .collection("chat")
            .where("users", "array-contains", auth.currentUser.uid)
            .onSnapshot((snapshot) => {
                conversations.value.push(
                    snapshot.docs.map((doc) => doc.data())
                );
            });

        await db
            .collection("group")
            .where("users", "array-contains", auth.currentUser.uid)
            .onSnapshot((snapshot) => {
                conversations.value.push(
                    snapshot.docs.map((doc) => doc.data())
                );
            });

        conversations.value.sort((a, b) => a.lastUpdate - b.lastUpdate);
    });

    return { conversations };
}

export { getConversations, conversations };
