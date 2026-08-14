<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { UserPlus, Mail, Lock, Loader2, ArrowLeft, ShieldCheck, RefreshCcw } from 'lucide-vue-next'
import { t } from '../store' // ดึง 2 ภาษามาใช้

const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ระบบ Custom reCAPTCHA
const isCaptchaVerified = ref(false)
const captchaNum1 = ref(Math.floor(Math.random() * 10) + 1)
const captchaNum2 = ref(Math.floor(Math.random() * 10) + 1)
const captchaAnswer = ref('')
const captchaError = ref(false)

const refreshCaptcha = () => {
  captchaNum1.value = Math.floor(Math.random() * 10) + 1
  captchaNum2.value = Math.floor(Math.random() * 10) + 1
  captchaAnswer.value = ''
  captchaError.value = false
}

const verifyCaptcha = () => {
  if (parseInt(captchaAnswer.value) === captchaNum1.value + captchaNum2.value) {
    isCaptchaVerified.value = true
    captchaError.value = false
  } else {
    captchaError.value = true
    refreshCaptcha()
  }
}

const handleRegister = async () => {
  if (!isCaptchaVerified.value) return
  if (password.value !== confirmPassword.value) { errorMessage.value = 'รหัสผ่านไม่ตรงกัน'; return }
  
  isLoading.value = true; errorMessage.value = ''; successMessage.value = ''

  try {
    const { error } = await supabase.auth.signUp({ email: email.value, password: password.value })
    if (error) throw error
    successMessage.value = 'สมัครสมาชิกสำเร็จ! กำลังพากลับไปหน้าเข้าสู่ระบบ...'
    setTimeout(() => { router.push('/login') }, 2000)
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans">
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="glass-card w-full max-w-md p-8 rounded-3xl relative z-10 border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl animate__animated animate__fadeInUp">
      
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-[#00e054]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00e054]/20"><UserPlus class="w-8 h-8 text-[#00e054]" /></div>
        <h1 class="text-3xl font-extrabold text-white mb-2">{{ t('สร้างบัญชีใหม่', 'Create Account') }}</h1>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-5">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-300 ml-1">{{ t('อีเมล', 'Email') }}</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail class="w-5 h-5 text-gray-500" /></div>
            <input v-model="email" type="email" required placeholder="youremail@example.com" class="w-full pl-11 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-[#00e054] outline-none">
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-300 ml-1">{{ t('รหัสผ่าน', 'Password') }}</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock class="w-5 h-5 text-gray-500" /></div>
            <input v-model="password" type="password" required placeholder="••••••••" minlength="6" class="w-full pl-11 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-[#00e054] outline-none">
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-300 ml-1">{{ t('ยืนยันรหัสผ่าน', 'Confirm Password') }}</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock class="w-5 h-5 text-gray-500" /></div>
            <input v-model="confirmPassword" type="password" required placeholder="••••••••" minlength="6" class="w-full pl-11 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-[#00e054] outline-none">
          </div>
        </div>

        <!-- Custom reCAPTCHA -->
        <div class="bg-black/40 p-4 rounded-xl border border-gray-700 mt-2">
          <div v-if="isCaptchaVerified" class="flex items-center gap-3 text-[#00e054] font-bold"><ShieldCheck class="w-6 h-6" /> {{ t('ยืนยันตัวตนสำเร็จ', 'Verification Complete') }}</div>
          <div v-else class="flex flex-col gap-3">
            <p class="text-sm text-gray-300">{{ t('กรุณายืนยันว่าคุณไม่ใช่บอท', 'Please verify you are human') }}</p>
            <div class="flex items-center gap-3">
              <span class="text-xl font-bold text-white bg-gray-800 px-4 py-2 rounded-lg tracking-widest">{{ captchaNum1 }} + {{ captchaNum2 }} =</span>
              <input v-model="captchaAnswer" @keyup.enter.prevent="verifyCaptcha" type="number" class="w-20 px-3 py-2 bg-black border border-gray-600 rounded-lg text-white text-center focus:border-blue-500 outline-none">
              <button type="button" @click="verifyCaptcha" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white font-bold text-sm transition-colors">{{ t('ยืนยัน', 'Verify') }}</button>
              <button type="button" @click="refreshCaptcha" class="p-2 text-gray-400 hover:text-white transition-colors"><RefreshCcw class="w-5 h-5" /></button>
            </div>
            <span v-if="captchaError" class="text-xs text-red-400">{{ t('คำตอบผิด กรุณาลองใหม่', 'Incorrect, please try again') }}</span>
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-sm text-center">{{ errorMessage }}</div>
        <div v-if="successMessage" class="text-[#00e054] bg-[#00e054]/10 p-3 rounded-xl border border-[#00e054]/20 text-sm text-center">{{ successMessage }}</div>

        <button type="submit" :disabled="isLoading || !isCaptchaVerified" class="w-full bg-[#00e054] hover:bg-[#00c54f] text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" /><UserPlus v-else class="w-5 h-5" />
          <span>{{ isLoading ? t('กำลังสร้างบัญชี...', 'Creating Account...') : t('สมัครสมาชิก', 'Register') }}</span>
        </button>
      </form>
      <div class="mt-8 pt-6 border-t border-white/10 text-center">
        <button @click="router.push('/login')" class="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-600 hover:border-[#00e054] text-gray-300 hover:text-[#00e054] transition-colors text-sm font-medium mx-auto"><ArrowLeft class="w-4 h-4" /> {{ t('กลับไปเข้าสู่ระบบ', 'Back to Login') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>.glass-card { background: rgba(10, 10, 10, 0.6); backdrop-filter: blur(16px); }</style>