"use client"

import { useState, useEffect } from "react"
import type { Person } from "@/lib/types"
import TreeView from "@/components/tree-view"
import { sampleFamilyTree } from "@/lib/sample-data"
import Link from "next/link"
import { Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { supabase } from "@/lib/supabase"
import { buildFamilyTree } from "@/lib/utils"

export default function Home() {
  const [familyTree, setFamilyTree] = useState<Person[]>([])
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // تحميل البيانات
  useEffect(() => {
    setMounted(true)
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from('people')
          .select('*')
        if (error) throw error
        if (data && data.length > 0) {
          setFamilyTree(buildFamilyTree(data.map((p: any) => ({
            id: p.id,
            name: p.name,
            birthYear: p.birth_year,
            deathYear: p.death_year,
            gender: p.gender,
            maritalStatus: p.marital_status,
            spouseName: p.spouse_name,
            childrenCount: p.children_count,
            parentId: p.parent_id,
          }))))
        } else {
          setFamilyTree([])
        }
      } catch (error) {
        setFamilyTree([])
      }
    }
    loadData()
  }, [])

  // حفظ البيانات عند التغيير
  useEffect(() => {
    if (mounted) {
      const saveData = async () => {
        try {
          console.log("بدء حفظ البيانات...")
          console.log("البيانات المراد حفظها:", familyTree)
          
          const { data, error } = await supabase
            .from('family_tree')
            .update({ tree_data: familyTree })
            .eq('id', 1)
            .select()
          
          console.log("نتيجة الحفظ:", { data, error })
          
          if (error) {
            console.error("تفاصيل خطأ الحفظ:", {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            })
            throw error
          }
        } catch (error) {
          console.error("تفاصيل خطأ الحفظ الكامل:", error)
        }
      }
      saveData()
    }
  }, [familyTree, mounted])

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-300">
      {/* Top navigation bar */}
      <div className="bg-white dark:bg-slate-800 shadow-md w-full h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-10 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="شجرة العائلة" className="h-7 w-7 sm:h-8 sm:w-8" />
          <h1 className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">شجرة العائلة</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 sm:p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            aria-label={theme === "dark" ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
          >
            {theme === "dark" ? (
              <Sun size={16} className="sm:w-[18px] sm:h-[18px]" />
            ) : (
              <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />
            )}
          </button>

          <Link
            href="/login"
            className="p-1.5 sm:p-2 rounded-full bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 transition-all"
            aria-label="الإدارة"
          >
            <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 sm:mb-12 mt-4">
          <h1 className="text-xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 inline-block text-transparent bg-clip-text mb-2 sm:mb-4">
            شجرة عائلةالحاج علي محمد حسن
          </h1>
          <p className="text-base sm:text-sm text-slate-600 dark:text-slate-300 px-4">
            استكشف تاريخ العائلة وتعرف على أفرادها عبر الأجيال المختلفة
          </p>
        </div>
        {familyTree.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-300">
            لا توجد بيانات لعرضها حالياً.
          </div>
        ) : (
          <TreeView familyTree={familyTree} />
        )}
      </div>
    </main>
  )
}
