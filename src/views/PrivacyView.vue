<script setup>
import { ShieldCheck, Mail } from 'lucide-vue-next'
import { t } from '../store' // ดึงระบบ 2 ภาษามาใช้
</script>

<template>
  <!-- เพิ่ม event กันคลิกขวา, กันก๊อปปี้, และคลาส select-none เพื่อกันลากคลุมดำ -->
  <div 
    class="min-h-screen bg-[#050505] pt-28 pb-20 px-6 md:px-12 font-sans animate__animated animate__fadeIn select-none"
    @contextmenu.prevent
    @copy.prevent
    @cut.prevent
    @selectstart.prevent
  >
    <div class="max-w-4xl mx-auto">
      
      <!-- Header -->
      <div class="mb-10 text-center">
        <div class="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <ShieldCheck class="w-8 h-8 text-emerald-400" />
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
        <p class="text-gray-400">{{ t('นโยบายความเป็นส่วนตัวของ GL Showtime', 'Privacy Policy of GL Showtime') }}</p>
        <p class="text-sm text-gray-500 mt-2">{{ t('อัปเดตล่าสุด: สิงหาคม 2026', 'Last updated: August 2026') }}</p>
      </div>

      <!-- Content (Glass Card) -->
      <div class="glass-card p-8 md:p-12 rounded-2xl border border-white/10 space-y-8 bg-[#0a0a0a]">
        
        <section>
          <h2 class="text-2xl font-bold text-emerald-400 mb-4">{{ t('1. ข้อมูลที่เรารวบรวม', '1. Information We Collect') }}</h2>
          <p class="text-gray-300 leading-relaxed">
            {{ t('เมื่อคุณใช้งาน GL Showtime ระบบอาจมีการรวบรวมข้อมูลพื้นฐานที่จำเป็นต่อการให้บริการ เช่น ข้อมูลการสมัครสมาชิก (ชื่อผู้ใช้งานและอีเมล) เพื่อใช้ในการเข้าสู่ระบบและการใช้งานฟีเจอร์ส่วนบุคคล รหัสผ่านของคุณจะถูกเข้ารหัสและจัดเก็บอย่างปลอดภัยผ่านบริการของ Supabase', 'When you use GL Showtime, the system may collect basic information necessary to provide services, such as registration data (username and email) for logging in and using personalized features. Your password will be encrypted and securely stored via Supabase services.') }}
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-emerald-400 mb-4">{{ t('2. การใช้คุกกี้ (Cookies)', '2. Use of Cookies') }}</h2>
          <p class="text-gray-300 leading-relaxed">
            {{ t('เว็บไซต์นี้มีการใช้งานคุกกี้เพื่อจดจำสถานะการเข้าสู่ระบบ (Session) และปรับปรุงประสบการณ์การใช้งานของคุณให้ดียิ่งขึ้น เราไม่มีการใช้คุกกี้เพื่อติดตามข้อมูลเพื่อการโฆษณาเชิงพาณิชย์แต่อย่างใด', 'This website uses cookies to remember your login status (Session) and improve your user experience. We do not use cookies to track data for commercial advertising purposes.') }}
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-emerald-400 mb-4">{{ t('3. บริการของบุคคลที่สาม', '3. Third-Party Services') }}</h2>
          <p class="text-gray-300 leading-relaxed">
            {{ t('GL Showtime มีการใช้บริการเชื่อมต่อ API และการฝังวิดีโอจาก YouTube การแสดงผลวิดีโอตัวอย่างอยู่ภายใต้', 'GL Showtime uses API connections and embedded videos from YouTube. Displaying trailer videos is subject to') }} 
            <a href="https://policies.google.com/privacy" target="_blank" class="text-emerald-500 hover:underline">
              {{ t('นโยบายความเป็นส่วนตัวของ Google', "Google's Privacy Policy") }}
            </a> 
            {{ t('นอกจากนี้เรายังใช้ Vercel Analytics ในการวิเคราะห์สถิติผู้เข้าชมเว็บไซต์แบบไม่ระบุตัวตน', 'Additionally, we use Vercel Analytics to analyze anonymous website visitor statistics.') }}
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-emerald-400 mb-4">{{ t('4. การรักษาความปลอดภัยของข้อมูล', '4. Data Security') }}</h2>
          <p class="text-gray-300 leading-relaxed">
            {{ t('เราให้ความสำคัญกับความปลอดภัยของข้อมูลส่วนบุคคลของคุณ ข้อมูลทั้งหมดที่บันทึกในระบบจะถูกป้องกันการเข้าถึงที่ไม่ได้รับอนุญาตผ่านระบบรักษาความปลอดภัย Row Level Security (RLS) ของฐานข้อมูล', "We prioritize the security of your personal data. All information recorded in the system is protected against unauthorized access through the database's Row Level Security (RLS) system.") }}
          </p>
        </section>

        <div class="border-t border-white/10 pt-8 mt-8">
          <h3 class="text-lg font-bold text-white mb-3">{{ t('ติดต่อสอบถามข้อมูลเพิ่มเติม', 'Contact for more information') }}</h3>
          <div class="flex items-center gap-3 text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5 w-fit">
            <Mail class="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>Pattaradanai Saiwongkham ({{ t('ผู้ดูแลระบบ', 'Administrator') }})</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
/* คลาสสำหรับกันการลากคลุมดำข้อความ (เสริมความชัวร์) */
.select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>