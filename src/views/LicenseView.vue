<script setup>
import { FileText, AlertCircle } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-[#050505] pt-28 pb-20 px-6 md:px-12 font-sans animate__animated animate__fadeIn">
    <div class="max-w-4xl mx-auto">
      
      <!-- Header -->
      <div class="mb-10 text-center">
        <div class="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <FileText class="w-8 h-8 text-blue-400" />
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">License Agreement</h1>
        <p class="text-gray-400">ข้อตกลงการใช้งานเว็บไซต์ GL Showtime</p>
      </div>

      <!-- Content (Glass Card) -->
      <div class="glass-card p-8 md:p-12 rounded-2xl border border-white/10 space-y-8 bg-[#0a0a0a]">
        
        <div class="flex gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 items-start">
          <AlertCircle class="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-blue-200">
            โปรดอ่านข้อตกลงนี้อย่างละเอียด การที่คุณเข้าใช้งานเว็บไซต์ GL Showtime ถือว่าคุณยอมรับเงื่อนไขและข้อตกลงทั้งหมดที่ระบุไว้ด้านล่างนี้
          </p>
        </div>

        <section>
          <h2 class="text-2xl font-bold text-blue-400 mb-4">1. ขอบเขตการให้บริการ</h2>
          <p class="text-gray-300 leading-relaxed">
            GL Showtime เป็นแพลตฟอร์มที่สร้างขึ้นเพื่อนำเสนอและรวบรวมข้อมูลเกี่ยวกับซีรีส์ GL (Girl Love) และ BL (Boy Love) เว็บไซต์นี้ทำหน้าที่เป็นตัวกลางในการแสดงรายละเอียดเรทติ้ง เรื่องย่อ และวิดีโอตัวอย่าง (Trailer) เพื่อความบันเทิงและอำนวยความสะดวกในการค้นหาเท่านั้น
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-blue-400 mb-4">2. ลิขสิทธิ์เนื้อหาและสื่อ (Copyright Disclaimer)</h2>
          <p class="text-gray-300 leading-relaxed mb-4">
            <strong>เราไม่ได้เป็นผู้ให้บริการโฮสต์วิดีโอ (Video Hosting)</strong> ไฟล์สื่อ ภาพปก และวิดีโอตัวอย่างทั้งหมดที่ปรากฏบนแพลตฟอร์มนี้ เป็นการฝังลิงก์ (Embed) จากผู้ให้บริการบุคคลที่สาม (เช่น YouTube)
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>ลิขสิทธิ์ของวิดีโอ ภาพปก และเนื้อหาซีรีส์ เป็นของบริษัทผู้ผลิต ค่ายหนัง หรือผู้สร้างสรรค์ผลงานนั้นๆ แต่เพียงผู้เดียว</li>
            <li>GL Showtime ไม่มีเจตนาละเมิดลิขสิทธิ์ทางการค้าใดๆ หากท่านเป็นเจ้าของลิขสิทธิ์และต้องการให้ลบลิงก์ที่เกี่ยวข้องออกจากระบบ สามารถติดต่อผู้ดูแลระบบได้ทันที</li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-blue-400 mb-4">3. ข้อจำกัดความรับผิดชอบ (Limitation of Liability)</h2>
          <p class="text-gray-300 leading-relaxed">
            ผู้ดูแลระบบขอสงวนสิทธิ์ไม่รับผิดชอบต่อความเสียหายใดๆ ที่อาจเกิดขึ้นจากการใช้งานแพลตฟอร์ม หรือความผิดพลาดของเนื้อหาที่ดึงมาจากฐานข้อมูลภายนอก การใช้งานแพลตฟอร์มนี้เป็นความรับผิดชอบของผู้ใช้งานแต่เพียงผู้เดียว
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-blue-400 mb-4">4. การปรับปรุงและการเปลี่ยนแปลง</h2>
          <p class="text-gray-300 leading-relaxed">
            GL Showtime ขอสงวนสิทธิ์ในการแก้ไข ระงับ หรือยกเลิกการให้บริการ รวมถึงการแก้ไขข้อตกลงการใช้งานนี้เมื่อใดก็ได้ โดยไม่จำเป็นต้องแจ้งให้ทราบล่วงหน้า
          </p>
        </section>

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
</style>