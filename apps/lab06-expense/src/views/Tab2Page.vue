<!-- src/views/ExpenseList.vue หรือ src/pages/tabs/List.vue -->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>รายการรายรับ-รายจ่าย</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Summary Card -->
      <ion-card class="ion-margin">
        <ion-card-header>
          <ion-card-title>สรุปภาพรวม</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col size="6" class="ion-text-center">
                <div class="summary-label">รายรับทั้งหมด</div>
                <div class="summary-value income">{{ totalIncome | formatNumber }} ฿</div>
              </ion-col>
              <ion-col size="6" class="ion-text-center">
                <div class="summary-label">รายจ่ายทั้งหมด</div>
                <div class="summary-value expense">{{ totalExpense | formatNumber }} ฿</div>
              </ion-col>
            </ion-row>
            <ion-row class="ion-margin-top">
              <ion-col class="ion-text-center">
                <div class="summary-label">ยอดสุทธิ</div>
                <div class="summary-value net" :class="{ positive: netAmount >= 0, negative: netAmount < 0 }">
                  {{ netAmount | formatNumber }} ฿
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <!-- Loading State -->
      <ion-list v-if="loading">
        <ion-item>
          <ion-label>กำลังโหลดข้อมูล...</ion-label>
          <ion-spinner slot="end" name="crescent"></ion-spinner>
        </ion-item>
      </ion-list>

      <!-- Empty State -->
      <div v-else-if="expenses.length === 0" class="ion-text-center ion-padding">
        <ion-icon :icon="cashOutline" size="large" color="medium"></ion-icon>
        <p>ยังไม่มีรายการ</p>
        <ion-button router-link="/tabs/add" color="success">เพิ่มรายการใหม่</ion-button>
      </div>

      <!-- Expense List -->
      <ion-list v-else>
        <ion-item
          v-for="item in expenses"
          :key="item.id"
          button
          detail
          @click="goToEdit(item.id)"
        >
          <ion-icon
            slot="start"
            :icon="item.type === 'income' ? arrowUpCircle : arrowDownCircle"
            :color="item.type === 'income' ? 'success' : 'danger'"
            size="large"
          ></ion-icon>

          <ion-label>
            <h2>{{ item.title }}</h2>
            <h3 v-if="item.category">{{ item.category }}</h3>
            <p v-if="item.note">{{ item.note }}</p>
            <p class="timestamp">
              {{ item.createdAt?.toDate() | formatDate }}
            </p>
          </ion-label>

          <ion-note slot="end" :color="item.type === 'income' ? 'success' : 'danger'">
            {{ item.type === 'income' ? '+' : '-' }}{{ item.amount | formatNumber }} ฿
          </ion-note>
        </ion-item>
      </ion-list>

      <!-- Floating Action Button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="success" router-link="/tabs/add">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, 
  IonLabel, IonNote, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonGrid, IonRow, IonCol, IonFab, IonFabButton, IonSpinner 
} from '@ionic/vue';
import { collection, query, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  cashOutline, add, arrowUpCircle, arrowDownCircle 
} from 'ionicons/icons';

// ------------------- Data -------------------
const expenses = ref<any[]>([]);
const loading = ref(true);
let unsubscribe: Unsubscribe | null = null;

const router = useRouter();

// ------------------- Computed Summary -------------------
const totalIncome = computed(() => 
  expenses.value
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount), 0)
);

const totalExpense = computed(() => 
  expenses.value
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount), 0)
);

const netAmount = computed(() => totalIncome.value - totalExpense.value);

// ------------------- Real-time Listener -------------------
onMounted(() => {
  const q = query(
    collection(db, 'expenses'),
    orderBy('createdAt', 'desc')   // เรียงจากใหม่ → เก่า
  );

  unsubscribe = onSnapshot(q, (snapshot) => {
    expenses.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    loading.value = false;
  }, (error) => {
    console.error('Firestore listener error:', error);
    loading.value = false;
    // แนะนำ: แสดง toast แจ้ง error
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();   // สำคัญมาก! หยุดฟังเมื่อออกจากหน้า
  }
});

// ------------------- Navigation -------------------
const goToEdit = (id: string) => {
  router.push(`/tabs/edit/${id}`);
  // หรือถ้าใช้ name: router.push({ name: 'EditExpense', params: { id } });
};

// ------------------- Filters -------------------
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

const formatDate = (date: Date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};
</script>

<style scoped>
.summary-label {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}
.summary-value {
  font-size: 1.8rem;
  font-weight: bold;
}
.income { color: var(--ion-color-success); }
.expense { color: var(--ion-color-danger); }
.net.positive { color: var(--ion-color-success); }
.net.negative { color: var(--ion-color-danger); }
.timestamp {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
}
ion-note {
  font-size: 1.2rem;
  font-weight: bold;
}
</style>