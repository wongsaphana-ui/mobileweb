<!-- src/views/AddExpense.vue หรือ src/pages/AddExpense.vue -->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/list"></ion-back-button>
        </ion-buttons>
        <ion-title>เพิ่มรายการใหม่</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-list>
        <!-- ชื่อรายการ -->
        <ion-item>
          <ion-input
            label="ชื่อรายการ"
            label-placement="floating"
            placeholder="เช่น ค่ากาแฟ / เงินเดือน"
            v-model="form.title"
            required
          ></ion-input>
        </ion-item>

        <!-- จำนวนเงิน -->
        <ion-item>
          <ion-input
            label="จำนวนเงิน (บาท)"
            label-placement="floating"
            type="number"
            inputmode="decimal"
            placeholder="0.00"
            v-model="form.amount"
            required
          >
            <template #end>฿</template>
          </ion-input>
        </ion-item>

        <!-- ประเภท รายรับ/รายจ่าย -->
        <ion-item>
          <ion-label position="floating">ประเภท</ion-label>
          <ion-select
            v-model="form.type"
            interface="popover"
            placeholder="เลือกประเภท"
            required
          >
            <ion-select-option value="income">รายรับ</ion-select-option>
            <ion-select-option value="expense">รายจ่าย</ion-select-option>
          </ion-select>
        </ion-item>

        <!-- หมวดหมู่ -->
        <ion-item>
          <ion-input
            label="หมวดหมู่"
            label-placement="floating"
            placeholder="เช่น อาหาร, การเดินทาง, เงินเดือน"
            v-model="form.category"
          ></ion-input>
        </ion-item>

        <!-- หมายเหตุ -->
        <ion-item>
          <ion-textarea
            label="หมายเหตุ (ถ้ามี)"
            label-placement="floating"
            placeholder="รายละเอียดเพิ่มเติม..."
            rows="3"
            auto-grow
            v-model="form.note"
          ></ion-textarea>
        </ion-item>
      </ion-list>

      <div class="ion-margin-top">
        <ion-button
          expand="block"
          color="success"
          :disabled="loading || !isFormValid"
          @click="saveExpense"
        >
          <ion-spinner v-if="loading" name="crescent"></ion-spinner>
          <span v-if="!loading">บันทึกข้อมูล</span>
          <span v-else>กำลังบันทึก...</span>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonInput, 
  IonSelect, 
  IonSelectOption, 
  IonTextarea, 
  IonButton, 
  IonBackButton, 
  IonButtons,
  IonSpinner,
  toastController
} from '@ionic/vue';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase'; // ปรับ path ตามโครงสร้างโปรเจคของคุณ

const router = useRouter();

const form = ref({
  title: '',
  amount: null as number | null,
  type: 'expense' as 'income' | 'expense',
  category: '',
  note: ''
});

const loading = ref(false);

const isFormValid = computed(() => {
  return (
    form.value.title.trim() !== '' &&
    form.value.amount !== null &&
    form.value.amount > 0 &&
    ['income', 'expense'].includes(form.value.type)
  );
});

const showToast = async (message: string, color: string = 'danger') => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'top'
  });
  await toast.present();
};

const saveExpense = async () => {
  if (!isFormValid.value) {
    showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
    return;
  }

  loading.value = true;

  try {
    await addDoc(collection(db, 'expenses'), {
      title: form.value.title.trim(),
      amount: Number(form.value.amount),
      type: form.value.type,
      category: form.value.category.trim() || null,
      note: form.value.note.trim() || null,
      createdAt: serverTimestamp(),     // ใช้ server time แทน new Date()
      updatedAt: serverTimestamp(),
      // ถ้าต้องการเก็บ userId ด้วย สามารถเพิ่มได้
      // userId: currentUser.value?.uid
    });

    await showToast('บันทึกรายการสำเร็จ', 'success');
    
    // รีเซ็ตฟอร์ม (optional)
    form.value = {
      title: '',
      amount: null,
      type: 'expense',
      category: '',
      note: ''
    };

    // กลับไปหน้าหลัก
    router.push('/tabs/list');

  } catch (error) {
    console.error('Error adding expense:', error);
    await showToast('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่', 'danger');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
ion-button {
  margin-top: 1.5rem;
}
</style>