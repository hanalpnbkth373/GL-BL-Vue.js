import { ref } from 'vue'

// ค่าเริ่มต้นเป็นภาษาไทย
export const currentLang = ref('th')

// ฟังก์ชันสลับภาษา (รับค่า Text ภาษาไทย และ ภาษาอังกฤษ)
export const t = (thText, enText) => {
  return currentLang.value === 'th' ? thText : enText
}