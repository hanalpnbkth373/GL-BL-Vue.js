<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { 
  User, LayoutDashboard, Film, ListVideo, FileText, Users, UserPlus, LogOut, Menu, X 
} from 'lucide-vue-next'
import { supabase } from './supabase'

const route = useRoute()
const router = useRouter()

const currentUser = ref(null)
const isAdmin = ref(false)
const isSidebarOpen = ref(false)

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

const checkAdminRole = async (userId) => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle() // <--- เปลี่ยนจาก .single() เป็น .maybeSingle()
      
    if (data && data.role === 'Admin') {
      isAdmin.value = true
    } else {
      isAdmin.value = false
    }
  } catch (error) {
    console.error('Error checking role:', error)
  }
}

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    currentUser.value = data.session?.user || null
    if (currentUser.value) checkAdminRole(currentUser.value.id)
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser.value = session?.user || null
    if (currentUser.value) {
      checkAdminRole(currentUser.value.id)
    } else {
      isAdmin.value = false
    }
  })
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  currentUser.value = null
  isAdmin.value = false
  isSidebarOpen.value = false
  router.push('/')
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen relative font-sans text-slate-100 bg-[#050505] flex">
    
    <!-- ================= PUBLIC NAVBAR ================= -->
    <header v-if="!isAdminRoute" class="fixed top-0 left-0 w-full z-50 glass-nav h-20 flex items-center transition-all duration-300">
      <div class="w-full px-6 md:px-12 flex items-center justify-between">
        <div class="flex items-center gap-10">
          <RouterLink to="/" class="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
            GL<span class="text-white font-light">SHOWTIME</span>
          </RouterLink>
          
          <nav class="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
            <RouterLink to="/" exact-active-class="text-pink-400 font-bold" class="hover:text-pink-400 transition-colors">GL Home</RouterLink>
            <RouterLink to="/bl" exact-active-class="text-blue-400 font-bold" class="hover:text-blue-400 transition-colors">BL Home</RouterLink>
            <RouterLink to="/privacy" exact-active-class="text-white font-bold" class="hover:text-white transition-colors">Privacy Policy</RouterLink>
            <RouterLink to="/license" exact-active-class="text-white font-bold" class="hover:text-white transition-colors">License Agreement</RouterLink>
            <RouterLink v-if="currentUser" to="/my-list" exact-active-class="text-[#00e054] font-bold" class="hover:text-[#00e054] transition-colors">รายการของฉัน</RouterLink>
          </nav>
        </div>

        <!-- เมนูฝั่งขวา -->
        <div class="flex items-center gap-4">
          <template v-if="currentUser">
            <div class="flex items-center gap-3">
              <RouterLink v-if="isAdmin" to="/admin/dashboard" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full font-medium transition-all text-sm shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <LayoutDashboard class="w-4 h-4" />
                <span class="hidden sm:inline">จัดการหลังบ้าน</span>
              </RouterLink>
              
              <RouterLink to="/profile" class="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full border border-white/10 transition-all text-sm group">
                <User class="w-4 h-4 text-gray-400 group-hover:text-[#00e054] transition-colors" />
                <span class="hidden sm:inline">ตั้งค่าโปรไฟล์</span>
              </RouterLink>

              <button @click="handleLogout" class="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-300 rounded-full transition-all" title="ออกจากระบบ">
                <LogOut class="w-4 h-4" />
              </button>
            </div>
          </template>
          <template v-else>
            <RouterLink to="/login" class="flex items-center gap-2 bg-[#00e054] hover:bg-[#00c54f] text-black px-6 py-2.5 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(0,224,84,0.4)]">
              <User class="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </RouterLink>
          </template>
        </div>
      </div>
    </header>

    <!-- ================= ADMIN MOBILE TOPBAR ================= -->
    <div v-if="isAdminRoute" class="md:hidden fixed top-0 left-0 w-full h-16 glass-nav z-40 flex items-center justify-between px-6">
      <span class="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">ADMIN<span class="text-white font-light">PANEL</span></span>
      <button @click="toggleSidebar" class="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
        <Menu v-if="!isSidebarOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
    </div>

    <!-- ================= ADMIN SIDEBAR OVERLAY ================= -->
    <div v-if="isAdminRoute && isSidebarOpen" @click="closeSidebar" class="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"></div>
    
    <!-- ================= ADMIN SIDEBAR ================= -->
    <aside v-if="isAdminRoute" :class="[
      'fixed h-screen glass-nav border-r border-white/10 flex flex-col z-50 w-64 transition-transform duration-300 ease-in-out',
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    ]">
      <div class="h-20 hidden md:flex items-center px-6 border-b border-white/10">
        <span class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">ADMIN<span class="text-white font-light">PANEL</span></span>
      </div>
      
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar mt-16 md:mt-0">
        <RouterLink @click="closeSidebar" to="/admin/dashboard" exact-active-class="bg-emerald-500/20 text-emerald-400 border-emerald-500/50" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">
          <LayoutDashboard class="w-5 h-5" /> Dashboard
        </RouterLink>
        <RouterLink @click="closeSidebar" to="/admin/add-series" exact-active-class="bg-emerald-500/20 text-emerald-400 border-emerald-500/50" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">
          <Film class="w-5 h-5" /> เพิ่มซีรีส์ใหม่
        </RouterLink>
        <RouterLink @click="closeSidebar" to="/admin/manage-series" exact-active-class="bg-emerald-500/20 text-emerald-400 border-emerald-500/50" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">
          <ListVideo class="w-5 h-5" /> จัดการซีรีส์
        </RouterLink>
        <RouterLink @click="closeSidebar" to="/admin/profiles" exact-active-class="bg-emerald-500/20 text-emerald-400 border-emerald-500/50" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">
          <Users class="w-5 h-5" /> จัดการโปรไฟล์
        </RouterLink>
        <RouterLink @click="closeSidebar" to="/admin/add-users" exact-active-class="bg-emerald-500/20 text-emerald-400 border-emerald-500/50" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">
          <UserPlus class="w-5 h-5" /> เพิ่มผู้ใช้งาน
        </RouterLink>
        <RouterLink @click="closeSidebar" to="/admin/logs" exact-active-class="bg-emerald-500/20 text-emerald-400 border-emerald-500/50" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">
          <FileText class="w-5 h-5" /> ประวัติระบบ (Logs)
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-white/10">
        <RouterLink to="/" class="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-white/10 transition-all mb-2">
          <Film class="w-5 h-5" /> กลับหน้าแรกเว็บ
        </RouterLink>
        <button @click="handleLogout" class="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut class="w-5 h-5" /> ออกจากระบบ
        </button>
      </div>
    </aside>

    <!-- ================= MAIN CONTENT AREA ================= -->
    <main :class="[isAdminRoute ? 'flex-1 p-4 sm:p-8 min-h-screen pt-24 md:pt-8 transition-all duration-300 md:ml-64 w-full' : 'w-full pb-20']">
      <RouterView />
    </main>
    
  </div>
</template>

<style>
.glass-nav {
  background: linear-gradient(180deg, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.6) 70%, transparent 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
</style>