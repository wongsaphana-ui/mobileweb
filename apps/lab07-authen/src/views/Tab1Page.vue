<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-card v-if="user">
  <ion-card-header>
    <ion-card-title>ข้อมูลผู้ใช้</ion-card-title>
  </ion-card-header>

  <ion-card-content>
    <p><strong>UID:</strong> {{ user.uid }}</p>
    <p><strong>Email:</strong> {{ user.email }}</p>
    <p><strong>Phone:</strong> {{ user.phoneNumber }}</p>
    <p><strong>Name:</strong> {{ user.displayName }}</p>

    <img
      v-if="user.photoUrl"
      :src="user.photoUrl"
      width="100"
    />
  </ion-card-content>
</ion-card>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle,
  IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent
} from '@ionic/vue'

import { ref, onMounted } from 'vue'
import { authService } from '@/auth/auth-service'

interface AuthUser {
  uid: string;
  email?: string | null;
  phoneNumber?: string | null;
  displayName?: string | null;
  photoUrl?: string | null;
}

const user = ref<AuthUser | null>(null)

onMounted(async () => {
  user.value = await authService.getCurrentUser()
})
</script>