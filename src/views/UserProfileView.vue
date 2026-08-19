<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { User, Mail, Lock, Save, Loader2, Image as ImageIcon, Shield, Calendar, Camera } from 'lucide-vue-next'
import { t } from '../store' // ดึงระบบ 2 ภาษามาใช้

const isLoading = ref(true)
const isSavingProfile = ref(false)
const isSavingPassword = ref(false)
const notification = ref({ show: false, message: '', type: 'success' })

// State สำหรับข้อมูลผู้ใช้
const currentUser = ref(null)
const profileForm = ref({ display_name: '', avatar_url: '' })
const role = ref('User')
const joinDate = ref('')

// State สำหรับรหัสผ่าน
const passwordForm = ref({ new_password: '', confirm_password: '' })

onMounted(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      currentUser.value = session.user
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()
        
      if (error) throw error
      
      if (profileData) {
        profileForm.value.display_name = profileData.display_name || ''
        profileForm.value.avatar_url = profileData.avatar_url || ''
        role.value = profileData.role || 'User'
        joinDate.value = profileData.created_at ? new Date(profileData.created_at).toLocaleDateString(currentLang.value === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : t('ไม่ระบุ', 'Not specified')
      } else {
        joinDate.value = t('เพิ่งเข้าร่วม', 'Just joined')
      }
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    isLoading.value = false
  }
})

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => { notification.value.show = false }, 3000)
}

// 1. อัปเดตโปรไฟล์
const handleUpdateProfile = async () => {
  isSavingProfile.value = true
  try {
    const autoUsername = currentUser.value.email.split('@')[0]

    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: currentUser.value.id,
        email: currentUser.value.email,
        username: autoUsername,
        display_name: profileForm.value.display_name,
        avatar_url: profileForm.value.avatar_url,
        role: role.value,
        status: 'Active'
      }, { onConflict: 'id' })

    if (error) throw error
    showNotification(t('บันทึกข้อมูลโปรไฟล์สำเร็จ!', 'Profile updated successfully!'))
  } catch (error) {
    showNotification(error.message, 'error')
  } finally {
    isSavingProfile.value = false
  }
}

// 2. เปลี่ยนรหัสผ่าน
const handleUpdatePassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    showNotification(t('รหัสผ่านใหม่ไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง', 'Passwords do not match, please check again.'), 'error')
    return
  }

  if (passwordForm.value.new_password.length < 6) {
    showNotification(t('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'Password must be at least 6 characters.'), 'error')
    return
  }

  isSavingPassword.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.value.new_password
    })

    if (error) throw error
    showNotification(t('เปลี่ยนรหัสผ่านสำเร็จ!', 'Password changed successfully!'))
    passwordForm.value = { new_password: '', confirm_password: '' }
  } catch (error) {
    showNotification(error.message, 'error')
  } finally {
    isSavingPassword.value = false
  }
}

const initialChar = computed(() => {
  return currentUser.value?.email ? currentUser.value.email.charAt(0).toUpperCase() : 'U'
})
</script>

