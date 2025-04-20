<template>
  <div class="moderator-dashboard">
    <!--nav bar-->
    <mini-navbar class="column"></mini-navbar>

    <!-- Users Column -->
    <div class="column">
      <h2>Users</h2>
      <input type="text" placeholder="Search user" v-model="userFilter">
      <div v-for="user in filteredUserList" :key="user.id" class="user-info">
        <img :src="user.pfp" alt="User Profile Picture" class="user-pfp" />
        <div class="row">
          <p class="title">user name: </p>
          <p>{{ user.username }}</p>
        </div>
        <div class="row">
          <p class="title">e-mail address: </p>
          <p>{{ user.email }}</p>
        </div>
        <div class="d-flex align-items-center g-2">
        <router-link :to="`/profile/${user.id}`"><input type="button" value="go to" class="goto" /></router-link>
        <input v-if="!(user.id === auth.currentUser?.uid)" type="button"
          :value="user.role === 'banned' ? 'unban' : 'ban'" @click="banUser(user.id)" />

        <input v-if="!(user.role === 'banned' || user.role === 'moderator') && (user.id !== auth.currentUser?.uid)" 
               type="button" value="add moderator" @click="addMod(user.id)">

        <input v-if="!(user.role === 'banned') && (user.role === 'moderator') && (user.id !== auth.currentUser?.uid)" 
               type="button" value="remove moderator" @click="removeMod(user.id)">
        </div>
      </div>
    </div>

    <!-- Groups Column -->
    <div class="column">
      <h2>Groups</h2>
      <input type="text" placeholder="Search group" v-model="groupFilter">
      <div v-for="group in filteredGroups" :key="group.id" class="group-item">
        <img :src="group.pfp" alt="Group Picture" class="group-pfp" />
        <div>
          <p><b>Group name:</b> </p>
          <p>{{ group.name }}</p>
        </div>
        <div>
          <p><b>Group bio:</b></p>
          <p>{{ group.bio }}</p>
        </div>

        <router-link :to="`/group-profile/${group.id}`"><input type="button" value="go to" class="goto" /></router-link>
        <!--go to group page-->

        <input type="button" value="delete group" @click="deleteGroup(group.id)" class="goto" />
      </div>
    </div>

    <!-- Reports Column -->
    <div class="column">
      <h2>Reports</h2>
      <input type="text" placeholder="Search report" v-model="reportFilter" />
      <select v-model="reportCategory">
        <option>All</option>
        <option>user</option>
        <option>group</option>
      </select>

      <div v-for="report in filteredReportList" :key="report.id" class="report-card">
        <div class="report-info">
          <div v-if="report.targetType === 'user'">
            <img :src="report.target?.pfp" alt="User Profile Picture" class="user-pfp" />
            <p><b>user name:</b></p>
            <p>{{ report.target?.username }}</p>
          </div>
          <div v-else>
            <img :src="report.target?.pfp" alt="Group Picture" class="group-pfp" />
            <p><b>group name:</b></p>
            <p>{{ report.target?.name }}</p>
          </div>
          <div>
              <p><b>reason:</b></p>
              <p>{{ report.reason }}</p>
          </div>
          <div>
            <p><b>reporter name:</b></p>
            <p>{{ report.reportAuthorName }}</p>
          </div>
          <div>
            <p><b>reported on:</b></p>
            <p>{{ formatTime(report.createdAt) }}</p>
          </div>

          <div class="d-flex align-items-center g-2">
            <router-link v-if="report.targetType === 'user'" :to="`/profile/${report.target.id}`"><input type="button" value="go to" /></router-link>
            <router-link v-if="report.targetType === 'group'" :to="`/group-profile/${report.target.id}`"><input type="button" value="go to" /></router-link>

            <input v-if="report.targetType === 'user'" type="button" value="ban" @click="banUser(report.target.id)" />
            <input v-if="report.targetType === 'group'" type="button" value="delete group"
              @click="deleteGroup(report.target.id)" />
            <input type="button" value="delete report" @click="deleteReport(report.id)" />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { auth, db } from "@/firebase/config";
