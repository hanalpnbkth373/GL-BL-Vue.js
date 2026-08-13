<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../supabase'
import { Edit, Trash2, X, Save, Loader2, Search, ChevronLeft, ChevronRight, Image as ImageIcon, Eye, EyeOff, Star, Upload, Download } from 'lucide-vue-next'

const seriesList = ref([])
const isLoading = ref(true)

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = ref(1)
const totalItems = ref(0)

const isEditModalOpen = ref(false)
const isSaving = ref(false)
const isImporting = ref(false)
const editForm = ref({})
const notification = ref({ show: false, message: '', type: 'success' })
const fileInput = ref(null)

const getYoutubeId = (url) => url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/) ? url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/)[1] : null
const getThumbnail = (url) => getYoutubeId(url) ? `https://img.youtube.com/vi/${getYoutubeId(url)}/hqdefault.jpg` : ''

const fetchSeries = async () => {
  isLoading.value = true
  try {
    let query = supabase.from('series').select('*', { count: 'exact' })
    if (searchQuery.value) query = query.ilike('title', `%${searchQuery.value}%`)
    const from = (currentPage.value - 1) * itemsPerPage
    query = query.order('created_at', { ascending: false }).range(from, from + itemsPerPage - 1)
    
    const { data, count, error } = await query
    if (error) throw error
    if (data) {
      seriesList.value = data
      totalItems.value = count || 0
      totalPages.value = Math.ceil((count || 0) / itemsPerPage) || 1
    }
  } catch (error) { console.error('Error fetching series:', error) } 
  finally { isLoading.value = false }
}

onMounted(() => fetchSeries())

let searchTimeout
const handleSearch = () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => { currentPage.value = 1; fetchSeries() }, 500) }
const changePage = (page) => { if (page >= 1 && page <= totalPages.value) { currentPage.value = page; fetchSeries() } }

const openEditModal = (item) => { editForm.value = { ...item }; isEditModalOpen.value = true }
const closeEditModal = () => { isEditModalOpen.value = false; editForm.value = {} }
const showNotification = (message, type = 'success') => { notification.value = { show: true, message, type }; setTimeout(() => notification.value.show = false, 3000) }

const handleUpdate = async () => {
  isSaving.value = true
  try {
    const { error } = await supabase.from('series').update({ ...editForm.value }).eq('id', editForm.value.id)
    if (error) throw error
    showNotification('อัปเดตข้อมูลสำเร็จ')
    closeEditModal()
    fetchSeries()
  } catch (error) { showNotification(error.message, 'error') } 
  finally { isSaving.value = false }
}

const handleDelete = async (id, title) => {
  if (!confirm(`ต้องการลบ "${title}" ใช่หรือไม่?`)) return
  try {
    const { error } = await supabase.from('series').delete().eq('id', id)
    if (error) throw error
    showNotification('ลบซีรีส์สำเร็จ')
    fetchSeries()
  } catch (error) { showNotification(error.message, 'error') }
}

// ---------------- CSV Export ----------------
const exportCSV = () => {
  const headers = ['title', 'type', 'genres', 'air_date', 'air_time', 'trailer_url', 'watch_platform', 'director', 'rating', 'description', 'status', 'is_hero']
  let csvContent = "\uFEFF" + headers.join(',') + '\n' // BOM for Thai language
  
  seriesList.value.forEach(row => {
    let rowData = headers.map(header => {
      let cell = row[header] === null || row[header] === undefined ? '' : String(row[header])
      return `"${cell.replace(/"/g, '""')}"` // หนีเครื่องหมายคำพูด (Escape quotes)
    })
    csvContent += rowData.join(',') + '\n'
  })
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = "series_export.csv"
  link.click()
}

// ---------------- CSV Import ----------------
const triggerImport = () => fileInput.value.click()

const parseCSV = (str) => {
  const arr = []; let quote = false; let row = 0, col = 0;
  for (let c = 0; c < str.length; c++) {
    let cc = str[c], nc = str[c+1];
    arr[row] = arr[row] || []; arr[row][col] = arr[row][col] || '';
    if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
    if (cc == '"') { quote = !quote; continue; }
    if (cc == ',' && !quote) { ++col; continue; }
    if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
    if (cc == '\n' && !quote) { ++row; col = 0; continue; }
    if (cc == '\r' && !quote) { ++row; col = 0; continue; }
    arr[row][col] += cc;
  }
  return arr;
}

