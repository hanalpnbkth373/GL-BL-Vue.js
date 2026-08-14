<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { Lock, Loader2, ShieldCheck } from 'lucide-vue-next'

const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleUpdatePassword = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง'
    return
  }
  if (password.value.length < 6) {
    errorMessage.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) throw error
    
    successMessage.value = 'ตั้งรหัสผ่านใหม่สำเร็จ! กำลังพากลับไปหน้าเข้าสู่ระบบ...'
    setTimeout(() => router.push('/login'), 3000)
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans">
    <div class="glass-card w-full max-w-md p-8 rounded-3xl relative z-10 border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl animate__animated animate__zoomIn">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-[#00e054]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00e054]/20">
          <ShieldCheck class="w-8 h-8 text-[#00e054]" />
        </div>
        <h1 class="text-3xl font-extrabold text-white mb-2">ตั้งรหัสผ่านใหม่</h1>
        <p class="text-gray-400 text-sm">กรุณากำหนดรหัสผ่านใหม่เพื่อเข้าใช้งานระบบ</p>
      </div>

      <form @submit.prevent="handleUpdatePassword" class="space-y-5">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-300 ml-1">รหัสผ่านใหม่</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock class="w-5 h-5 text-gray-500" /></div>
            <input v-model="password" type="password" required placeholder="อย่างน้อย 6 ตัวอักษร" class="w-full pl-11 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-[#00e054] outline-none transition-colors">
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-300 ml-1">ยืนยันรหัสผ่านใหม่</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock class="w-5 h-5 text-gray-500" /></div>
            <input v-model="confirmPassword" type="password" required placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" class="w-full pl-11 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-[#00e054] outline-none transition-colors">
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-sm text-center">{{ errorMessage }}</div>
        <div v-if="successMessage" class="text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-sm text-center">{{ successMessage }}</div>

        <button type="submit" :disabled="isLoading || successMessage" class="w-full bg-[#00e054] hover:bg-[#00c54f] text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          <Lock v-else class="w-5 h-5" />
          <span>{{ isLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>.glass-card { background: rgba(10, 10, 10, 0.6); backdrop-filter: blur(16px); }</style>