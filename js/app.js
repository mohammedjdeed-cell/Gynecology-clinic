// js/app.js
import { subscribeToPatients, savePatientRecord, deletePatientRecord, exportDatabase } from './storage.js';
import { renderList } from './ui.js';
import { promptPwaInstall } from './pwa-register.js';

let currentPatientsList = [];

function initApp() {
  const patientListContainer = document.getElementById('patientList');
  const searchInput = document.getElementById('searchInput');
  const patientModal = document.getElementById('patientModal');
  const patientForm = document.getElementById('patientForm');
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const exportBtn = document.getElementById('exportBtn');
  const installBtn = document.getElementById('installBtn');

  function refreshView() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const filtered = currentPatientsList.filter(p => 
      (p.name && p.name.toLowerCase().includes(query)) || 
      (p.phone && p.phone.includes(query))
    );
    renderList(filtered, patientListContainer, handleDelete);
    const countEl = document.getElementById('patientCount');
    if (countEl) countEl.innerText = `إجمالي المريضات: ${filtered.length}`;
  }

  async function handleDelete(id) {
    if (confirm('هل أنتِ متأكدة من حذف هذا الملف نهائياً؟')) {
      await deletePatientRecord(id);
    }
  }

  // ربط أزرار النافذة المنبثقة فوراً
  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      patientModal.classList.remove('hidden');
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      patientModal.classList.add('hidden');
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => exportDatabase(currentPatientsList));
  }

  if (installBtn) {
    installBtn.addEventListener('click', promptPwaInstall);
  }

  if (searchInput) {
    searchInput.addEventListener('input', refreshView);
  }

  // حفظ المريضة
  if (patientForm) {
    patientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = patientForm.querySelector('button[type="submit"]');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText = 'جاري الحفظ...';
      }

      const newRecord = {
        name: document.getElementById('pName').value,
        phone: document.getElementById('pPhone').value,
        age: document.getElementById('pAge').value,
        blood: document.getElementById('pBlood').value,
        g: document.getElementById('pG').value,
        vd: document.getElementById('pVD').value,
        cs: document.getElementById('pCS').value,
        a: document.getElementById('pA').value,
        obsNotes: document.getElementById('pObsNotes').value,
        lmp: document.getElementById('pLMP').value,
        medHistory: document.getElementById('pMedicalHistory').value,
        allergies: document.getElementById('pAllergies').value,
        bp: document.getElementById('pBP').value,
        weight: document.getElementById('pWeight').value,
        ultrasound: document.getElementById('pUltrasound').value,
        rx: document.getElementById('pRx').value
      };

      try {
        await savePatientRecord(newRecord);
        patientForm.reset();
        patientModal.classList.add('hidden');
      } catch (err) {
        alert('حدث خطأ أثناء الحفظ، يرجى المحاولة ثانية');
        console.error(err);
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerText = 'حفظ الملف';
        }
      }
    });
  }

  // الاستماع لقاعدة بيانات Firebase الحية
  subscribeToPatients((patients) => {
    currentPatientsList = patients;
    refreshView();
  });
}

// تشغيل التطبيق سواء تم تحميل الصفحة أو كان المتصفح جاهزاً
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