import { ref, onMounted, computed } from "vue";
import MiniNavbar from "@/components/MiniNavbar.vue";
import { useRouter } from "vue-router";

const usersList = ref([]);
const reportsList = ref([]);
const groupList = ref([]);
const router = useRouter();

const userFilter = ref("");
const reportFilter = ref("");
const groupFilter = ref("");
const reportCategory = ref("All");

onMounted(
  async () => {
    // Fetch groups
    db.collection('group').get().then((snapshot) => {
      snapshot.forEach((doc) => {
        groupList.value.push({ id: doc.id, ...doc.data() })
      })
    }).catch((error) => {
      console.error("Error fetching groups: ", error);
    })

    // Fetch users
    db.collection('users').get().then((snapshot) => {
      snapshot.forEach((doc) => {
        usersList.value.push({ id: doc.id, ...doc.data() });
      });
    }).catch((error) => {
      console.error("Error fetching users: ", error);
    });

    // Fetch reports
    db.collection('reports').get().then((snapshot) => {
      snapshot.forEach((doc) => {
        const report = {
          id: doc.id,
          reason: doc.data().reason,
          reportAuthor: doc.data().reportAuthor,
          createdAt: doc.data().createdAt,
          targetType: doc.data().targetType,
          targetID: doc.data().targetID,
          target: null
        }
        if (doc.data().targetType == "user") {
          for (let i = 0; i < usersList.value.length; i++) {
            if (usersList.value[i].id === doc.data().targetID) {
              report.target = usersList.value[i];
              break;
            }
          }
        }
        else {
          for (let i = 0; i < groupList.value.length; i++) {
            if (groupList.value[i].id === doc.data().targetID) {
              report.target = groupList.value[i];
              break;
            }
          }
        }
        for(let i = 0; i < usersList.value.length; i++){
          if(usersList.value[i].id === report.reportAuthor){
            report.reportAuthorName = usersList.value[i].username;
            break;
          }
        }
        reportsList.value.push(report);
      })
      reportsList.value.sort((a, b) => {
        return a.createdAt - b.createdAt
      })
    }).catch((error) => {
      console.error("Error fetching reports: ", error);
    })

  })


const filteredUserList = computed(() => {
  const userSearch = userFilter.value.trim().toLowerCase();

  return usersList.value.filter(user => {
    const username = user.username?.trim().toLowerCase();
    return username && username.includes(userSearch);
  });
});

const filteredGroups = computed(() => {
  const groupSearch = groupFilter.value.trim().toLowerCase();

  return groupList.value.filter(group => {
    const grouptitle = group.name?.trim().toLowerCase();
    return grouptitle && grouptitle.includes(groupSearch);
  });
});

const filteredReportList = computed(() => {
  const reportSearch = reportFilter.value.trim().toLowerCase();

  return reportsList.value.filter(report => {
    const selectCategory = reportCategory.value;
    // If searching by report target name/title
    let match = true;
    if (reportSearch) {
      if (report.targetType === 'user') {
        match = report.target?.username?.toLowerCase().includes(reportSearch);
      } else {
        match = report.target?.name?.toLowerCase().includes(reportSearch);
      }
    }
    return match && (selectCategory === 'All' || selectCategory === report.targetType);
  });
});

const banUser = async (userID) => {
  try {
    const user = await db.collection('users').doc(userID).get();
    const userRole = user.data().role;

    if (userRole === 'banned') {
      if(confirm("Are you sure you want to unban this user?")){
        await db.collection('users').doc(userID).update({
          role: 'user'
        })
        alert("user unbanned successfully !!")
      }
    }
    else {
      if(confirm("Are you sure you want to ban this user?")){
        await db.collection('users').doc(userID).update({
          role: 'banned'
        })
        alert("user banned successfully !!")
      }
    }
  } catch (error) {
    alert("error: couldn't perform action !!")
    console.log("error banning user: ", error);
  }
  router.go(0)

}

