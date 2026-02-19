<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/list"></ion-back-button>
        </ion-buttons>
        <ion-title>แก้ไขรายการ</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Loading ขณะดึงข้อมูล -->
      <div v-if="loading" class="ion-text-center ion-padding">
        <ion-spinner name="crescent"></ion-spinner>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <!-- ฟอร์มแก้ไข -->
      <ion-list v-else>
        <ion-item>
          <ion-input
            label="ชื่อรายการ"
            label-placement="floating"
            placeholder="เช่น ค่ากาแฟ / เงินเดือน"
            v-model="form.title"
            required
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            label="จำนวนเงิน (บาท)"
            label-placement="floating"
            type="number"
            inputmode="decimal"
            placeholder="0.00"
            v-model.number="form.amount"
            required
          >
            <div slot="end">฿</div>
          </ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">ประเภท</ion-label>
          <ion-select v-model="form.type" interface="popover">
            <ion-select-option value="income">รายรับ</ion-select-option>
            <ion-select-option value="expense">รายจ่าย</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-input
            label="หมวดหมู่"
            label-placement="floating"
            placeholder="เช่น อาหาร, การเดินทาง, เงินเดือน"
            v-model="form.category"
          ></ion-input>
        </ion-item>

        <ion-item lines="none">
          <ion-textarea
            label="หมายเหตุ"
            label-placement="floating"
            placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
            auto-grow
            v-model="form.note"
          ></ion-textarea>
        </ion-item>
      </ion-list>

      <!-- ปุ่มบันทึก + ลบ -->
      <div class="ion-margin-top" v-if="!loading">
        <ion-button
          expand="block"
          color="primary"
          :disabled="saving || !form.title || form.amount <= 0"
          @click="saveChanges"
        >
          <ion-spinner name="dots" v-if="saving"></ion-spinner>
          บันทึกการแก้ไข
        </ion-button>

        <ion-button
          expand="block"
          fill="outline"
          color="danger"
          class="ion-margin-top"
          :disabled="saving"
          @click="confirmDelete"
        >
          ลบรายการนี้
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
  alertController,
  toastController
} from '@ionic/vue';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase'; // ปรับ path ตามโปรเจคของคุณ

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const form = ref({
  title: '',
  amount: 0,
  type: 'expense' as 'income' | 'expense',
  category: '',
  note: ''
});

const loading = ref(true);
const saving = ref(false);

onMounted(async () => {
  if (!id) {
    await showToast('ไม่พบ ID รายการ', 'danger');
    router.back();
    return;
  }

  try {
    const docRef = doc(db, 'expenses', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      form.value = {
        title: data.title || '',
        amount: Number(data.amount) || 0,
        type: data.type || 'expense',
        category: data.category || '',
        note: data.note || ''
      };
    } else {
      await showToast('ไม่พบรายการนี้ในฐานข้อมูล', 'warning');
      router.push('/tabs/list');
    }
  } catch (error) {
    console.error('โหลดข้อมูลล้มเหลว:', error);
    await showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'danger');
  } finally {
    loading.value = false;
  }
});

const saveChanges = async () => {
  if (!form.value.title.trim() || form.value.amount <= 0) {
    await showToast('กรุณากรอกชื่อรายการและจำนวนเงินให้ถูกต้อง', 'warning');
    return;
  }

  saving.value = true;

  try {
    const docRef = doc(db, 'expenses', id);
    await updateDoc(docRef, {
      title: form.value.title.trim(),
      amount: Number(form.value.amount),
      type: form.value.type,
      category: form.value.category.trim() || null,
      note: form.value.note.trim() || null,
      updatedAt: serverTimestamp()
    });

    await showToast('แก้ไขข้อมูลสำเร็จ', 'success');
    router.push('/tabs/list');
  } catch (error) {
    console.error('อัปเดตล้มเหลว:', error);
    await showToast('ไม่สามารถบันทึกการแก้ไขได้ กรุณาลองใหม่', 'danger');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  const alert = await alertController.create({
    header: 'ยืนยันการลบ',
    message: 'คุณแน่ใจหรือไม่ที่จะลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้',
    buttons: [
      {
        text: 'ยกเลิก',
        role: 'cancel'
      },
      {
        text: 'ลบ',
        role: 'destructive',
        handler: async () => {
          await performDelete();
        }
      }
    ]
  });

  await alert.present();
};

const performDelete = async () => {
  saving.value = true;

  try {
    const docRef = doc(db, 'expenses', id);
    await deleteDoc(docRef);

    await showToast('ลบรายการสำเร็จ', 'success');
    router.push('/tabs/list');
  } catch (error) {
    console.error('ลบล้มเหลว:', error);
    await showToast('ไม่สามารถลบรายการได้ กรุณาลองใหม่', 'danger');
  } finally {
    saving.value = false;
  }
};

const showToast = async (message: string, color: string = 'success') => {
  const toast = await toastController.create({
    message,
    duration: 2200,
    color,
    position: 'top'
  });
  await toast.present();
};
</script>

<style scoped>
ion-button {
  margin: 12px 0;
}

ion-button[color="danger"][fill="outline"] {
  --border-color: var(--ion-color-danger);
  --color: var(--ion-color-danger);
}
</style>