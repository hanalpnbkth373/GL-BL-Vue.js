<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { Mail, KeyRound, Loader2, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleResetPassword = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    successMessage.value = 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมาย (หรือถังขยะ)'
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans">
    <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="glass-card w-full max-w-md p-8 rounded-3xl relative z-10 border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl animate__animated animate__fadeIn">
      
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
          <KeyRound class="w-8 h-8 text-yellow-500" />
        </div>
        <h1 class="text-3xl font-extrabold text-white mb-2">ลืมรหัสผ่าน?</h1>
        <p class="text-gray-400 text-sm">กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่</p>
      </div>

      <form @submit.prevent="handleResetPassword" class="space-y-5">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-300 ml-1">อีเมลที่ลงทะเบียน</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail class="w-5 h-5 text-gray-500" /></div>
            <input v-model="email" type="email" required placeholder="youremail@example.com" class="w-full pl-11 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-yellow-500 outline-none transition-colors">
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-sm text-center">{{ errorMessage }}</div>
        <div v-if="successMessage" class="text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-sm text-center leading-relaxed">{{ successMessage }}</div>

        <button v-if="!successMessage" type="submit" :disabled="isLoading" class="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          <KeyRound v-else class="w-5 h-5" />
          <span>{{ isLoading ? 'กำลังส่งลิงก์...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน' }}</span>
        </button>
      </form>

      <div class="mt-8 pt-6 border-t border-white/10 text-center">
        <button @click="router.push('/login')" class="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft class="w-4 h-4" /> กลับไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>.glass-card { background: rgba(10, 10, 10, 0.6); backdrop-filter: blur(16px); }</style>