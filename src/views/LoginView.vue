<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    // เช็ค Role ว่าเป็น Admin หรือไม่ โดยใช้ .maybeSingle() เพื่อป้องกัน Error 406
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileData && profileData.role === 'Admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/')
    }
    
  } catch (error) {
   console.error("Supabase Login Error:", error.message)
    errorMessage.value = `Error: ${error.message}` 
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans">
    
    <!-- Background Effects -->
    <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00e054]/20 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

    <div class="glass-card w-full max-w-md p-8 rounded-3xl relative z-10 border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl animate__animated animate__fadeInDown">
      
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-[#00e054]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00e054]/20 shadow-[0_0_15px_rgba(0,224,84,0.2)]">
          <LogIn class="w-8 h-8 text-[#00e054]" />
        </div>
        <h1 class="text-3xl font-extrabold text-white mb-2 tracking-tight">เข้าสู่ระบบ</h1>
        <p class="text-gray-400 text-sm">ยินดีต้อนรับกลับสู่ GL & BL Showtime</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-300 ml-1">อีเมล</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail class="w-5 h-5 text-gray-500" />
            </div>
            <input v-model="email" type="email" required placeholder="youremail@example.com" class="w-full pl-11 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-[#00e054] outline-none transition-colors">
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-300 ml-1">รหัสผ่าน</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock class="w-5 h-5 text-gray-500" />
            </div>
            <input v-model="password" type="password" required placeholder="••••••••" class="w-full pl-11 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-[#00e054] outline-none transition-colors">
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-sm text-center animate__animated animate__headShake">
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="isLoading" class="w-full bg-[#00e054] hover:bg-[#00c54f] text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 shadow-[0_0_15px_rgba(0,224,84,0.3)]">
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          <LogIn v-else class="w-5 h-5" />
          <span>{{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}</span>
        </button>
      </form>

      <div class="mt-8 pt-6 border-t border-white/10 text-center">
        <p class="text-gray-400 text-sm mb-4">ยังไม่มีบัญชีผู้ใช้งาน?</p>
        <div class="flex items-center gap-3 justify-center">
          <button @click="router.push('/register')" class="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-600 hover:border-[#00e054] text-gray-300 hover:text-[#00e054] transition-colors text-sm font-medium">
            สมัครสมาชิกใหม่ <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.glass-card {
  background: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
</style>