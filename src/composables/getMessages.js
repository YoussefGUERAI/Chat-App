import {db} from "@/firebase/config";
import { ref } from "vue";

const messages = ref([]);

async function getMessages(targetID) {
    await db.collection('message').where('receptorID', '==', targetID)
    .onSnapshot((snapshot) => {
        messages.value.push(snapshot.docs.map((doc) => doc.data()));
    });

    messages.value.sort((a, b) => a.createdAt - b.createdAt);
    return { messages};

}

export { getMessages, messages };
