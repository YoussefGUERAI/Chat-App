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
        <p>{{ user.username }}</p>
        <p>{{ user.email }}</p>
        <router-link :to="`/profile/${user.id}`"><input placeholder="go to" class="goto" /></router-link>
        <input v-if="!(user.id === auth.currentUser?.uid)" type="button"
          :value="user.role === 'banned' ? 'unban' : 'ban'" @click="banUser(user.id)" />
      </div>
    </div>

    <!-- Groups Column -->
    <div class="column">
      <h2>Groups</h2>
      <input type="text" placeholder="Search group" v-model="groupFilter">
      <div v-for="group in filteredGroups" :key="group.id" class="group-item">
        <img :src="group.pfp" alt="Group Picture" class="group-pfp" />
        <p>{{ group.name }}</p>
        <p>{{ group.bio }}</p>

        <router-link :to="`/group/${group.id}`"><input placeholder="go to" class="goto" /></router-link>
        <!--go to group page-->

        <input placeholder="delete group" @click="deleteGroup(group.id)" class="goto" />
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
            <p>{{ report.target?.username }}</p>
          </div>
          <div v-else>
            <img :src="report.target?.pfp" alt="Group Picture" class="group-pfp" />
            <p>{{ report.target?.name }}</p>
          </div>
          <p>{{ report.reason }}</p>
          <p>{{ report.createdAt }}</p>
          <router-link><input type="button" placeholder="go to" /></router-link>
          <input v-if="report.targetType === 'user'" placeholder="Ban" @click="banUser(report.target.id)" />
          <input v-if="report.targetType === 'group'" placeholder="delete group"
            @click="deleteGroup(report.target.id)" />
          <input placeholder="delete report" @click="deleteReport(report.id)" />
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
  if (!userSearch) return []; // Only show results when input starts
  return usersList.value.filter(user => {
    const username = user.username?.trim().toLowerCase();
    return username && username.includes(userSearch);
  });
});

const filteredGroups = computed(() => {
  const groupSearch = groupFilter.value.trim().toLowerCase();
  if (!groupSearch) return []; // Only show results when input starts
  return groupList.value.filter(group => {
    const grouptitle = group.name?.trim().toLowerCase();
    return grouptitle && grouptitle.includes(groupSearch);
  });
});

const filteredReportList = computed(() => {
  const reportSearch = reportFilter.value.trim().toLowerCase();
  if (!reportSearch && reportCategory.value === 'All') return []; // Only show results when input starts
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
      await db.collection('users').doc(userID).update({
        role: 'user'
      })
      alert("user unbanned successfully !!")
    }
    else {
      await db.collection('users').doc(userID).update({
        role: 'banned'
      })
      alert("user banned successfully !!")
    }
  } catch (error) {
    alert("error: couldn't perform action !!")
    console.log("error banning user: ", error);
  }
  router.go(0)

}

const deleteGroup = async (groupID) => {
  try {
    await db.collection('group').doc(groupID).delete();
    alert("group deleted successfully !!")
  } catch (error) {
    alert("error: couldn't delete group !!")
    console.log("error deleting group: ", error);
  }
  router.go(0);
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

/* Action buttons */
input[type="button"],
input[placeholder="delete group"],
input[placeholder="delete report"],
input[placeholder="go to"] {
  background-color: #3C6E71;
  color: #000000;
  /* Make button text black */
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 6px;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

input[placeholder="Ban"],
input[placeholder="delete group"],
input[placeholder="delete report"],
input[placeholder="go to"] {
  background-color: #3C6E71;
  color: #000000;
  /* Make button text black */
}

input[type="button"]:hover,
input[placeholder="Ban"]:hover,
input[placeholder="delete group"]:hover,
input[placeholder="delete report"]:hover,
input[placeholder="go to"]:hover {
  background-color: #284B63;
  color: #000000;
  /* Keep button text black on hover */
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
</style>
