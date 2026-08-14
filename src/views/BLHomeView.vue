<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { supabase } from '../supabase'
import { Play, Bookmark, X, Star, ChevronLeft, ChevronRight, Calendar, Clock, UserCircle, Video, Tv, Search, Loader2 } from 'lucide-vue-next'
import { t } from '../store' // ระบบ 2 ภาษา

const seriesList = ref([])
const historyList = ref([]) // ประวัติการดู
const isLoading = ref(true)
const selectedSeries = ref(null)
const isModalOpen = ref(false)
const currentUser = ref(null)
const bookmarkedIds = ref([])

const searchQuery = ref('')
const selectedGenre = ref('')

const currentIndex = ref(0)
let slideInterval = null

// State สำหรับระบบรีวิว
const reviews = ref([])
const isFetchingReviews = ref(false)
const isSubmittingReview = ref(false)
const newReview = ref({ rating: 5, comment: '' })

onMounted(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      currentUser.value = session.user
      const { data: bms } = await supabase.from('bookmarks').select('series_id').eq('user_id', session.user.id)
      if (bms) bookmarkedIds.value = bms.map(b => b.series_id)

      // ดึงประวัติการดูเฉพาะของ GL
      const { data: hist } = await supabase.from('watch_history').select('*, series(*)').eq('user_id', session.user.id).order('watched_at', { ascending: false }).limit(5)
      if (hist) historyList.value = hist.filter(h => h.series && h.series.type === 'GL').map(h => h.series)
    }

    const { data, error } = await supabase
      .from('series')
      .select('*')
      .eq('type', 'BL') // <--- สำหรับ BLHomeView เปลี่ยนตรงนี้เป็น 'BL' นะครับ!
      .eq('status', 'Published')
      .order('id', { ascending: false })

    if (error) throw error
    if (data) {
      seriesList.value = data
      if (heroItems.value.length > 1) startSlide()
    }
  } catch (error) {
    console.error("Error fetching series:", error)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => stopSlide())

const heroItems = computed(() => {
  const heroes = seriesList.value.filter(s => s.is_hero)
  return heroes.length > 0 ? heroes : seriesList.value.slice(0, 5)
})

const heroSeries = computed(() => heroItems.value.length > 0 ? heroItems.value[currentIndex.value % heroItems.value.length] : null)

const startSlide = () => { slideInterval = setInterval(nextSlide, 6000) }
const stopSlide = () => { if (slideInterval) clearInterval(slideInterval) }
const nextSlide = () => { currentIndex.value = (currentIndex.value + 1) % heroItems.value.length }
const prevSlide = () => { currentIndex.value = (currentIndex.value - 1 + heroItems.value.length) % heroItems.value.length }
const handleManualSlide = (direction) => { stopSlide(); direction === 'next' ? nextSlide() : prevSlide(); startSlide() }

const uniqueGenres = computed(() => {
  const genres = new Set()
  seriesList.value.forEach(s => { if(s.genres) s.genres.split(',').forEach(g => genres.add(g.trim())) })
  return Array.from(genres)
})

const filteredSeries = computed(() => {
  return seriesList.value.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchGenre = selectedGenre.value === '' || (s.genres && s.genres.includes(selectedGenre.value))
    return matchSearch && matchGenre
  })
})

const getYoutubeId = (url) => { const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/); return match ? match[1] : null }
const getYoutubeThumbnail = (url, type = 'maxres') => { const id = getYoutubeId(url); if (!id) return 'https://via.placeholder.com/1280x720/1a1a1a/4a4a4a?text=No+Image'; return type === 'maxres' ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : `https://img.youtube.com/vi/${id}/hqdefault.jpg` }
const handleImageError = (e, url) => { const fallbackUrl = getYoutubeThumbnail(url, 'hq'); if (e.target.src !== fallbackUrl) e.target.src = fallbackUrl }