const handleImport = (event) => {
  const file = event.target.files[0]
  if (!file) return
  isImporting.value = true
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = parseCSV(e.target.result)
      const headers = data[0].map(h => h.trim())
      const rowsToInsert = []
      
      for(let i = 1; i < data.length; i++) {
        if(data[i].length === 1 && data[i][0] === '') continue; // Skip empty rows
        const rowObj = {}
        headers.forEach((header, index) => { rowObj[header] = data[i][index] })
        // แปลง format ให้ตรง DB
        if(rowObj.is_hero === 'true' || rowObj.is_hero === 'TRUE') rowObj.is_hero = true
        else rowObj.is_hero = false
        if(!rowObj.status) rowObj.status = 'Published'
        
        rowsToInsert.push(rowObj)
      }
      
      const { error } = await supabase.from('series').insert(rowsToInsert)
      if (error) throw error
      showNotification(`นำเข้าข้อมูล ${rowsToInsert.length} รายการสำเร็จ!`)
      fetchSeries()
    } catch (err) {
      showNotification(`นำเข้าล้มเหลว: ${err.message}`, 'error')
    } finally {
      isImporting.value = false
      event.target.value = '' // reset
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="animate__animated animate__fadeIn max-w-[100vw] overflow-hidden">
    <div v-if="notification.show" :class="['fixed top-20 sm:top-6 right-4 sm:right-6 px-4 sm:px-6 py-3 rounded-xl font-medium shadow-lg z-[200] transition-all text-sm', notification.type === 'success' ? 'bg-[#00e054] text-black' : 'bg-red-500 text-white']">{{ notification.message }}</div>

    <!-- Header & Tools -->
    <div class="flex flex-col xl:flex-row xl:items-center justify-between mb-6 gap-4">
      <h1 class="text-2xl sm:text-3xl font-bold text-white border-l-4 border-emerald-400 pl-3">จัดการซีรีส์</h1>
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <!-- Export / Import Buttons -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <input type="file" ref="fileInput" accept=".csv" class="hidden" @change="handleImport">
          <button @click="triggerImport" :disabled="isImporting" class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg text-sm transition-colors border border-gray-600 disabled:opacity-50">
            <Loader2 v-if="isImporting" class="w-4 h-4 animate-spin"/>
            <Upload v-else class="w-4 h-4" /> <span class="hidden sm:inline">นำเข้า CSV</span>
          </button>
          <button @click="exportCSV" class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg text-sm transition-colors border border-gray-600">
            <Download class="w-4 h-4" /> <span class="hidden sm:inline">ส่งออก CSV</span>
          </button>
        </div>
        <!-- Search -->
        <div class="relative w-full sm:w-72">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search class="w-4 h-4 text-gray-500" /></div>
          <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="ค้นหาชื่อซีรีส์..." class="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-emerald-500 outline-none text-sm transition-colors">
        </div>
      </div>
    </div>
    
    <!-- Table -->
    <div class="glass-card rounded-xl overflow-hidden flex flex-col border border-white/5 bg-[#0a0a0a]">
      <div class="overflow-x-auto flex-grow custom-scrollbar">
        <table class="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr class="border-b border-gray-800 bg-black/40 text-gray-400 text-xs sm:text-sm whitespace-nowrap">
              <th class="p-3 font-medium w-24">ภาพปก</th>
              <th class="p-3 font-medium">สถานะ</th>
              <th class="p-3 font-medium">ชื่อเรื่อง</th>
              <th class="p-3 font-medium">ประเภท</th>
              <th class="p-3 font-medium">ช่องทางรับชม</th>
              <th class="p-3 font-medium text-center w-28">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading"><td colspan="6" class="p-10 text-center text-gray-400"><Loader2 class="w-5 h-5 animate-spin mx-auto mb-2"/> กำลังโหลด...</td></tr>
            <tr v-else-if="seriesList.length === 0"><td colspan="6" class="p-10 text-center text-gray-500">ไม่พบข้อมูล</td></tr>
            <tr v-for="item in seriesList" :key="item.id" class="border-b border-gray-800/50 hover:bg-white/5 transition-colors text-sm">
              <td class="p-3">
                <div class="w-16 h-10 sm:w-20 sm:h-12 bg-gray-900 rounded overflow-hidden flex items-center justify-center border border-gray-800 relative">
                  <img v-if="getYoutubeId(item.trailer_url)" :src="getThumbnail(item.trailer_url)" class="w-full h-full object-cover">
                  <ImageIcon v-else class="w-5 h-5 text-gray-600" />
                  <div v-if="item.is_hero" class="absolute top-0 right-0 bg-yellow-500 p-0.5 rounded-bl shadow-md"><Star class="w-3 h-3 text-black fill-black" /></div>
                </div>
              </td>
              <td class="p-3">
                <span v-if="item.status === 'Published'" class="flex items-center gap-1 text-[10px] sm:text-xs text-[#00e054] bg-[#00e054]/10 px-2 py-1 rounded border border-[#00e054]/20 w-fit"><Eye class="w-3 h-3"/> โชว์บนเว็บ</span>
                <span v-else class="flex items-center gap-1 text-[10px] sm:text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 w-fit"><EyeOff class="w-3 h-3"/> ดราฟต์</span>
              </td>
              <td class="p-3 text-white font-medium truncate max-w-[200px]">{{ item.title }}</td>
              <td class="p-3"><span :class="['text-[10px] sm:text-xs px-2 py-1 rounded border font-semibold', item.type === 'GL' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20']">{{ item.type }}</span></td>
              <td class="p-3 text-emerald-400 text-xs sm:text-sm font-medium">{{ item.watch_platform || '-' }}</td>
              <td class="p-3 text-center">
                <div class="flex items-center justify-center gap-1.5 sm:gap-2">
                  <button @click="openEditModal(item)" class="p-1.5 sm:p-2 bg-gray-800 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 rounded-md transition-colors"><Edit class="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                  <button @click="handleDelete(item.id, item.title)" class="p-1.5 sm:p-2 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-md transition-colors"><Trash2 class="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!isLoading && totalPages > 0" class="p-3 sm:p-4 border-t border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/20">
        <span class="text-xs sm:text-sm text-gray-500">แสดง {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }} จาก {{ totalItems }}</span>
        <div class="flex items-center gap-2">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="p-1.5 rounded-md bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50"><ChevronLeft class="w-4 h-4" /></button>
          <span class="text-xs sm:text-sm text-gray-300 font-medium px-2">หน้า {{ currentPage }} / {{ totalPages }}</span>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="p-1.5 rounded-md bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50"><ChevronRight class="w-4 h-4" /></button>
        </div>
      </div>
    </div>

    <!-- Edit Modal (อัปเดตเพิ่ม Status + แบนเนอร์) -->
    <div v-if="isEditModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 animate__animated animate__fadeIn animate__faster">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="closeEditModal"></div>
      
      <div class="relative w-full max-w-4xl glass-card rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[95vh] bg-[#0d131a]">
        <div class="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <h2 class="text-xl sm:text-2xl font-bold text-white">แก้ไขข้อมูลซีรีส์</h2>
          <button @click="closeEditModal" class="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><X class="w-5 h-5" /></button>
        </div>

        <div class="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          <form @submit.prevent="handleUpdate" class="space-y-4 sm:space-y-6">
            
            <div class="bg-black/30 p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-2">
              <div class="flex flex-col">
                <label class="text-gray-300 font-medium text-sm mb-2">สถานะการแสดงผล</label>
                <div class="flex bg-black/50 rounded-lg p-1 border border-gray-700 w-fit">
                  <button type="button" @click="editForm.status = 'Published'" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all', editForm.status === 'Published' ? 'bg-[#00e054] text-black font-bold' : 'text-gray-400 hover:text-white']"><Eye class="w-4 h-4"/> โชว์บนเว็บ</button>
                  <button type="button" @click="editForm.status = 'Draft'" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all', editForm.status === 'Draft' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white']"><EyeOff class="w-4 h-4"/> ซ่อน (ดราฟต์)</button>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <label class="flex items-center gap-2 cursor-pointer bg-black/50 px-4 py-2.5 rounded-lg border border-gray-700 hover:border-[#00e054] transition-colors">
                  <input type="checkbox" v-model="editForm.is_hero" class="w-4 h-4 rounded text-[#00e054] bg-gray-800 border-gray-700">
                  <Star class="w-4 h-4" :class="editForm.is_hero ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'" />
                  <span class="text-sm font-medium text-white">ปักหมุดเป็นแบนเนอร์สไลด์</span>
                </label>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-sm sm:text-base">
              <div class="space-y-1.5"><label class="text-gray-300">ชื่อเรื่อง</label><input v-model="editForm.title" type="text" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white outline-none"></div>
              <div class="space-y-1.5"><label class="text-gray-300">ประเภท</label><select v-model="editForm.type" class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white outline-none"><option value="GL">GL Series</option><option value="BL">BL Series</option></select></div>
              <div class="space-y-1.5"><label class="text-gray-300">หมวดหมู่</label><input v-model="editForm.genres" type="text" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white outline-none"></div>
              <div class="space-y-1.5"><label class="text-gray-300">ผู้กำกับ</label><input v-model="editForm.director" type="text" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white outline-none"></div>
              <div class="space-y-1.5"><label class="text-gray-300">วันออนแอร์</label><input v-model="editForm.air_date" type="text" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white outline-none"></div>
              <div class="space-y-1.5"><label class="text-gray-300">เวลาออนแอร์</label><input v-model="editForm.air_time" type="text" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white outline-none"></div>
              <div class="space-y-1.5"><label class="text-gray-300">ลิงก์ตัวอย่าง YouTube</label><input v-model="editForm.trailer_url" type="url" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white outline-none"></div>
              <div class="space-y-1.5"><label class="text-gray-300">คะแนนเรทติ้ง</label><input v-model="editForm.rating" type="number" step="0.1" max="10" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white outline-none"></div>
              <div class="space-y-1.5 md:col-span-2"><label class="text-gray-300">ช่องทางการรับชม (Watch Platform)</label><input v-model="editForm.watch_platform" type="text" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white outline-none"></div>
            </div>
            
            <div class="space-y-1.5">
              <label class="text-sm text-gray-300">เรื่องย่อ</label>
              <textarea v-model="editForm.description" rows="4" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white outline-none resize-none text-sm sm:text-base"></textarea>
            </div>
            
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button type="button" @click="closeEditModal" class="px-5 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 text-sm sm:text-base">ยกเลิก</button>
              <button type="submit" :disabled="isSaving" class="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm sm:text-base disabled:opacity-50">
                <Loader2 v-if="isSaving" class="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /><Save v-else class="w-4 h-4 sm:w-5 sm:h-5" /> บันทึกการแก้ไข
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>