import { db } from "@/firebase/config";

import firebase from "firebase/app";
import "firebase/firestore";


export const addMessageToChat = async (chatId, messageData) => {
    try {
        // Determine if this is a private chat or group chat
        const isPrivateChat = chatId.includes("_");

        // Get the appropriate collection reference
        const collectionName = isPrivateChat ? "chat" : "group";

        const chatRef = db.collection(collectionName).doc(chatId);


        // Create the message object with required fields
        const message = {
            content: messageData.content,

            created_at: firebase.firestore.FieldValue.serverTimestamp(),

            sender_id: messageData.sender_id,
            ...(messageData.admins && { admins: messageData.admins }), // Add admins field for group chats
        };

        // Update the chat document

        await chatRef.update({
            messages: firebase.firestore.FieldValue.arrayUnion(message),
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),

        });

        return { success: true, message };
    } catch (error) {
        console.error("Error adding message to chat:", error);
        throw error;
    }
};


export default addMessageToChat;

