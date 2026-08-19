<script setup>
import { FileText, AlertCircle } from 'lucide-vue-next'
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
        <div class="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <FileText class="w-8 h-8 text-blue-400" />
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">License Agreement</h1>
        <p class="text-gray-400">{{ t('ข้อตกลงและเงื่อนไขการใช้งาน GL Showtime', 'Terms and Conditions of GL Showtime') }}</p>
      </div>

      <!-- Content (Glass Card) -->
      <div class="glass-card p-8 md:p-12 rounded-2xl border border-white/10 space-y-8 bg-[#0a0a0a]">
        
        <div class="flex gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 items-start">
          <AlertCircle class="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-blue-200">
            {{ t('โปรดอ่านข้อตกลงด้านล่างนี้อย่างละเอียดก่อนการใช้งานเว็บไซต์ GL Showtime การที่คุณเข้าใช้งานเว็บไซต์นี้ ถือว่าคุณยอมรับเงื่อนไขทั้งหมด', 'Please read the agreement below carefully before using the GL Showtime website. By accessing this website, you agree to all conditions.') }}
          </p>
        </div>

        <section>
          <h2 class="text-2xl font-bold text-blue-400 mb-4">{{ t('1. จุดประสงค์ของเว็บไซต์', '1. Purpose of the Website') }}</h2>
          <p class="text-gray-300 leading-relaxed">
            {{ t('GL Showtime เป็นแพลตฟอร์มที่สร้างขึ้นเพื่อรวบรวมและนำเสนอข้อมูลเกี่ยวกับซีรีส์ GL (Girl Love) และ BL (Boy Love) รวมถึงการแสดงตัวอย่าง (Trailer) จากช่องทางออฟฟิเชียลเท่านั้น เว็บไซต์นี้ไม่ได้เป็นผู้ให้บริการโฮสต์วิดีโอตัวเต็ม', 'GL Showtime is a platform created to collect and present information about GL (Girl Love) and BL (Boy Love) series, including displaying trailers from official channels only. This website does not host full video content.') }}
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-blue-400 mb-4">{{ t('2. ลิขสิทธิ์และทรัพย์สินทางปัญญา (Copyright Disclaimer)', '2. Copyright and Intellectual Property (Copyright Disclaimer)') }}</h2>
          <p class="text-gray-300 leading-relaxed mb-4">
            {{ t('เนื้อหาวิดีโอที่ปรากฏบนเว็บไซต์นี้ไม่ได้ถูกอัปโหลดหรือจัดเก็บอยู่บนเซิร์ฟเวอร์ของเรา (Video Hosting) แต่เป็นการดึงข้อมูลผ่านระบบฝังวิดีโอ (Embed) จากแพลตฟอร์มสาธารณะ (เช่น YouTube) ซึ่งลิขสิทธิ์ทั้งหมดเป็นของบริษัทผู้ผลิตและเจ้าของผลงานตัวจริง', 'Video content appearing on this website is not uploaded or stored on our servers (Video Hosting). Instead, it is retrieved via an embedding system from public platforms (e.g., YouTube). All copyrights belong to the respective production companies and original creators.') }}
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>{{ t('รูปภาพปกซีรีส์ โลโก้ และเนื้อหาย่อ ถูกนำมาใช้เพื่อการโปรโมทและการรีวิวเท่านั้น', 'Series cover images, logos, and synopses are used for promotional and review purposes only.') }}</li>
            <li>{{ t('GL Showtime ไม่มีเจตนาละเมิดลิขสิทธิ์หรือแสวงหาผลกำไรจากการแจกจ่ายเนื้อหาที่ละเมิดลิขสิทธิ์', 'GL Showtime has no intention to infringe on copyrights or seek profit from distributing copyrighted content.') }}</li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-blue-400 mb-4">{{ t('3. ข้อจำกัดความรับผิดชอบ (Limitation of Liability)', '3. Limitation of Liability') }}</h2>
          <p class="text-gray-300 leading-relaxed">
            {{ t('เราไม่รับประกันว่าลิงก์วิดีโอจากภายนอกจะสามารถใช้งานได้ตลอดเวลา หากวิดีโอต้นฉบับถูกลบหรือตั้งค่าเป็นส่วนตัวจากผู้เผยแพร่ วิดีโอนั้นจะไม่สามารถรับชมได้บนเว็บไซต์ของเราเช่นกัน', 'We do not guarantee that external video links will be available at all times. If the original video is deleted or set to private by the publisher, it will also be unviewable on our website.') }}
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-blue-400 mb-4">{{ t('4. การเปลี่ยนแปลงข้อตกลง', '4. Changes to the Agreement') }}</h2>
          <p class="text-gray-300 leading-relaxed">
            {{ t('GL Showtime ขอสงวนสิทธิ์ในการแก้ไขหรือเปลี่ยนแปลงข้อตกลงและเงื่อนไขเหล่านี้ได้ตลอดเวลาโดยไม่ต้องแจ้งให้ทราบล่วงหน้า ผู้ใช้งานควรเข้ามาตรวจสอบหน้านี้เป็นระยะ', 'GL Showtime reserves the right to modify or change these terms and conditions at any time without prior notice. Users should periodically check this page.') }}
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
/* คลาสสำหรับกันการลากคลุมดำข้อความ (เสริมความชัวร์) */
.select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>