<template>
  <div class="min-h-screen bg-[#050505] pt-28 pb-20 px-6 md:px-12 font-sans animate__animated animate__fadeIn">
    
    <div v-if="notification.show" :class="['fixed top-24 sm:top-28 right-4 sm:right-8 px-6 py-3 rounded-xl font-medium shadow-2xl z-[200] transition-all animate__animated animate__slideInRight text-sm border', notification.type === 'success' ? 'bg-[#00e054]/10 text-[#00e054] border-[#00e054]/20' : 'bg-red-500/10 text-red-400 border-red-500/20']">
      {{ notification.message }}
    </div>

    <div class="max-w-5xl mx-auto">
      <h1 class="text-3xl md:text-4xl font-bold text-white mb-8 border-l-4 border-[#00e054] pl-4">{{ t('ตั้งค่าโปรไฟล์ส่วนตัว', 'Profile Settings') }}</h1>

      <div v-if="isLoading" class="text-center py-20 text-[#00e054]">
        <Loader2 class="w-8 h-8 animate-spin mx-auto mb-2" /> {{ t('กำลังโหลดข้อมูล...', 'Loading...') }}
      </div>
      
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        <!-- ฝั่งซ้าย: ข้อมูลบัญชีเบื้องต้น -->
        <div class="lg:col-span-1">
          <div class="glass-card p-6 md:p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center bg-[#0a0a0a]">
            
            <div class="relative mb-6">
              <div class="w-32 h-32 rounded-full border-4 border-gray-800 overflow-hidden bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shadow-2xl">
                <img v-if="profileForm.avatar_url" :src="profileForm.avatar_url" alt="Avatar" class="w-full h-full object-cover">
                <span v-else class="text-5xl font-extrabold text-gray-500">{{ initialChar }}</span>
              </div>
              <div class="absolute bottom-0 right-0 bg-[#00e054] p-2 rounded-full border-4 border-[#0a0a0a] shadow-lg">
                <Camera class="w-4 h-4 text-black" />
              </div>
            </div>

            <h2 class="text-xl font-bold text-white mb-1 truncate w-full px-2">{{ profileForm.display_name || t('ไม่ได้ตั้งชื่อ', 'No Name') }}</h2>
            <p class="text-gray-400 text-sm mb-4 truncate w-full px-2">{{ currentUser?.email }}</p>

            <span :class="['flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-semibold mb-6', role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-[#00e054]/10 text-[#00e054] border-[#00e054]/20']">
              <Shield class="w-3 h-3" /> {{ role }}
            </span>

            <div class="w-full pt-6 border-t border-white/5 text-left space-y-3">
              <div class="flex items-center gap-3 text-sm text-gray-400">
                <Mail class="w-4 h-4 text-gray-500" /> <span class="truncate">{{ currentUser?.email }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-gray-400">
                <Calendar class="w-4 h-4 text-gray-500" /> {{ t('เข้าร่วมเมื่อ:', 'Joined:') }} {{ joinDate }}
              </div>
            </div>
          </div>
        </div>

        <!-- ฝั่งขวา: ฟอร์มแก้ไขข้อมูล -->
        <div class="lg:col-span-2 space-y-6 lg:space-y-8">
          
          <!-- ฟอร์มแก้ไขโปรไฟล์ -->
          <div class="glass-card p-6 md:p-8 rounded-2xl border border-white/5 bg-[#0a0a0a]">
            <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User class="w-5 h-5 text-[#00e054]" /> {{ t('แก้ไขข้อมูลทั่วไป', 'Edit General Info') }}
            </h2>
            <form @submit.prevent="handleUpdateProfile" class="space-y-5">
              <div class="grid grid-cols-1 gap-5">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-300">{{ t('ชื่อแสดงผล (Display Name)', 'Display Name') }}</label>
                  <input v-model="profileForm.display_name" type="text" :placeholder="t('ตั้งชื่อเล่นของคุณ', 'Enter your display name')" class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-[#00e054] outline-none transition-colors">
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-300">{{ t('ลิงก์รูปโปรไฟล์ (Avatar URL)', 'Avatar URL') }}</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon class="w-4 h-4 text-gray-500" />
                    </div>
                    <input v-model="profileForm.avatar_url" type="url" placeholder="https://example.com/my-image.jpg" class="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-[#00e054] outline-none transition-colors text-sm">
                  </div>
                  <p class="text-xs text-gray-500 mt-1">{{ t('ใส่ลิงก์รูปภาพนามสกุล .jpg, .png', 'Enter a .jpg, .png image link') }}</p>
                </div>
              </div>
              <div class="pt-2">
                <button type="submit" :disabled="isSavingProfile" class="bg-gray-800 hover:bg-[#00e054]/20 text-gray-300 hover:text-[#00e054] border border-gray-700 hover:border-[#00e054]/50 font-semibold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 text-sm">
                  <Loader2 v-if="isSavingProfile" class="w-4 h-4 animate-spin" />
                  <Save v-else class="w-4 h-4" /> {{ isSavingProfile ? t('กำลังบันทึก...', 'Saving...') : t('บันทึกข้อมูล', 'Save Profile') }}
                </button>
              </div>
            </form>
          </div>

          <!-- ฟอร์มเปลี่ยนรหัสผ่าน -->
          <div class="glass-card p-6 md:p-8 rounded-2xl border border-white/5 bg-[#0a0a0a]">
            <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Lock class="w-5 h-5 text-yellow-500" /> {{ t('เปลี่ยนรหัสผ่าน', 'Change Password') }}
            </h2>
            <form @submit.prevent="handleUpdatePassword" class="space-y-5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-300">{{ t('รหัสผ่านใหม่', 'New Password') }}</label>
                  <input v-model="passwordForm.new_password" type="password" required :placeholder="t('อย่างน้อย 6 ตัวอักษร', 'At least 6 characters')" minlength="6" class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-yellow-500 outline-none transition-colors">
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-300">{{ t('ยืนยันรหัสผ่านใหม่', 'Confirm New Password') }}</label>
                  <input v-model="passwordForm.confirm_password" type="password" required :placeholder="t('กรอกรหัสผ่านอีกครั้ง', 'Confirm password')" minlength="6" class="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white focus:border-yellow-500 outline-none transition-colors">
                </div>
              </div>
              <div class="pt-2">
                <button type="submit" :disabled="isSavingPassword" class="bg-gray-800 hover:bg-yellow-500/20 text-gray-300 hover:text-yellow-500 border border-gray-700 hover:border-yellow-500/50 font-semibold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 text-sm">
                  <Loader2 v-if="isSavingPassword" class="w-4 h-4 animate-spin" />
                  <Lock v-else class="w-4 h-4" /> {{ isSavingPassword ? t('กำลังบันทึก...', 'Updating...') : t('อัปเดตรหัสผ่าน', 'Update Password') }}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>