const addMod = async (userID) => {
  try {
    await db.collection('users').doc(userID).update({
      role: 'moderator'
    })
    alert("user added as moderator successfully !!")
    router.go(0)
  }catch(error){
    alert("error: couldn't add moderator !!")
    console.log("error adding moderator: ", error);
  }

}

const removeMod = async (userID) => {
  try {
    await db.collection('users').doc(userID).update({
      role: 'user'
    })
    alert("removed moderator privileges from user !!")
    router.go(0)
  }catch(error){
    alert("error: couldn't add moderator !!")
    console.log("error adding moderator: ", error);
  }

}

const deleteGroup = async (groupID) => {
  if (confirm("Are you sure you want to delete group?")){
  try {
    await db.collection('group').doc(groupID).delete();
    for(let i = 0; i < reportsList.value.length; i++){
      if(reportsList.value[i].targetID === groupID){
        await db.collection('reports').doc(reportsList.value[i].id).delete()
      }
    }
    alert("group deleted successfully !!")
  } catch (error) {
    alert("error: couldn't delete group !!")
    console.log("error deleting group: ", error);
  }
  router.go(0);
  }

}


const deleteReport = async (reportID) => {
  try {
    await db.collection('reports').doc(reportID).delete();
    alert("Report deleted successfully !!")
  } catch (error) {
    alert("error: couldn't delete report !!")
    console.log("error deleting report: ", error);
  }
  router.go(0);
}

const formatTime = (timestamp) => {
  const date = new Date(
      timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1e6)
    );
    return date.toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short'
    });
}


</script>

<style scoped>
/* Layout: 3 columns side by side */
.goto ::placeholder {
  color: black;
}

.moderator-dashboard {
  display: flex;
  padding: 20px;
  padding-left: 100px;

  gap: 24px;
  overflow-x: auto;
  color: black;


}

.moderator-dashboard .mini-navbar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 80px;
  /* or whatever fits your nav */
  background-color: white;
  /* Restore sidebar color to white */
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 12px 0;
  margin: 15px;
}

/* Each column */
.column {
  flex: 1;
  overflow-y: auto;
  max-height: 85vh;
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(44, 78, 99, 0.08);
  display: flex;
  flex-direction: column;
  border: 1.5px solid #3C6E71;
}

/* Filters */
input[type="text"],
select {
  padding: 8px 12px;
  margin-bottom: 16px;
  border: 1.5px solid #3C6E71;
  border-radius: 8px;
  width: 100%;
  background: #D9D9D9;
  color: black;
}

input[type="text"]::placeholder {
  color: #284B63;
  opacity: 1;
}

select {
  background: #D9D9D9;
  color: #353535;
}

input[type="button"]{
  width:130px; height: 30px;
  background-color: #3C6E71;
  border: none; border-radius: 6px;
  margin:5px;
  color:white; font-weight: bold;
}

input[type="button"]:hover {
  opacity: 90%;
}
input[type="button"]:active{
  opacity: 75%;
}

input[value="ban"]{
  background-color: rgb(215, 1, 1) ;
}
input[value="delete group"]{
  background-color: rgb(215, 1, 1) ;
}

/* Ensure placeholder text color is black for all buttons, including those inside router links */
input[placeholder]::placeholder {
  color: black;
}

/* Cards */
.user-info,
.group-item,
.report-card {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(44, 78, 99, 0.08);
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #D9D9D9;
}

/* Images */
.user-pfp,
.group-pfp {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
  border: 2px solid #3C6E71;
}

/* Responsive */
@media (max-width: 1024px) {
  .moderator-dashboard {
    flex-direction: column;
  }
}

.row{
  display: flex; flex-direction: row;
}
.title{
  font-weight: bold;
}
</style>
