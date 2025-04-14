import { auth } from "@/firebase/config";

const logout = async (router) => {
    if (auth.currentUser) {
        try {
            await auth.signOut();
            console.log("User signed out");
            alert("Logged out");
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    } else {
        console.log("No user is currently logged in");
        alert("No user is logged in");
        router.push("/login");
    }
};

export { logout };
