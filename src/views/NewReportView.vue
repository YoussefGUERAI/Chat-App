<template>
    <div class="container mt-5">
        <div class="back-btn-container">
            <button class="back-btn" @click="goToHome">
                <i class="fas fa-arrow-left"></i>
                <span>Back to Chat</span>
            </button>
        </div>

        <h2>New Report</h2>

        <div class="form-group">
            <label>Target:</label>
            <input v-model="targetTitle" type="text" class="form-control"  disabled/>
        </div>

        <div class="form-group mt-3">
            <label>Target type:</label>
            <input v-model="targetType" type="text" class="form-control" disabled/>
        </div>

        <div class="form-group mt-3 mb-4">
            <label>Reason: </label>
            <input v-model="reason" type="text" class="form-control" placeholder="Enter reason" />
        </div>

        <button class="create" @click="submitReport">
            Report
        </button>
    </div>
</template>
<style scoped>
.container {
    max-width: 800px;
    margin: 0 auto;
    background-color: white;
}

.back-btn-container {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 20px;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #284B63;
    color: #FFFFFF;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-btn:hover {
    background-color: #3C6E71;
    transform: translateY(-1px);
}

.back-btn:active {
    transform: translateY(0);
}

.back-btn i {
    font-size: 1rem;
}

.mb-4 {
    margin-bottom: 1.5rem;
}

.selected-users {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.badge {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #284B63;

    color: #FFFFFF;

    border-radius: 20px;
}

.btn-close {
    background: none;
    border: none;
    color: #FFFFFF;
    font-size: 1rem;
    margin-left: 0.5rem;
    cursor: pointer;
}

h2 {
    color: #3C6E71;
}

label {
    color: #353535;
}

input.form-control {
    border: 1px solid #D9D9D9;
    color: #353535;
}

input.form-control::placeholder {
    color: #D9D9D9;
}

.txt {
    color: #353535;
    margin-bottom: 5%;
}

input.form-check-input:checked {
    background-color: #284B63;
    border-color: #284B63;
}

.create {
    background-color: #284B63;
    border-color: #284B63;
    color: #FFFFFF;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
}

.create:hover {
    background-color: #3C6E71;
    border-color: #3C6E71;
}
</style>


<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import { db, auth } from "@/firebase/config";

const router = useRouter();
const route = useRoute();

const target = ref(null);
const targetType = ref("");
const targetTitle = ref("");
const finalTargetId = ref("");
const reason = ref("");

const goToHome = () =>{
    router.push("/home")
}

onMounted(async () => {
    const targetID = route.query.targetID;
    console.log("TargetID:", targetID);

    const userList = ref({});
    const groupList = ref({});

    await db.collection("chat").get().then((snapshot) => {
        snapshot.forEach((doc) => {
            userList.value[doc.id] = doc.data();
        });
    });

    await db.collection("group").get().then((snapshot) => {
        snapshot.forEach((doc) => {
            groupList.value[doc.id] = doc.data();
        });
    });

    
    for (const id in userList.value) {
        const userData = userList.value[id];
        if (targetID === id) {
            targetType.value = "user";
            for (const userID of userData.users) {
                if (auth.currentUser.uid !== userID) {
                    finalTargetId.value = userID;
                    const otherUserDoc = await db.collection("users").doc(userID).get();
                    target.value = otherUserDoc.data(); 
                    targetTitle.value = target.value.username;
                    break;
                }
            }
        }
    }

    if (target.value === null) {
        for (const id in groupList.value) {
            if (targetID === id) {
                finalTargetId.value = id;
                const groupData =  groupList.value[id];
                console.log("here")
                target.value = groupData;
                targetTitle.value = groupData.name;
                targetType.value = "group";
                break;
            }
        }
    }
});


const submitReport = async () => {
    console.log("allo salam : ", finalTargetId)
    try{
        await db.collection("reports").add({
            createdAt: new Date(),
            reason: reason.value,
            reportAuthor: auth.currentUser.uid,
            targetID: finalTargetId.value,
            targetType: targetType.value,
            targetTitle: targetTitle.value
        })
        alert("Report submitted successfully!")
        router.push('/home')
    }
    catch(error){
        console.log("error submitting report: ", error)
    }
}

</script>