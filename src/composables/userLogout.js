import { auth, db } from "@/firebase/config";

const logout = async (router) => {
    if (auth.currentUser) {
        try {
            db.collection("users").doc(auth.currentUser.uid).update({
                status: false,
            });
            await auth.signOut();
            console.log("User signed out");
            alert("Logged out");
            router.push("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    } else {
        
        console.log("No user is currently logged in");
        alert("No user is logged in");
        router.push("/");
    }
};

export { logout };
