<template>
  <ion-app>
    <ion-router-outlet />
    <ion-loading
      :is-open="isLoading"
      message="กำลังโหลด..."
    ></ion-loading>
  </ion-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonApp, IonRouterOutlet, IonLoading } from '@ionic/vue';

const isLoading = ref(true);

onMounted(() => {
  // อนุญาตให้ router พร้อม แล้วปิด loading
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});
</script>
