<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../../supabase'
// เพิ่ม ChevronLeft และ ChevronRight เข้ามาในบรรทัดนี้แล้วครับ
import { Search, Loader2, Shield, ShieldAlert, Ban, CheckCircle, Trash2, Users, Mail, Clock, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const profilesList = ref([])
const isLoading = ref(true)

// สำหรับ Search & Pagination
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = ref(1)
const totalItems = ref(0)

const notification = ref({ show: false, message: '', type: 'success' })

const fetchProfiles = async () => {
  isLoading.value = true
  try {
    let query = supabase.from('profiles').select('*', { count: 'exact' })
    
    if (searchQuery.value) {
      query = query.ilike('email', `%${searchQuery.value}%`)
    }

    const from = (currentPage.value - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query

    if (error) throw error

    if (data) {
      profilesList.value = data
      totalItems.value = count || 0
      totalPages.value = Math.ceil((count || 0) / itemsPerPage) || 1
    }
  } catch (error) {
    console.error('Error fetching profiles:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProfiles()
})

let searchTimeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchProfiles()
  }, 500)
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchProfiles()
  }
}

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => { notification.value.show = false }, 3000)
}

// 1. ฟังก์ชันเปลี่ยนสิทธิ์ (Role)
const toggleRole = async (profile) => {
  const newRole = profile.role === 'Admin' ? 'User' : 'Admin'
  const confirmMsg = newRole === 'Admin' 
    ? `ต้องการเลื่อนขั้น ${profile.email} เป็น Admin ใช่หรือไม่?` 
    : `ต้องการลดขั้น ${profile.email} เป็น User ปกติใช่หรือไม่?`
    
  if (!confirm(confirmMsg)) return

  try {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profile.id)
    if (error) throw error

    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('logs').insert([{ 
      user_email: userData.user?.email || 'Admin', 
      action: 'UPDATE_ROLE', 
      details: `เปลี่ยนสิทธิ์ของ ${profile.email} เป็น ${newRole}` 
    }])

    showNotification(`เปลี่ยนสิทธิ์เป็น ${newRole} สำเร็จ`)
    fetchProfiles()
  } catch (error) {
    showNotification(error.message, 'error')
  }
}

// 2. ฟังก์ชันบล็อก/ปลดบล็อกการใช้งาน (Ban/Unban)
const toggleBan = async (profile) => {
  const newStatus = profile.status === 'Active' ? 'Banned' : 'Active'
  const confirmMsg = newStatus === 'Banned' 
    ? `ต้องการระงับการใช้งาน (Ban) ${profile.email} ใช่หรือไม่?` 
    : `ต้องการปลดบล็อก ${profile.email} ใช่หรือไม่?`
    
  if (!confirm(confirmMsg)) return

  try {
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', profile.id)
    if (error) throw error

    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('logs').insert([{ 
      user_email: userData.user?.email || 'Admin', 
      action: newStatus === 'Banned' ? 'BAN_USER' : 'UNBAN_USER', 
      details: `${newStatus === 'Banned' ? 'ระงับการใช้งาน' : 'ปลดบล็อก'}: ${profile.email}` 
    }])

    showNotification(newStatus === 'Banned' ? 'ระงับการใช้งานสำเร็จ' : 'ปลดบล็อกสำเร็จ', newStatus === 'Banned' ? 'error' : 'success')
    fetchProfiles()
  } catch (error) {
    showNotification(error.message, 'error')
  }
}

// 3. ฟังก์ชันลบผู้ใช้งาน (ลบโปรไฟล์)
const handleDelete = async (profile) => {
  if (!confirm(`อันตราย! ต้องการลบผู้ใช้ ${profile.email} ออกจากระบบฐานข้อมูลทั้งหมดใช่หรือไม่?\n*ข้อมูลการ Bookmark ของผู้ใช้นี้จะถูกลบไปด้วย`)) return

  try {
    const { error } = await supabase.from('profiles').delete().eq('id', profile.id)
    if (error) throw error

    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('logs').insert([{ 
      user_email: userData.user?.email || 'Admin', 
      action: 'DELETE_USER', 
      details: `ลบผู้ใช้งาน: ${profile.email}` 
    }])

    showNotification('ลบผู้ใช้งานออกจากระบบสำเร็จ')
    fetchProfiles()
  } catch (error) {
    showNotification(error.message, 'error')
  }
}

