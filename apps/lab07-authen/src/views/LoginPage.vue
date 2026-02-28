<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>เข้าสู่ระบบ</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-list>
        <ion-item button @click="showEmail = !showEmail">
          <ion-label>เข้าสู่ระบบด้วย Email / รหัสผ่าน</ion-label>
        </ion-item>
        <ion-item button @click="loginGoogle">
          <ion-label>เข้าสู่ระบบด้วย Google</ion-label>
        </ion-item>
        <ion-item button @click="showPhone = !showPhone">
          <ion-label>เข้าสู่ระบบด้วยเบอร์โทรศัพท์</ion-label>
        </ion-item>
      </ion-list>

      <!-- ส่วน Email / Password -->
      <div v-if="showEmail" class="section">
        <ion-item>
          <ion-label position="floating">อีเมล</ion-label>
          <ion-input
            v-model="email"
            type="email"
            autocomplete="email"
            inputmode="email"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">รหัสผ่าน</ion-label>
          <ion-input
            v-model="password"
            type="password"
            autocomplete="current-password"
          ></ion-input>
        </ion-item>

        <ion-button
          expand="block"
          @click="loginEmail"
          class="ion-margin-top"
          :disabled="isLoading"
        >
          {{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
        </ion-button>
      </div>

      <!-- ส่วน Phone Login -->
      <div v-if="showPhone" class="section">
        <ion-item>
          <ion-label position="floating">เบอร์โทรศัพท์ (เช่น +66xxxxxxxxx)</ion-label>
          <ion-input
            v-model="phone"
            type="tel"
            inputmode="tel"
            placeholder="+669xxxxxxxx"
          ></ion-input>
        </ion-item>

        <ion-button
          expand="block"
          @click="startPhone"
          class="ion-margin-top"
          :disabled="isLoading || !phone"
        >
          {{ isLoading ? 'กำลังส่ง...' : 'ส่งรหัส' }}
        </ion-button>

        <ion-item v-if="verificationId">
          <ion-label position="floating">รหัสยืนยัน (6 หลัก)</ion-label>
          <ion-input
            v-model="code"
            type="number"
            inputmode="numeric"
            :maxlength="6"
            pattern="[0-9]*"
            autocomplete="one-time-code"
          ></ion-input>
        </ion-item>

        <ion-button
          v-if="verificationId"
          expand="block"
          @click="confirmCode"
          class="ion-margin-top"
          :disabled="isLoading || code.length !== 6"
        >
          {{ isLoading ? 'กำลังตรวจสอบ...' : 'ยืนยันรหัส' }}
        </ion-button>
      </div>

      <!-- reCAPTCHA container สำหรับ Firebase Phone Auth -->
      <div id="recaptcha-container"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/auth/auth-service'; // ปรับ path ตามโครงสร้างโปรเจคของคุณ

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
} from '@ionic/vue';

const router = useRouter();

const showEmail = ref(false);
const showPhone = ref(false);

const email = ref('');
const password = ref('');

const phone = ref('');
const verificationId = ref('');
const code = ref('');

const isLoading = ref(false);

// จำกัดความยาว code ให้ไม่เกิน 6 หลัก (ป้องกันกรณี maxlength ไม่ทำงานบางเบราว์เซอร์)
watch(code, (newVal) => {
  if (newVal && newVal.length > 6) {
    code.value = newVal.slice(0, 6);
  }
});

async function loginEmail() {
  if (!email.value || !password.value) return alert('กรุณากรอกอีเมลและรหัสผ่าน');

  isLoading.value = true;
  try {
    await authService.loginWithEmailPassword({
      email: email.value.trim(),
      password: password.value,
    });
    await router.replace('/tabs/tab1');
  } catch (err: any) {
    alert('เข้าสู่ระบบล้มเหลว: ' + (err.message || 'เกิดข้อผิดพลาด'));
  } finally {
    isLoading.value = false;
  }
}

async function loginGoogle() {
  isLoading.value = true;
  try {
    await authService.loginWithGoogle();
    await router.replace('/tabs/tab1');
  } catch (err: any) {
    alert('Google Login ล้มเหลว: ' + (err.message || 'เกิดข้อผิดพลาด'));
  } finally {
    isLoading.value = false;
  }
}

async function startPhone() {
  if (!phone.value.startsWith('+')) {
    return alert('กรุณาระบุรหัสประเทศ เช่น +66xxxxxxxxx');
  }

  isLoading.value = true;
  try {
    const result = await authService.startPhoneLogin({
      phoneNumberE164: phone.value.trim(),
    });
    verificationId.value = result.verificationId;
    alert('ส่งรหัสยืนยันเรียบร้อย กรุณาตรวจสอบ SMS');
  } catch (err: any) {
    alert('ไม่สามารถส่งรหัสได้: ' + (err.message || 'เกิดข้อผิดพลาด'));
  } finally {
    isLoading.value = false;
  }
}

async function confirmCode() {
  if (code.value.length !== 6) return alert('กรุณากรอกรหัส 6 หลัก');

  isLoading.value = true;
  try {
    await authService.confirmPhoneCode({
      verificationId: verificationId.value,
      verificationCode: code.value,
    });
    await router.replace('/tabs/tab1');
  } catch (err: any) {
    alert('รหัสไม่ถูกต้อง: ' + (err.message || 'เกิดข้อผิดพลาด'));
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.section {
  margin-top: 1.5rem;
  padding: 0 0.5rem;
}

ion-button {
  --border-radius: 12px;
  margin-top: 1rem;
  text-transform: none;
}

ion-item {
  --border-radius: 12px;
  margin-bottom: 1rem;
}
</style>