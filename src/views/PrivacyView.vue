<script setup>
import { ShieldCheck, Mail } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-[#050505] pt-28 pb-20 px-6 md:px-12 font-sans animate__animated animate__fadeIn">
    <div class="max-w-4xl mx-auto">
      
      <!-- Header -->
      <div class="mb-10 text-center">
        <div class="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <ShieldCheck class="w-8 h-8 text-emerald-400" />
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
        <p class="text-gray-400">นโยบายความเป็นส่วนตัวของ GL Showtime</p>
        <p class="text-sm text-gray-500 mt-2">อัปเดตล่าสุด: สิงหาคม 2026</p>
      </div>

      <!-- Content (Glass Card) -->
      <div class="glass-card p-8 md:p-12 rounded-2xl border border-white/10 space-y-8 bg-[#0a0a0a]">
        
        <section>
          <h2 class="text-2xl font-bold text-emerald-400 mb-4">1. ข้อมูลที่เรารวบรวม</h2>
          <p class="text-gray-300 leading-relaxed">
            เมื่อคุณใช้งาน GL Showtime ระบบอาจมีการรวบรวมข้อมูลพื้นฐานที่จำเป็นต่อการให้บริการ เช่น ข้อมูลการสมัครสมาชิก (ชื่อผู้ใช้งานและอีเมล) เพื่อใช้ในการเข้าสู่ระบบและการใช้งานฟีเจอร์ส่วนบุคคล รหัสผ่านของคุณจะถูกเข้ารหัสและจัดเก็บอย่างปลอดภัยผ่านบริการของ Supabase
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-emerald-400 mb-4">2. การใช้คุกกี้ (Cookies)</h2>
          <p class="text-gray-300 leading-relaxed">
            เว็บไซต์นี้มีการใช้งานคุกกี้เพื่อจดจำสถานะการเข้าสู่ระบบ (Session) และปรับปรุงประสบการณ์การใช้งานของคุณให้ดียิ่งขึ้น เราไม่มีการใช้คุกกี้เพื่อติดตามข้อมูลเพื่อการโฆษณาเชิงพาณิชย์แต่อย่างใด
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-emerald-400 mb-4">3. บริการของบุคคลที่สาม</h2>
          <p class="text-gray-300 leading-relaxed">
            GL Showtime มีการใช้บริการเชื่อมต่อ API และการฝังวิดีโอจาก YouTube การแสดงผลวิดีโอตัวอย่างอยู่ภายใต้ <a href="https://policies.google.com/privacy" target="_blank" class="text-emerald-500 hover:underline">นโยบายความเป็นส่วนตัวของ Google</a> นอกจากนี้เรายังใช้ Vercel Analytics ในการวิเคราะห์สถิติผู้เข้าชมเว็บไซต์แบบไม่ระบุตัวตน
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-emerald-400 mb-4">4. การรักษาความปลอดภัยของข้อมูล</h2>
          <p class="text-gray-300 leading-relaxed">
            เราให้ความสำคัญกับความปลอดภัยของข้อมูลส่วนบุคคลของคุณ ข้อมูลทั้งหมดที่บันทึกในระบบจะถูกป้องกันการเข้าถึงที่ไม่ได้รับอนุญาตผ่านระบบรักษาความปลอดภัย Row Level Security (RLS) ของฐานข้อมูล
          </p>
        </section>

        <div class="border-t border-white/10 pt-8 mt-8">
          <h3 class="text-lg font-bold text-white mb-3">ติดต่อสอบถามข้อมูลเพิ่มเติม</h3>
          <div class="flex items-center gap-3 text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5 w-fit">
            <Mail class="w-5 h-5 text-emerald-400" />
            <span>Pattaradanai Saiwongkham (ผู้ดูแลระบบ)</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* หากไม่มีคลาส glass-card ใน style.css สามารถใช้โค้ดด้านล่างนี้ได้ */
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>