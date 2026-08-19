<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { Play, Star, BookmarkMinus, Loader2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { t } from '../store' // ดึงระบบ 2 ภาษามาใช้

const router = useRouter()
const savedSeries = ref([])
const isLoading = ref(true)
const currentUser = ref(null)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    router.push('/login')
    return
  }
  currentUser.value = session.user
  fetchBookmarks()
})

const fetchBookmarks = async () => {
  try {
    const { data: bms, error: bmError } = await supabase.from('bookmarks').select('series_id').eq('user_id', currentUser.value.id)
    if (bmError) throw bmError

    if (bms && bms.length > 0) {
      const seriesIds = bms.map(b => b.series_id)
      const { data: seriesData, error: seriesError } = await supabase.from('series').select('*').in('id', seriesIds)
      if (seriesError) throw seriesError
      savedSeries.value = seriesData
    } else {
      savedSeries.value = []
    }
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
  } finally {
    isLoading.value = false
  }
}

const getYoutubeId = (url) => {
  const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/)
  return match ? match[1] : null
}

const getThumbnail = (url) => {
  const id = getYoutubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : 'https://via.placeholder.com/1280x720?text=No+Image'
}

const removeBookmark = async (seriesId) => {
  if(!confirm(t('ยืนยันการลบออกจากรายการของฉัน?', 'Are you sure you want to remove this from your list?'))) return
  await supabase.from('bookmarks').delete().match({ user_id: currentUser.value.id, series_id: seriesId })
  savedSeries.value = savedSeries.value.filter(s => s.id !== seriesId)
}
</script>

<template>
  <div class="min-h-screen bg-[#050505] pt-28 pb-20 px-6 md:px-12 font-sans animate__animated animate__fadeIn">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl md:text-4xl font-bold text-white mb-8 border-l-4 border-[#00e054] pl-4">{{ t('รายการของฉัน (My List)', 'My List') }}</h1>
      
      <div v-if="isLoading" class="text-center text-[#00e054] py-20 flex flex-col items-center gap-3">
        <Loader2 class="w-8 h-8 animate-spin" />
        <span>{{ t('กำลังโหลดข้อมูล...', 'Loading...') }}</span>
      </div>
      
      <div v-else-if="savedSeries.length === 0" class="text-center text-gray-500 py-20 bg-white/5 rounded-2xl border border-white/10">
        {{ t('คุณยังไม่ได้บันทึกซีรีส์เรื่องใดเลย', 'You haven\'t saved any series yet.') }}
        <br><span class="text-sm mt-2 block">{{ t('กลับไปดูซีรีส์ที่หน้า Home แล้วกดปุ่มบุ๊กมาร์กได้เลย!', 'Go back to Home and click the bookmark button!') }}</span>
      </div>
      
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        <div v-for="item in savedSeries" :key="item.id" class="relative rounded-lg overflow-hidden group border border-white/5 hover:border-[#00e054]/50 transition-all duration-300 bg-[#0a0a0a]">
          <div class="aspect-video relative bg-gray-900 rounded-t-lg overflow-hidden">
            <img :src="getThumbnail(item.trailer_url)" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
              <a :href="item.trailer_url" target="_blank" class="w-10 h-10 bg-[#00e054] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <Play class="w-4 h-4 text-black fill-black ml-0.5" />
              </a>
              <button @click="removeBookmark(item.id)" class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform" :title="t('ลบออกจากรายการ', 'Remove')">
                <BookmarkMinus class="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-white font-medium text-sm truncate">{{ item.title }}</h3>
            <div class="flex items-center justify-between mt-2">
              <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded', item.type === 'GL' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400']">{{ item.type }}</span>
              <span class="text-yellow-400 text-xs flex items-center gap-1"><Star class="w-3 h-3 fill-current"/> {{ item.rating }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>