const formatDate = (isoString) => {
  return new Date(isoString).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="animate__animated animate__fadeIn max-w-[100vw] overflow-hidden">
    
    <!-- Notification -->
    <div v-if="notification.show" :class="['fixed top-20 sm:top-6 right-4 sm:right-6 px-4 sm:px-6 py-3 rounded-xl font-medium shadow-lg z-[200] transition-all text-sm animate__animated animate__slideInRight', notification.type === 'success' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white']">
      {{ notification.message }}
    </div>

    <!-- Header & Search -->
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
          <Users class="w-5 h-5 text-emerald-400" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">จัดการผู้ใช้งาน</h1>
      </div>
      
      <div class="relative w-full md:w-72">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="w-4 h-4 text-gray-500" />
        </div>
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          type="text" 
          placeholder="ค้นหาด้วยอีเมล..." 
          class="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-emerald-500 outline-none text-sm transition-colors"
        >
      </div>
    </div>
    
    <!-- Table -->
    <div class="glass-card rounded-xl overflow-hidden flex flex-col border border-white/5 bg-[#0a0a0a]">
      <div class="overflow-x-auto flex-grow custom-scrollbar">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr class="border-b border-gray-800 bg-black/40 text-gray-400 text-xs sm:text-sm whitespace-nowrap">
              <th class="p-4 font-medium">บัญชีผู้ใช้งาน (Email)</th>
              <th class="p-4 font-medium">สิทธิ์ (Role)</th>
              <th class="p-4 font-medium">สถานะ (Status)</th>
              <th class="p-4 font-medium">วันที่เข้าร่วม</th>
              <th class="p-4 font-medium text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="5" class="p-10 text-center text-gray-400">
                <Loader2 class="w-5 h-5 animate-spin mx-auto mb-2"/> กำลังโหลดข้อมูล...
              </td>
            </tr>
            <tr v-else-if="profilesList.length === 0">
              <td colspan="5" class="p-10 text-center text-gray-500">
                ไม่พบข้อมูลผู้ใช้งาน
              </td>
            </tr>
            <tr v-for="item in profilesList" :key="item.id" class="border-b border-gray-800/50 hover:bg-white/5 transition-colors text-sm">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center flex-shrink-0">
                    <span class="text-white font-bold text-xs uppercase">{{ item.email.charAt(0) }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-white font-medium truncate max-w-[200px]">{{ item.email }}</span>
                    <span class="text-[10px] text-gray-500">{{ item.id }}</span>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <span :class="['flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border w-fit font-semibold', item.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20']">
                  <ShieldAlert v-if="item.role === 'Admin'" class="w-3 h-3" />
                  <Shield v-else class="w-3 h-3" />
                  {{ item.role }}
                </span>
              </td>
              <td class="p-4">
                <span :class="['flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border w-fit font-semibold', item.status === 'Active' ? 'bg-[#00e054]/10 text-[#00e054] border-[#00e054]/20' : 'bg-red-500/10 text-red-400 border-red-500/20']">
                  <CheckCircle v-if="item.status === 'Active'" class="w-3 h-3" />
                  <Ban v-else class="w-3 h-3" />
                  {{ item.status || 'Active' }}
                </span>
              </td>
              <td class="p-4 text-gray-400 text-xs whitespace-nowrap">
                <div class="flex items-center gap-1.5">
                  <Clock class="w-3.5 h-3.5" />
                  {{ formatDate(item.created_at) }}
                </div>
              </td>
              <td class="p-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button @click="toggleRole(item)" class="px-3 py-1.5 bg-gray-800 hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 rounded-md transition-colors text-xs font-medium flex items-center gap-1" title="สลับสิทธิ์การใช้งาน">
                    <Shield class="w-3.5 h-3.5" /> {{ item.role === 'Admin' ? 'ลดเป็น User' : 'ตั้งเป็น Admin' }}
                  </button>
                  
                  <button @click="toggleBan(item)" :class="['px-3 py-1.5 bg-gray-800 rounded-md transition-colors text-xs font-medium flex items-center gap-1', item.status === 'Active' ? 'hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-500' : 'hover:bg-[#00e054]/20 text-gray-400 hover:text-[#00e054]']">
                    <Ban v-if="item.status === 'Active'" class="w-3.5 h-3.5" />
                    <CheckCircle v-else class="w-3.5 h-3.5" />
                    {{ item.status === 'Active' ? 'ระงับใช้งาน' : 'ปลดบล็อก' }}
                  </button>

                  <button @click="handleDelete(item)" class="p-1.5 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-md transition-colors" title="ลบผู้ใช้">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!isLoading && totalPages > 0" class="p-4 border-t border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/20">
        <span class="text-xs sm:text-sm text-gray-500">
          แสดงข้อมูล {{ (currentPage - 1) * itemsPerPage + 1 }} ถึง {{ Math.min(currentPage * itemsPerPage, totalItems) }} จากทั้งหมด {{ totalItems }} บัญชี
        </span>
        <div class="flex items-center gap-2">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 transition-colors">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <span class="text-xs sm:text-sm text-gray-300 font-medium px-2">หน้า {{ currentPage }} / {{ totalPages }}</span>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 transition-colors">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
</style>