const toggleBookmark = async (series) => {
  if (!currentUser.value) return alert(t('กรุณาเข้าสู่ระบบก่อนเพื่อเพิ่มในรายการของฉัน', 'Please login first to add to your list.'))
  const isSaved = bookmarkedIds.value.includes(series.id)
  if (isSaved) {
    await supabase.from('bookmarks').delete().match({ user_id: currentUser.value.id, series_id: series.id })
    bookmarkedIds.value = bookmarkedIds.value.filter(id => id !== series.id)
  } else {
    await supabase.from('bookmarks').insert({ user_id: currentUser.value.id, series_id: series.id })
    bookmarkedIds.value.push(series.id)
  }
}

// ---------------- ระบบรีวิว ----------------
const fetchReviews = async (seriesId) => {
  isFetchingReviews.value = true
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(email, display_name, avatar_url)')
      .eq('series_id', seriesId)
      .order('created_at', { ascending: false })
    if (error) throw error
    reviews.value = data || []
  } catch (err) {
    console.error('Fetch reviews error:', err)
  } finally {
    isFetchingReviews.value = false
  }
}

const submitReview = async () => {
  if (!newReview.value.comment.trim()) return alert(t('กรุณาพิมพ์ความคิดเห็น', 'Please enter a comment.'))
  isSubmittingReview.value = true
  try {
    const { error } = await supabase.from('reviews').upsert({
      series_id: selectedSeries.value.id,
      user_id: currentUser.value.id,
      rating: newReview.value.rating,
      comment: newReview.value.comment
    }, { onConflict: 'series_id, user_id' })
    
    if (error) throw error
    newReview.value = { rating: 5, comment: '' }
    await fetchReviews(selectedSeries.value.id)
  } catch (err) {
    alert('Error: ' + err.message)
  } finally {
    isSubmittingReview.value = false
  }
}

// ---------------- ประวัติการดู (Watch History) ----------------
const openDetails = async (series) => { 
  selectedSeries.value = series
  isModalOpen.value = true
  stopSlide()
  fetchReviews(series.id) // ดึงรีวิว

  // บันทึกประวัติการดู
  if (currentUser.value) {
    await supabase.from('watch_history').upsert({ 
      user_id: currentUser.value.id, 
      series_id: series.id, 
      watched_at: new Date() 
    }, { onConflict: 'user_id, series_id' })
  }
}

const closeModal = () => { isModalOpen.value = false; selectedSeries.value = null; if (heroItems.value.length > 1) startSlide() }
</script>

