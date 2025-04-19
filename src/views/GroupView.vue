<template>
  <div class="group-profile-container" v-if="group">
    <div class="back-btn-container">
      <button class="back-btn" @click="goToHome">
        <i class="fas fa-arrow-left"></i>
        <span>Back to Chat</span>
      </button>
    </div>
    <div class="group-header">
      <img :src="group.pfp" alt="Group Picture" class="group-pic" />

      <form v-if="isEditingName" @submit.prevent="saveGroupEdits">
        <input ref="nameInputRef" v-model="editedName" class="group-name" @blur="isEditingName = false" />
      </form>
      <h1 v-else class="group-name">
        {{ editedName }}
        <i class="bi bi-pencil" title="Edit Group Name" @click="startEditingName" />
      </h1>
    </div>

    <form v-if="isEditingBio" @submit.prevent="saveGroupEdits">
      <input ref="bioInputRef" v-model="editedBio" class="group-bio" @blur="isEditingBio = false" />
    </form>
    <p v-else class="group-bio">
      {{ editedBio }}
      <i class="bi bi-pencil" title="Edit Bio" @click="startEditingBio" />
    </p>

    <p class="group-date"><strong>Created At:</strong> {{ formattedDate }}</p>

    <div class="members-section">
      <h3>Members</h3>
      <ul class="members-list">
        <li v-for="user in groupMembers" :key="user.uid" class="member-item">
          <img :src="user.pfp" alt="User Picture" class="member-pic" />
          <router-link :to="{ name: 'profile', params: { uid: user.uid } }">
            {{ user.username || "Unknown User" }}
          </router-link>
          <!-- Don't show remove button for current user or if only one member left -->
          <button v-if="user.uid !== currentUser?.uid && groupMembers.length > 1" 
            @click="removeMember(user.uid)"
            class="remove-member-btn" 
            title="Remove from group">
            <i class="bi bi-x-circle"></i>
          </button>
        </li>
      </ul>
    </div>

    <div class="add-members">
      <button class="btn btn-primary" @click="showPlus = !showPlus"
        style="background-color: #284B63; color: #FFFFFF; border-color: #284B63;">
        <i class="bi bi-plus-circle "></i> Add Members
      </button>
      <div v-show="showPlus">
        <input type="text" placeholder="Search by username..." v-model="searchQuery" class="form-control"
          style="border-color: #D9D9D9; color: #353535; background-color: #FFFFFF;" />
        <div v-if="searchQuery.trim() && filteredUsers && filteredUsers.length" class="txt">
          <label style="color: #353535;">Matching users:</label>
          <div v-for="user in filteredUsers" :key="user.uid" class="user-select-row"
            :class="{ selected: selectedUserIds.includes(user.uid) }" @click="selectUser(user.uid)"
            style="background-color: #FFFFFF; border-color: #D9D9D9;">
            <input type="checkbox" :id="user.uid" :value="user.uid" v-model="selectedUserIds"
              v-if="user.uid !== currentUser.uid" class="form-check-input" style="border-color: #D9D9D9;" />
            <label :for="user.uid" class="form-check-label" style="color: #353535;">
              {{ user.username }}
            </label>
          </div>
        </div>
        <div v-else-if="searchQuery.trim() && (!filteredUsers || !filteredUsers.length)" class="txt">
          <p style="color: #353535;">No matching users found.</p>
        </div>
        <button @click="addMemberToGroup" class="btn btn-primary mt-3"
          style="background-color: #3C6E71; color: #FFFFFF; border-color: #3C6E71;">Add Member</button>
      </div>
    </div>

  </div>

  <div v-else>
    <p>Loading group...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db, firebase } from '@/firebase/config';
import { getUser, getCurrentUser, getAllUsers } from '@/composables/getUser';

const route = useRoute();
const router = useRouter();
const groupId = route.params.groupId;

const group = ref(null);
const groupMembers = ref([]);
const searchQuery = ref('');
const filteredUsers = ref([]);
// Replace single user selection with an array for multiple selections
const selectedUserIds = ref([]);
const currentUser = ref(null);
const allUsers = ref([]);

