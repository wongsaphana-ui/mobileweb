<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Photo Gallery</ion-title>
        โดย วงศพันธ์ อนันตวงศ์ รหัส 663380496-8
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Photo Gallery</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- 🔽 แสดงรูปที่อัปโหลด -->
      <ion-grid>
        <ion-row>
          <ion-col
            size="6"
            v-for="photo in photos"
            :key="photo.filepath"
          >
            <ion-img :src="photo.webviewPath" />
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- ปุ่มถ่ายรูป -->
      <ion-fab vertical="bottom" horizontal="center" slot="fixed">
        <ion-fab-button @click="addNewToGallery()">
          <ion-icon :icon="camera"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { camera } from 'ionicons/icons';
import {
  IonPage,
  IonHeader,
  IonFab,
  IonFabButton,
  IonIcon,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonImg
} from '@ionic/vue';

import { usePhotoGallery } from '@/composables/usePhotoGallery';

// 🔴 ต้องดึง photos มาด้วย
const { addNewToGallery, photos } = usePhotoGallery();
</script>