<template>
  <div>
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center text-[#00e054]"><Loader2 class="w-8 h-8 animate-spin" /></div>
    <div v-else-if="seriesList.length === 0" class="min-h-screen flex items-center justify-center text-gray-500">{{ t('ยังไม่มีข้อมูลซีรีส์ในระบบ', 'No series available yet.') }}</div>
    <div v-else>
      <!-- Hero Banner -->
      <section class="relative w-full h-[85vh] lg:h-[95vh] flex items-center overflow-hidden bg-[#050505]">
        <div class="absolute inset-0 w-full h-full z-0">
          <transition name="fade" mode="in-out"><img v-if="heroSeries" :key="heroSeries.id" :src="getYoutubeThumbnail(heroSeries.trailer_url, 'maxres')" @error="handleImageError($event, heroSeries.trailer_url)" class="absolute inset-0 w-full h-full object-cover" /></transition>
          <div class="absolute inset-y-0 left-0 w-full md:w-3/4 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent"></div>
          <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
        </div>

        <div class="w-full px-6 md:px-16 relative z-10 pt-20">
          <transition name="fade-slide" mode="out-in">
            <div v-if="heroSeries" :key="heroSeries.id" class="max-w-2xl">
              <h1 class="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white mb-6 leading-tight drop-shadow-xl" style="font-family: 'Kanit', sans-serif;">{{ heroSeries.title }}</h1>
              <div class="flex items-center gap-2 mb-4 flex-wrap">
                <span class="text-[11px] font-bold text-white bg-[#00e054] px-2 py-0.5 rounded-sm uppercase">{{ heroSeries.type }} Series</span>
                <span v-if="heroSeries.rating" class="text-xs font-bold text-white bg-black/40 border border-white/20 px-2 py-0.5 rounded-sm flex items-center gap-1 backdrop-blur-md"><Star class="w-3 h-3 text-[#00e054] fill-[#00e054]"/> {{ heroSeries.rating }}</span>
                <span class="text-xs font-semibold text-gray-200 bg-white/10 px-2 py-0.5 rounded-sm border border-white/10 backdrop-blur-md">{{ heroSeries.air_date }}</span>
              </div>
              <div class="text-sm font-medium text-gray-300 mb-6 flex gap-3"><span v-for="(genre, index) in (heroSeries.genres || '').split(',')" :key="index">{{ genre.trim() }}</span></div>
              <p class="text-gray-200 text-sm md:text-base mb-8 line-clamp-3 md:line-clamp-4 font-light max-w-xl leading-relaxed drop-shadow-md">{{ heroSeries.description }}</p>

              <div class="flex items-center gap-4">
                <button @click="openDetails(heroSeries)" class="w-14 h-14 bg-[#00e054] hover:bg-[#00c54f] rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-[0_0_20px_rgba(0,224,84,0.4)]"><Play class="w-6 h-6 text-black fill-black ml-1" /></button>
                <button @click="toggleBookmark(heroSeries)" class="w-14 h-14 bg-black/30 hover:bg-black/50 border border-white/30 hover:border-white/60 rounded-full flex items-center justify-center transition-all backdrop-blur-md text-white">
                  <Bookmark class="w-6 h-6" :class="bookmarkedIds.includes(heroSeries.id) ? 'fill-white text-white' : 'text-white'" />
                </button>
              </div>
            </div>
          </transition>
        </div>

        <button @click="handleManualSlide('prev')" class="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white transition-colors"><ChevronLeft class="w-12 h-12 drop-shadow-lg" /></button>
        <button @click="handleManualSlide('next')" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white transition-colors"><ChevronRight class="w-12 h-12 drop-shadow-lg" /></button>
        <div class="absolute bottom-8 right-12 z-20 flex gap-2"><button v-for="(item, index) in heroItems" :key="index" @click="() => { stopSlide(); currentIndex = index; startSlide(); }" :class="['h-1.5 rounded-full transition-all duration-300', (currentIndex % heroItems.length) === index ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70']"></button></div>
      </section>

      <!-- ส่วนประวัติการดู (รับชมล่าสุด) -->
      <section v-if="historyList.length > 0" class="relative z-10 px-6 md:px-12 pt-10">
        <h2 class="text-xl md:text-2xl font-bold text-white border-l-4 border-[#00e054] pl-3 mb-6">{{ t('รับชมล่าสุด', 'Continue Watching') }}</h2>
        <div class="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
          <div v-for="item in historyList" :key="item.id" @click="openDetails(item)" class="w-48 sm:w-64 flex-shrink-0 relative rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105">
            <div class="aspect-video relative bg-gray-900 rounded-lg overflow-hidden border border-white/10">
              <img :src="getYoutubeThumbnail(item.trailer_url, 'hq')" @error="handleImageError($event, item.trailer_url)" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div class="absolute bottom-0 left-0 w-full h-1 bg-gray-800"><div class="h-full bg-red-600 w-1/2"></div></div>
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40"><Play class="w-10 h-10 text-white fill-white opacity-80" /></div>
            </div>
            <h3 class="text-white font-medium text-xs sm:text-sm mt-2 truncate">{{ item.title }}</h3>
          </div>
        </div>
      </section>

      <!-- ระบบค้นหาและตัวกรอง -->
      <section class="relative z-10 px-6 md:px-12 pb-20 pt-10">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 class="text-2xl font-bold text-white border-l-4 border-[#00e054] pl-3">{{ t('ยอดนิยม (GL)', 'Trending (GL)') }}</h2>
          <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div class="flex overflow-x-auto hide-scrollbar gap-2 pb-2 sm:pb-0">
              <button @click="selectedGenre = ''" :class="['px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors', selectedGenre === '' ? 'bg-[#00e054] text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20']">{{ t('ทั้งหมด', 'All') }}</button>
              <button v-for="genre in uniqueGenres" :key="genre" @click="selectedGenre = genre" :class="['px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors', selectedGenre === genre ? 'bg-[#00e054] text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20']">{{ genre }}</button>
            </div>
            <div class="relative w-full sm:w-64 flex-shrink-0">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input v-model="searchQuery" type="text" :placeholder="t('ค้นหาชื่อซีรีส์...', 'Search series...')" class="w-full pl-9 pr-4 py-1.5 bg-black/40 border border-gray-700 rounded-full text-white text-sm focus:border-[#00e054] outline-none">
            </div>
          </div>
        </div>
        
        <div v-if="filteredSeries.length === 0" class="text-center py-10 text-gray-500">{{ t('ไม่พบซีรีส์ที่ตรงกับเงื่อนไขการค้นหา', 'No series found matching your search.') }}</div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          <div v-for="item in filteredSeries" :key="item.id" @click="openDetails(item)" class="relative rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-2">
            <div class="aspect-video relative bg-gray-900 rounded-lg overflow-hidden">
              <img :src="getYoutubeThumbnail(item.trailer_url, 'hq')" @error="handleImageError($event, item.trailer_url)" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div class="absolute top-0 right-0 bg-[#00e054] text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">TOP</div>
              <div v-if="bookmarkedIds.includes(item.id)" class="absolute top-2 left-2 bg-black/50 p-1 rounded-md backdrop-blur-sm"><Bookmark class="w-3.5 h-3.5 text-[#00e054] fill-[#00e054]" /></div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"><div class="w-10 h-10 bg-[#00e054] rounded-full flex items-center justify-center shadow-lg"><Play class="w-4 h-4 text-black fill-black ml-0.5" /></div></div>
            </div>
            <div class="pt-3">
              <h3 class="text-white font-medium text-sm truncate group-hover:text-[#00e054] transition-colors">{{ item.title }}</h3>
              <p class="text-gray-500 text-xs mt-1 truncate">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modal Details + ระบบ Review -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate__animated animate__fadeIn animate__faster">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative w-full max-w-4xl glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh] bg-[#0d0d0d]">
        <button @click="closeModal" class="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors backdrop-blur-sm"><X class="w-5 h-5" /></button>

        <div class="w-full aspect-video bg-black relative flex-shrink-0">
          <iframe v-if="getYoutubeId(selectedSeries.trailer_url)" class="w-full h-full" :src="`https://www.youtube.com/embed/${getYoutubeId(selectedSeries.trailer_url)}?autoplay=1`" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>

        <div class="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-grow">
          <div class="flex justify-between items-start mb-3">
            <h2 class="text-3xl font-bold text-white pr-4">{{ selectedSeries.title }}</h2>
            <button @click="toggleBookmark(selectedSeries)" class="flex-shrink-0 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><Bookmark class="w-6 h-6" :class="bookmarkedIds.includes(selectedSeries.id) ? 'fill-[#00e054] text-[#00e054]' : 'text-white'" /></button>
          </div>
          
          <div class="flex flex-wrap items-center gap-3 text-sm mb-6">
            <span class="text-[#00e054] font-bold bg-[#00e054]/10 px-2 py-1 rounded">{{ selectedSeries.type }} Series</span>
            <span class="text-gray-300">{{ selectedSeries.genres }}</span>
            <span class="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded"><Star class="w-4 h-4 fill-current"/> {{ selectedSeries.rating }}</span>
          </div>
          <p class="text-gray-300 text-sm md:text-base leading-relaxed mb-8">{{ selectedSeries.description }}</p>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-6 mb-10">
            <div class="flex items-start gap-3"><Calendar class="w-5 h-5 text-gray-400 mt-0.5" /><div><p class="text-xs text-gray-500 font-medium">{{ t('วันออนแอร์', 'Air Date') }}</p><p class="text-white text-sm">{{ selectedSeries.air_date }}</p></div></div>
            <div class="flex items-start gap-3"><Clock class="w-5 h-5 text-gray-400 mt-0.5" /><div><p class="text-xs text-gray-500 font-medium">{{ t('เวลาออนแอร์', 'Air Time') }}</p><p class="text-white text-sm">{{ selectedSeries.air_time }}</p></div></div>
            <div class="flex items-start gap-3"><UserCircle class="w-5 h-5 text-gray-400 mt-0.5" /><div><p class="text-xs text-gray-500 font-medium">{{ t('ผู้กำกับ', 'Director') }}</p><p class="text-white text-sm">{{ selectedSeries.director }}</p></div></div>
            <div class="flex items-start gap-3"><Tv class="w-5 h-5 text-gray-400 mt-0.5" /><div><p class="text-xs text-gray-500 font-medium">{{ t('ช่องทางการรับชม', 'Watch Platform') }}</p><p class="text-[#00e054] font-medium text-sm">{{ selectedSeries.watch_platform || '-' }}</p></div></div>
          </div>

          <!-- Section รีวิว -->
          <div class="border-t border-white/10 pt-8">
            <h3 class="text-xl font-bold text-white mb-6">{{ t('รีวิวและความคิดเห็น', 'Reviews & Comments') }}</h3>
            
            <div v-if="currentUser" class="mb-8 bg-white/5 p-5 rounded-xl border border-white/10">
              <div class="flex items-center gap-2 mb-4">
                <Star v-for="i in 5" :key="i" @click="newReview.rating = i" :class="['w-6 h-6 cursor-pointer transition-transform hover:scale-110', i <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600']" />
              </div>
              <textarea v-model="newReview.comment" rows="3" :placeholder="t('เขียนความรู้สึกของคุณหลังจากดูซีรีส์เรื่องนี้...', 'Write a review...')" class="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-[#00e054] outline-none text-sm mb-3 resize-none"></textarea>
              <div class="flex justify-end">
                <button @click="submitReview" :disabled="isSubmittingReview" class="bg-[#00e054] hover:bg-[#00c54f] text-black font-bold px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                  <Loader2 v-if="isSubmittingReview" class="w-4 h-4 animate-spin" />
                  {{ t('ส่งรีวิว', 'Submit') }}
                </button>
              </div>
            </div>
            <div v-else class="mb-8 p-4 bg-white/5 rounded-xl border border-white/10 text-center text-gray-400 text-sm">
              {{ t('กรุณา', 'Please') }} <RouterLink to="/login" class="text-[#00e054] hover:underline font-bold">{{ t('เข้าสู่ระบบ', 'Login') }}</RouterLink> {{ t('เพื่อเขียนรีวิว', 'to write a review.') }}
            </div>

            <div v-if="isFetchingReviews" class="text-center py-6 text-[#00e054]"><Loader2 class="w-6 h-6 animate-spin mx-auto" /></div>
            <div v-else-if="reviews.length === 0" class="text-center py-10 bg-white/5 rounded-xl border border-white/10 text-gray-500 text-sm">{{ t('ยังไม่มีรีวิวสำหรับซีรีส์เรื่องนี้', 'No reviews yet.') }}</div>
            <div v-else class="space-y-4">
              <div v-for="review in reviews" :key="review.id" class="bg-black/40 p-4 sm:p-5 rounded-xl border border-white/5">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-600">
                      <img v-if="review.profiles?.avatar_url" :src="review.profiles.avatar_url" class="w-full h-full object-cover">
                      <span v-else class="text-white font-bold text-xs uppercase">{{ (review.profiles?.display_name || review.profiles?.email || 'U').charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-white">{{ review.profiles?.display_name || review.profiles?.email?.split('@')[0] || 'Unknown User' }}</p>
                      <div class="flex items-center gap-1 mt-1">
                        <Star v-for="i in 5" :key="i" :class="['w-3 h-3', i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700']" />
                      </div>
                    </div>
                  </div>
                  <span class="text-[10px] text-gray-500 whitespace-nowrap">{{ new Date(review.created_at).toLocaleDateString('th-TH') }}</span>
                </div>
                <p class="text-sm text-gray-300 ml-13 leading-relaxed">{{ review.comment }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 1.5s ease-in-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-slide-enter-from { opacity: 0; transform: translateX(-30px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(30px); }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 224, 84, 0.5); border-radius: 10px; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>