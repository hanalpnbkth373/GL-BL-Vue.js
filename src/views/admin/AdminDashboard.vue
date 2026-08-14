<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../supabase'
import { Film, Users, FileText, Activity, Clock, BarChart3, Trophy, Bookmark, Wrench } from 'lucide-vue-next'

const stats = ref({ series: 0, users: 0, logs: 0 })
const glCount = ref(0)
const blCount = ref(0)
const recentLogs = ref([])
const topSeries = ref([]) 
const isLoading = ref(true)

// State สำหรับเปิด-ปิดเว็บ
const isMaintenance = ref(false)

const glPercent = computed(() => stats.value.series === 0 ? 0 : Math.round((glCount.value / stats.value.series) * 100))
const blPercent = computed(() => stats.value.series === 0 ? 0 : Math.round((blCount.value / stats.value.series) * 100))

onMounted(async () => {
  try {
    // โหลดสถานะ Maintenance
    const { data: setObj } = await supabase.from('settings').select('is_maintenance').eq('id', 1).maybeSingle()
    if (setObj) isMaintenance.value = setObj.is_maintenance

    const { count: sCount } = await supabase.from('series').select('*', { count: 'exact', head: true })
    stats.value.series = sCount || 0

    const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    stats.value.users = uCount || 0

    const { count: lCount } = await supabase.from('logs').select('*', { count: 'exact', head: true })
    stats.value.logs = lCount || 0

    const { count: glC } = await supabase.from('series').select('*', { count: 'exact', head: true }).eq('type', 'GL')
    glCount.value = glC || 0
    const { count: blC } = await supabase.from('series').select('*', { count: 'exact', head: true }).eq('type', 'BL')
    blCount.value = blC || 0

    const { data: logsData } = await supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(5)
    if (logsData) recentLogs.value = logsData

    const { data: bms } = await supabase.from('bookmarks').select('series_id, series(title)')
    if (bms) {
      const counts = {}
      bms.forEach(b => {
        if (!b.series) return
        const id = b.series_id
        if (!counts[id]) counts[id] = { title: b.series.title, count: 0 }
        counts[id].count++
      })
      topSeries.value = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5)
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})

const toggleMaintenance = async () => {
  const confirmMsg = !isMaintenance.value 
    ? 'แน่ใจหรือไม่? หากเปิดโหมดนี้ ผู้ใช้งานทั้งหมดจะไม่สามารถเข้าเว็บได้' 
    : 'ต้องการเปิดระบบให้ผู้ใช้งานเข้าถึงปกติใช่หรือไม่?'
  if (!confirm(confirmMsg)) return
  
  isMaintenance.value = !isMaintenance.value
  await supabase.from('settings').upsert({ id: 1, is_maintenance: isMaintenance.value })
}

const formatDate = (isoString) => {
  return new Date(isoString).toLocaleString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const maxBookmark = computed(() => {
  return topSeries.value.length ? Math.max(...topSeries.value.map(s => s.count)) : 1
})
</script>

<template>
  <div class="animate__animated animate__fadeIn max-w-7xl mx-auto overflow-hidden">
    
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">ภาพรวมระบบ (Overview)</h1>
      <p class="text-gray-400 text-sm sm:text-base">ยินดีต้อนรับเข้าสู่ระบบจัดการ GL & BL Showtime</p>
    </div>

    <!-- ปุ่มเปิด/ปิด โหมดปรับปรุงระบบ -->
    <div class="mb-8 p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors bg-black/40" :class="isMaintenance ? 'border-yellow-500/50' : 'border-white/5'">
      <div class="flex items-center gap-4">
        <div :class="['w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', isMaintenance ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-400']">
          <Wrench class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-white">โหมดปิดปรับปรุงระบบ (Maintenance)</h2>
          <p class="text-sm text-gray-400">{{ isMaintenance ? 'เปิดใช้งานอยู่ - คนนอกเข้าเว็บไม่ได้' : 'ปิดใช้งาน - ระบบทำงานปกติ' }}</p>
        </div>
      </div>
      <button @click="toggleMaintenance" :class="['px-6 py-2.5 rounded-xl font-bold transition-all w-full sm:w-auto', isMaintenance ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-white hover:bg-gray-700']">
        {{ isMaintenance ? 'ปิดโหมดปรับปรุง' : 'เปิดโหมดปรับปรุง' }}
      </button>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      <div class="glass-card p-6 rounded-2xl relative overflow-hidden group border border-emerald-500/20">
        <div class="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transition-all"></div>
        <div class="flex items-center justify-between relative z-10">
          <div><p class="text-gray-400 text-sm mb-1 font-medium">ซีรีส์ในระบบ</p><h2 class="text-3xl sm:text-4xl font-extrabold text-white">{{ stats.series }} <span class="text-sm font-normal text-gray-500">เรื่อง</span></h2></div>
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center"><Film class="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" /></div>
        </div>
      </div>
      <div class="glass-card p-6 rounded-2xl relative overflow-hidden group border border-cyan-500/20">
        <div class="absolute -right-6 -top-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl transition-all"></div>
        <div class="flex items-center justify-between relative z-10">
          <div><p class="text-gray-400 text-sm mb-1 font-medium">ผู้ใช้งานทั้งหมด</p><h2 class="text-3xl sm:text-4xl font-extrabold text-white">{{ stats.users }} <span class="text-sm font-normal text-gray-500">บัญชี</span></h2></div>
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center"><Users class="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" /></div>
        </div>
      </div>
      <div class="glass-card p-6 rounded-2xl relative overflow-hidden group border border-purple-500/20 sm:col-span-2 lg:col-span-1">
        <div class="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl transition-all"></div>
        <div class="flex items-center justify-between relative z-10">
          <div><p class="text-gray-400 text-sm mb-1 font-medium">บันทึกระบบ (Logs)</p><h2 class="text-3xl sm:text-4xl font-extrabold text-white">{{ stats.logs }} <span class="text-sm font-normal text-gray-500">รายการ</span></h2></div>
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center"><FileText class="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" /></div>
        </div>
      </div>
    </div>

    <!-- Charts Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      <!-- สัดส่วนคอนเทนต์ -->
      <div class="glass-card rounded-2xl p-6 border border-white/5 flex flex-col">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center"><BarChart3 class="w-5 h-5 text-gray-300" /></div>
          <h2 class="text-lg font-bold text-white">สัดส่วนคอนเทนต์</h2>
        </div>
        <div v-if="!isLoading" class="flex-grow flex flex-col justify-center gap-6">
          <div class="w-full h-6 bg-gray-800 rounded-full overflow-hidden flex shadow-inner">
            <div :style="`width: ${glPercent}%`" class="h-full bg-pink-500 transition-all duration-1000 flex items-center justify-center text-[10px] font-bold text-white"><span v-if="glPercent > 10">{{ glPercent }}%</span></div>
            <div :style="`width: ${blPercent}%`" class="h-full bg-blue-500 transition-all duration-1000 flex items-center justify-center text-[10px] font-bold text-white"><span v-if="blPercent > 10">{{ blPercent }}%</span></div>
          </div>
          <div class="flex justify-between items-center text-sm">
            <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-pink-500"></span><span class="text-gray-300">GL Series ({{ glCount }})</span></div>
            <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-500"></span><span class="text-gray-300">BL Series ({{ blCount }})</span></div>
          </div>
        </div>
      </div>

      <!-- กราฟซีรีส์ยอดฮิต -->
      <div class="glass-card rounded-2xl p-6 lg:col-span-2 border border-white/5 flex flex-col">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20"><Trophy class="w-5 h-5 text-yellow-400" /></div>
          <h2 class="text-lg font-bold text-white">Top 5 ซีรีส์ที่มีคนกดเพิ่มลงรายการของฉันมากที่สุด</h2>
        </div>
        
        <div v-if="isLoading" class="flex-grow flex items-center justify-center text-gray-500 text-sm">กำลังโหลดข้อมูลกราฟ...</div>
        <div v-else-if="topSeries.length === 0" class="flex-grow flex items-center justify-center text-gray-500 text-sm">ยังไม่มีผู้ใช้งานกดบันทึกซีรีส์</div>
        
        <div v-else class="space-y-4 flex-grow flex flex-col justify-center">
          <div v-for="(item, index) in topSeries" :key="index" class="w-full flex items-center gap-4">
            <span class="w-6 text-gray-500 font-bold text-sm text-right">#{{ index + 1 }}</span>
            <div class="flex-1">
              <div class="flex justify-between text-xs text-gray-300 mb-1">
                <span class="truncate max-w-[200px] sm:max-w-xs font-medium">{{ item.title }}</span>
                <span class="flex items-center gap-1 text-[#00e054]"><Bookmark class="w-3 h-3 fill-current"/> {{ item.count }}</span>
              </div>
              <div class="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div :style="`width: ${(item.count / maxBookmark) * 100}%`" class="bg-gradient-to-r from-emerald-500 to-[#00e054] h-full rounded-full transition-all duration-1000 ease-out"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="glass-card rounded-2xl p-6 border border-white/5">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center"><Activity class="w-5 h-5 text-gray-300" /></div>
        <h2 class="text-lg font-bold text-white">ความเคลื่อนไหวล่าสุด</h2>
      </div>
      <div v-if="isLoading" class="py-8 text-center text-gray-500 text-sm">กำลังโหลดประวัติ...</div>
      <div v-else class="space-y-3">
        <div v-for="log in recentLogs" :key="log.id" class="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-black/30 rounded-xl border border-white/5 hover:border-white/10 transition-colors gap-2 sm:gap-4">
          <div class="flex items-start gap-3">
            <div class="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.8)] flex-shrink-0"></div>
            <div>
              <p class="text-white text-sm font-medium line-clamp-1">{{ log.details }}</p>
              <p class="text-gray-500 text-[11px] mt-0.5">โดย: <span class="text-emerald-400">{{ log.user_email }}</span></p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 text-[11px] text-gray-400 whitespace-nowrap bg-gray-900/50 px-2 py-1 rounded-lg border border-gray-800 self-start sm:self-auto">
            <Clock class="w-3 h-3" /> {{ formatDate(log.created_at) }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>