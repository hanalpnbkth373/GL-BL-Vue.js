<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { UserPlus, Mail, Lock, Loader2, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง'
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    successMessage.value = 'สมัครสมาชิกสำเร็จ! กำลังพากลับไปหน้าเข้าสู่ระบบ...'
    
    // หน่วงเวลา 2 วินาทีเพื่อให้ผู้ใช้อ่านข้อความ แล้วเด้งกลับไปหน้า login
    setTimeout(() => {
      router.push('/login')
    }, 2000)

  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans">
    
    <!-- Background Effects -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00e054]/10 rounded-full blur-[100px] pointer-events-none"></div>

    <div class="glass-card w-full max-w-md p-8 rounded-3xl relative z-10 border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl animate__animated animate__fadeInUp">
      
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-[#00e054]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00e054]/20 shadow-[0_0_15px_rgba(0,224,84,0.2)]">
          <UserPlus class="w-8 h-8 text-[#00e054]" />
        </div>
        <h1 class="text-3xl font-extrabold text-white mb-2 tracking-tight">สร้างบัญชีใหม่</h1>
        <p class="text-gray-400 text-sm">เข้าสู่ระบบเพื่อบันทึกซีรีส์โปรดของคุณ</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-5">
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
            <input v-model="password" type="password" required placeholder="••••••••" minlength="6" class="w-full pl-11 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-[#00e054] outline-none transition-colors">
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-300 ml-1">ยืนยันรหัสผ่าน</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock class="w-5 h-5 text-gray-500" />
            </div>
            <input v-model="confirmPassword" type="password" required placeholder="••••••••" minlength="6" class="w-full pl-11 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-[#00e054] outline-none transition-colors">
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-sm text-center animate__animated animate__headShake">
          {{ errorMessage }}
        </div>
        
        <div v-if="successMessage" class="text-[#00e054] bg-[#00e054]/10 p-3 rounded-xl border border-[#00e054]/20 text-sm text-center animate__animated animate__fadeIn">
          {{ successMessage }}
        </div>

        <button type="submit" :disabled="isLoading" class="w-full bg-[#00e054] hover:bg-[#00c54f] text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 shadow-[0_0_15px_rgba(0,224,84,0.3)]">
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          <UserPlus v-else class="w-5 h-5" />
          <span>{{ isLoading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก' }}</span>
        </button>
      </form>

      <div class="mt-8 pt-6 border-t border-white/10 text-center">
        <p class="text-gray-400 text-sm mb-4">มีบัญชีผู้ใช้งานอยู่แล้ว?</p>
        <div class="flex items-center gap-3 justify-center">
          <button @click="router.push('/login')" class="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-600 hover:border-[#00e054] text-gray-300 hover:text-[#00e054] transition-colors text-sm font-medium">
            <ArrowLeft class="w-4 h-4" /> กลับไปเข้าสู่ระบบ
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