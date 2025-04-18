import {db, auth} from '@/firebase/config'

const isGroupAdmin = async (userID, groupID) => { //checks if user with userID is an admin of the group with groupID

    const group = await db.collection('groups').doc(groupID).get();
    if (group.exists) {
        const groupData = group.data();
        if (groupData.admins && groupData.admins.includes(userID)) {
            return true;
        } else {
            return false;
        }
    } else{
        console.log("No such document!");
        return false;
    }
}

const isModerator = async () => { // checks if current user is a moderator
    const user = auth.currentUser;
    try {
        db.collection('users').doc(user.uid)
        .get().then(
            (doc) => {
                if (doc.exists) {
                    return doc.data().role === 'moderator';
                }
                else{
                    console.log("No such document!");
                    return false;
                }
            }
        )
    }   catch (error) {
        console.error("Error getting document:", error);
        return false;
    }
    
}

export {isModerator, isGroupAdmin}