// Editable fields
const editedName = ref('');
const editedBio = ref('');
const isEditingName = ref(false);
const isEditingBio = ref(false);
const nameInputRef = ref(null);
const bioInputRef = ref(null);
const showPlus = ref(false);

const formattedDate = computed(() => {
  if (group.value?.createdAt?.toDate) {
    return group.value.createdAt.toDate().toLocaleString();
  }
  return '';
});

// --- Editing logic
const startEditingName = () => {
  isEditingName.value = true;
  nextTick(() => {
    nameInputRef.value?.focus();
  });
};

const startEditingBio = () => {
  isEditingBio.value = true;
  nextTick(() => {
    bioInputRef.value?.focus();
  });
};

const saveGroupEdits = async () => {
  try {
    const groupRef = db.collection('group').doc(groupId);
    await groupRef.update({
      name: editedName.value,
      bio: editedBio.value,
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
    });
    isEditingName.value = false;
    isEditingBio.value = false;
    console.log("Group updated successfully");
  } catch (error) {
    console.error("Error updating group:", error);
  }
};

// --- Group member adding logic
const fetchUsers = async () => {
  try {
    // Get current user data
    const { userData } = getCurrentUser();
    const waitForCurrentUser = setInterval(() => {
      if (userData.value) {
        currentUser.value = userData.value;
        clearInterval(waitForCurrentUser);
      }
    }, 100);

    // Get all users
    const { users, loading } = getAllUsers();
    const waitForUsers = setInterval(() => {
      if (!loading.value) {
        allUsers.value = users.value;
        clearInterval(waitForUsers);
      }
    }, 100);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

// Updated to toggle selection of multiple users
const selectUser = (uid) => {
  const index = selectedUserIds.value.indexOf(uid);
  if (index === -1) {
    selectedUserIds.value.push(uid);
  } else {
    selectedUserIds.value.splice(index, 1);
  }
};

// Filter users based on search query and exclude group members
const filterUsers = () => {
  if (!allUsers.value.length) return;

  // Get IDs of current group members
  const memberIds = group.value?.users || [];

  // Filter users who are not already in the group and match the search query
  filteredUsers.value = allUsers.value.filter(user =>
    !memberIds.includes(user.uid) &&
    user.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
};

// Watch search query to update filtered users list
watch(searchQuery, filterUsers);
watch(allUsers, filterUsers);

// Updated to handle multiple user selections
const addMemberToGroup = async () => {
  if (!selectedUserIds.value.length) {
    console.error('No users selected');
    return;
  }

  try {
    const groupRef = db.collection('group').doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      console.error('Group does not exist');
      return;
    }

    const groupData = groupDoc.data();
    
    // Filter out users who are already in the group
    const newUserIds = selectedUserIds.value.filter(uid => !groupData.users.includes(uid));
    
    if (newUserIds.length === 0) {
      console.warn('All selected users are already members of the group');
      // Clear search input even if no new members were added
      searchQuery.value = '';
      return;
    }

    // Update the group document with the new members
    await groupRef.update({
      users: [...groupData.users, ...newUserIds],
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Add a system message for each new member
    for (const uid of newUserIds) {
      const selectedUser = allUsers.value.find(user => user.uid === uid);
      if (selectedUser) {
        await groupRef.collection('messages').add({
          content: `${selectedUser.username} was added to the group by ${currentUser.value?.username || 'Admin'}.`,
          sender_id: currentUser.value?.uid,
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    // Reset UI state
    console.log(`${newUserIds.length} user(s) added to group successfully`);
    selectedUserIds.value = [];
    searchQuery.value = ''; // Clear the search input
    showPlus.value = false;
    
    // Refresh group data to show the new members
    groupMembers.value = [];
    await fetchGroup();
  } catch (error) {
    console.error('Error adding members to group:', error);
    // Clear search input even if there was an error
    searchQuery.value = '';
  }
};

// --- Fetch group
const fetchGroup = async () => {
  try {
    const docSnap = await db.collection('group').doc(groupId).get();
    if (docSnap.exists) {
      group.value = docSnap.data();
      editedName.value = group.value.name;
      editedBio.value = group.value.bio;

      // Clear existing members to avoid duplicates on refresh
      groupMembers.value = [];

      for (const uid of group.value.users) {
        const { userData } = getUser(uid);
        const wait = setInterval(() => {
          if (userData.value) {
            groupMembers.value.push(userData.value);
            clearInterval(wait);
          }
        }, 100);
      }

      // Filter users again after group is loaded
      filterUsers();
    }
  } catch (err) {
    console.error("Error fetching group:", err);
  }
};

const removeMember = async (uid) => {
  // Ask for confirmation before proceeding
  if (!confirm("Are you sure you want to remove this member from the group?")) {
    return; // User canceled the operation
  }

  try {
    const groupRef = db.collection('group').doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      console.error('Group does not exist');
      return;
    }

    const groupData = groupDoc.data();

    // Remove the user from the group
    const updatedUserIds = groupData.users.filter(userId => userId !== uid);

    await groupRef.update({
      users: updatedUserIds,
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Add a system message for the removed member
    const removedUser = allUsers.value.find(user => user.uid === uid);
    if (removedUser) {
      await groupRef.collection('messages').add({
        content: `${removedUser.username} was removed from the group by ${currentUser.value?.username || 'Admin'}.`,
        sender_id: currentUser.value?.uid,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Reset UI state
    console.log(`${removedUser.username} removed from group successfully`);
    await fetchGroup();
  } catch (error) {
    console.error('Error removing member from group:', error);
  }
};

onMounted(() => {
  fetchGroup();
  fetchUsers();
});

const goToHome = () => {
  router.push('/home');
};
</script>

<style scoped>
.group-profile-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 32px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.group-pic {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid #d9d9d9;
  object-fit: cover;
}

.group-name {
  font-size: 24px;
  font-weight: 600;
  color: #284B63;
  position: relative;
}

.group-name i {
  margin-left: 10px;
  cursor: pointer;
}

.group-bio {
  font-size: 16px;
  color: #353535;
  margin: 20px 0;
}

.group-bio i {
  margin-left: 10px;
  cursor: pointer;
}

.group-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.members-section {
  margin-top: 20px;
}

.members-list {
  list-style: none;
  padding: 0;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FFFFFF;
  padding: 10px 14px;
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.member-item:hover {
  transform: translateY(-2px);
}

.member-pic {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #D9D9D9;
}

a {
  color: #353535;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

a:hover {
  color: #3C6E71;
}

.back-btn-container {
  width: 100%;
  max-width: 800px;
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

/* New styles for user search and selection */
.add-members {
  margin-top: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-select-row {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #D9D9D9;
  border-radius: 8px;
  margin-top: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #FFFFFF;
}

.user-select-row:hover {
  background-color: #f0f8ff;
  transform: translateY(-2px);
  border-color: #3C6E71;
}

.user-select-row.selected {
  background-color: rgba(60, 110, 113, 0.1); /* Light version of #3C6E71 */
  border-color: #3C6E71;
}

.form-control {
  margin: 15px 0;
  padding: 10px;
  border-radius: 8px;
  border-color: #D9D9D9;
  color: #353535;
}

.form-check-input {
  margin-right: 10px;
  accent-color: #284B63;
  border-color: #D9D9D9;
}

.form-check-input:checked {
  background-color: #284B63;
  border-color: #284B63;
}

.form-check-label {
  color: #353535;
}

.txt {
  margin-top: 15px;
  color: #353535;
}

/* Custom checkbox styling */
input[type="checkbox"] {
  position: relative;
  width: 18px;
  height: 18px;
  /* -webkit-appearance: none; */
  outline: none;
  cursor: pointer;
  border: 2px solid #D9D9D9;
  border-radius: 3px;
  background: #FFFFFF;
  transition: all 0.2s ease;
}

input[type="checkbox"]:checked {
  background-color: #284B63;
  border-color: #284B63;
}

input[type="checkbox"]:checked::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 5px;
  height: 10px;
  border: solid #FFFFFF;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

input[type="checkbox"]:hover {
  border-color: #3C6E71;
}

.remove-member-btn {
  background: none;
  border: none;
  color: #d9534f;
  cursor: pointer;
  font-size: 1.2rem;
  margin-left: auto;
  transition: color 0.2s ease;
}

.remove-member-btn:hover {
  color: #c9302c;
}
</style>
