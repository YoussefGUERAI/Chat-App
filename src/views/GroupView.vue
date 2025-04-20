<template>
  
  <div class="back-btn-container">
            <button class="back-btn" @click="goToHome">
                <i class="fas fa-arrow-left"></i>
                <span>Back to Chat</span>
            </button>
  </div>
  <div class="group-profile-container" v-if="group">
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
        </li>
      </ul>
    </div>

  </div>

  <div v-else>
    <p>Loading group...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '@/firebase/config';

import { getUser } from '@/composables/getUser';

const route = useRoute();
const groupId = route.params.groupId;
const router = useRouter();

const group = ref(null);
const groupMembers = ref([]);


// Editable fields
const editedName = ref('');
const editedBio = ref('');
const isEditingName = ref(false);
const isEditingBio = ref(false);
const nameInputRef = ref(null);
const bioInputRef = ref(null);

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
    });
    isEditingName.value = false;
    isEditingBio.value = false;
    console.log("Group updated successfully");
  } catch (error) {
    console.error("Error updating group:", error);
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

      for (const uid of group.value.users) {
        const { userData } = getUser(uid);
        const wait = setInterval(() => {
          if (userData.value) {
            groupMembers.value.push(userData.value);
            clearInterval(wait);
          }
        }, 100);
      }
    }
  } catch (err) {
    console.error("Error fetching group:", err);
  }
};

const goToHome = () => {
  router.push("/home");
}

onMounted(fetchGroup);
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
</style>
