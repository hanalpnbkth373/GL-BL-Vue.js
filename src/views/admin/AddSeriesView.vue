<script setup>
import { ref } from 'vue'
import { supabase } from '../../supabase'
import { Save, Loader2, Eye, EyeOff, Star } from 'lucide-vue-next'

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = ref({ 
  title: '', type: 'GL', genres: '', air_date: '', air_time: '', 
  trailer_url: '', watch_platform: '', director: '', rating: '', description: '',
  status: 'Published', is_hero: false // ฟีเจอร์ใหม่
})

const handleSubmit = async () => {
  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    const { error } = await supabase.from('series').insert([form.value])
    if (error) throw error
    
    successMessage.value = 'เพิ่มข้อมูลซีรีส์สำเร็จ!'
    form.value = { title: '', type: 'GL', genres: '', air_date: '', air_time: '', trailer_url: '', watch_platform: '', director: '', rating: '', description: '', status: 'Published', is_hero: false }
    
    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('logs').insert([{ 
      user_email: userData.user?.email || 'Admin', 
      action: 'ADD_SERIES', 
      details: `เพิ่มซีรีส์เรื่อง: ${form.value.title}` 
    }])
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="animate__animated animate__fadeIn max-w-4xl mx-auto px-2 sm:px-0">
    <h1 class="text-2xl sm:text-3xl font-bold text-white mb-6 border-l-4 border-emerald-400 pl-3 sm:pl-4">เพิ่มซีรีส์ใหม่</h1>
    
    <div class="glass-card p-5 sm:p-8 rounded-xl border border-white/5 bg-[#0a0a0a]">
      <form @submit.prevent="handleSubmit" class="space-y-5 sm:space-y-6">
        
        <!-- ส่วนตั้งค่าการแสดงผล (ใหม่) -->
        <div class="bg-black/30 p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="flex flex-col">
              <label class="text-gray-300 font-medium text-sm mb-2">สถานะการแสดงผล</label>
              <div class="flex bg-black/50 rounded-lg p-1 border border-gray-700 w-fit">
                <button type="button" @click="form.status = 'Published'" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all', form.status === 'Published' ? 'bg-[#00e054] text-black font-bold' : 'text-gray-400 hover:text-white']">
                  <Eye class="w-4 h-4"/> โชว์บนเว็บ
                </button>
                <button type="button" @click="form.status = 'Draft'" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all', form.status === 'Draft' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white']">
                  <EyeOff class="w-4 h-4"/> ซ่อน (ดราฟต์)
                </button>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer bg-black/50 px-4 py-2.5 rounded-lg border border-gray-700 hover:border-[#00e054] transition-colors">
              <input type="checkbox" v-model="form.is_hero" class="w-4 h-4 rounded text-[#00e054] bg-gray-800 border-gray-700 focus:ring-[#00e054] focus:ring-offset-gray-900">
              <Star class="w-4 h-4" :class="form.is_hero ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'" />
              <span class="text-sm font-medium text-white">ปักหมุดเป็นแบนเนอร์สไลด์</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-sm">
          <div class="space-y-1.5"><label class="text-gray-300 font-medium">ชื่อเรื่อง (Title)</label><input v-model="form.title" type="text" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-emerald-500 outline-none transition-colors"></div>
          <div class="space-y-1.5"><label class="text-gray-300 font-medium">ประเภท (Type)</label><select v-model="form.type" class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-emerald-500 outline-none transition-colors"><option value="GL">GL Series</option><option value="BL">BL Series</option></select></div>
          <div class="space-y-1.5"><label class="text-gray-300 font-medium">หมวดหมู่ (Genres)</label><input v-model="form.genres" type="text" placeholder="เช่น โรแมนติก, ดราม่า" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-emerald-500 outline-none transition-colors"></div>
          <div class="space-y-1.5"><label class="text-gray-300 font-medium">ผู้กำกับ (Director)</label><input v-model="form.director" type="text" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-emerald-500 outline-none transition-colors"></div>
          <div class="space-y-1.5"><label class="text-gray-300 font-medium">วันออนแอร์ (Air Date)</label><input v-model="form.air_date" type="text" placeholder="เช่น ทุกวันศุกร์" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-emerald-500 outline-none transition-colors"></div>
          <div class="space-y-1.5"><label class="text-gray-300 font-medium">เวลาออนแอร์ (Air Time)</label><input v-model="form.air_time" type="text" placeholder="เช่น 20:30 น." required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-emerald-500 outline-none transition-colors"></div>
          <div class="space-y-1.5"><label class="text-gray-300 font-medium">ลิงก์ตัวอย่าง YouTube</label><input v-model="form.trailer_url" type="url" placeholder="https://youtube.com/..." required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-emerald-500 outline-none transition-colors"></div>
          <div class="space-y-1.5"><label class="text-gray-300 font-medium">คะแนนเรทติ้ง (Rating)</label><input v-model="form.rating" type="number" step="0.1" max="10" placeholder="0.0 - 10.0" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-emerald-500 outline-none transition-colors"></div>
          
          <div class="space-y-1.5 md:col-span-2">
            <label class="text-gray-300 font-medium">ช่องทางการรับชม (Watch Platform)</label>
            <input v-model="form.watch_platform" type="text" placeholder="เช่น iQIYI, Netflix, WeTV, YouTube" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-emerald-500 outline-none transition-colors">
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-300">เรื่องย่อ (Description)</label>
          <textarea v-model="form.description" rows="4" required class="w-full px-3.5 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-white focus:border-emerald-500 outline-none resize-none text-sm transition-colors"></textarea>
        </div>

        <div v-if="successMessage" class="text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-sm text-center animate__animated animate__fadeIn">{{ successMessage }}</div>
        <div v-if="errorMessage" class="text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-sm text-center animate__animated animate__shakeX">{{ errorMessage }}</div>

        <button type="submit" :disabled="isLoading" class="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          <Save v-else class="w-5 h-5" />
          <span>{{ isLoading ? 'กำลังบันทึก...' : 'บันทึกซีรีส์' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>