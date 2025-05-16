"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Person, FormData } from "@/lib/types"
import TreeView from "@/components/tree-view"
import PersonForm from "@/components/person-form"
import { sampleFamilyTree } from "@/lib/sample-data"
import { generateId, findPersonById, deletePerson, updatePerson, addChildToPerson, findParentById, buildFamilyTree } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Plus, LogOut, Moon, Sun } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"

export default function AdminPage() {
  const [familyTree, setFamilyTree] = useState<Person[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(undefined)
  const router = useRouter()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [dbRowExists, setDbRowExists] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    // تحميل البيانات من Supabase
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
  }, [router])

  if (!mounted) return null

  const saveToDatabase = async (data: Person[]) => {
    try {
      if (dbRowExists) {
        const { error } = await supabase
          .from('family_tree')
          .update({ tree_data: data })
          .eq('id', 1)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('family_tree')
          .insert([{ id: 1, tree_data: data }])
        if (error) throw error
        setDbRowExists(true)
      }
    } catch (error) {
      console.error("خطأ في حفظ البيانات:", error)
      toast({
        title: "خطأ في حفظ البيانات",
        description: "حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }

  const deleteFromDatabase = async () => {
    try {
      const { error } = await supabase
        .from('family_tree')
        .delete()
        .eq('id', 1)
      if (error) throw error
    } catch (error) {
      console.error("خطأ في حذف البيانات من قاعدة البيانات:", error)
      toast({
        title: "خطأ في حذف البيانات",
        description: "حدث خطأ أثناء حذف البيانات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }

  const handleAddPerson = () => {
    setSelectedPerson(null)
    setSelectedParentId(undefined)
    setShowAddModal(true)
  }

  const handleAddChild = (parentId: string) => {
    setSelectedPerson(null)
    setSelectedParentId(parentId)
    setShowAddModal(true)
  }

  const handleEditPerson = (person: Person) => {
    setSelectedPerson(person)
    setShowEditModal(true)
  }

  const handleDeletePerson = (person: Person) => {
    setSelectedPerson(person)
    setShowDeleteModal(true)
  }

  const handleAddSubmit = async (formData: FormData) => {
    await addPerson(formData)
    setShowAddModal(false)
    // إعادة تحميل البيانات
    const { data } = await supabase.from('people').select('*')
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
    toast({
      title: "تمت الإضافة بنجاح",
      description: `تمت إضافة ${formData.name} إلى شجرة العائلة`,
    })
  }

  const handleEditSubmit = async (formData: FormData) => {
    if (!selectedPerson) return
    await updatePersonDb(selectedPerson.id, formData)
    setShowEditModal(false)
    // إعادة تحميل البيانات
    const { data } = await supabase.from('people').select('*')
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
    toast({
      title: "تم التعديل بنجاح",
      description: `تم تعديل بيانات ${formData.name}`,
    })
  }

  const handleDeleteSubmit = async () => {
    if (!selectedPerson) return
    await deletePersonDb(selectedPerson.id)
    setShowDeleteModal(false)
    // إعادة تحميل البيانات
    const { data } = await supabase.from('people').select('*')
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
    toast({
      title: "تم الحذف بنجاح",
      description: `تم حذف ${selectedPerson.name} وجميع أبنائه من شجرة العائلة`,
      variant: "destructive",
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    router.push("/login")
  }

  // عمليات CRUD مباشرة على جدول people
  const addPerson = async (formData: FormData) => {
    const { error } = await supabase.from('people').insert([
      {
        name: formData.name,
        birth_year: formData.birthYear,
        death_year: formData.deathYear,
        gender: formData.gender,
        marital_status: formData.maritalStatus,
        spouse_name: formData.spouseName,
        children_count: formData.childrenCount,
        parent_id: formData.parentId || null,
      }
    ])
    if (error) throw error
  }

  const updatePersonDb = async (id: string, formData: FormData) => {
    const { error } = await supabase.from('people').update({
      name: formData.name,
      birth_year: formData.birthYear,
      death_year: formData.deathYear,
      gender: formData.gender,
      marital_status: formData.maritalStatus,
      spouse_name: formData.spouseName,
      children_count: formData.childrenCount,
      parent_id: formData.parentId || null,
    }).eq('id', id)
    if (error) throw error
  }

  const deletePersonDb = async (id: string) => {
    // حذف الشخص وجميع الأبناء (cascade)
    const { data: allPeople } = await supabase.from('people').select('*')
    const getAllDescendants = (pid: string): string[] => {
      const children = allPeople?.filter((p: any) => p.parent_id === pid) || []
      return children.reduce((acc: string[], child: any) => (
        [...acc, child.id, ...getAllDescendants(child.id)]
      ), [])
    }
    const idsToDelete = [id, ...getAllDescendants(id)]
    const { error } = await supabase.from('people').delete().in('id', idsToDelete)
    if (error) throw error
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-300">
      {/* Top navigation bar */}
      <div className="bg-white dark:bg-slate-800 shadow-md w-full h-16 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="شجرة العائلة" className="h-8 w-8" />
          <h1 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">لوحة الإدارة</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            aria-label={theme === "dark" ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            href="/"
            className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft size={16} />
            العودة للصفحة الرئيسية
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 mt-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 inline-block text-transparent bg-clip-text mb-4">
            شجرة العائلة - لوحة الإدارة
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">إدارة أفراد العائلة: إضافة، تعديل، وحذف</p>
        </div>

        {/* زر إضافة شخص جديد يظهر فقط إذا كانت الشجرة فارغة */}
        {familyTree.length === 0 && (
          <div className="flex justify-center mb-8">
            <button
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              onClick={handleAddPerson}
            >
              <Plus size={18} />
              إضافة شخص جديد
            </button>
          </div>
        )}
        {familyTree.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-300">
            لا توجد بيانات لعرضها حالياً.
          </div>
        ) : (
          <TreeView
            familyTree={familyTree}
            isAdmin={true}
            onEdit={handleEditPerson}
            onDelete={handleDeletePerson}
            onAddChild={handleAddChild}
          />
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <motion.div
            className="modal-content bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-header">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 inline-block text-transparent bg-clip-text">
                إضافة شخص جديد
              </h2>
              <button
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <PersonForm
              modalType="add"
              onSubmit={handleAddSubmit}
              onCancel={() => setShowAddModal(false)}
              parentId={selectedParentId}
            />
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPerson && (
        <div className="modal-overlay">
          <motion.div
            className="modal-content bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-header">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-300 inline-block text-transparent bg-clip-text">
                تعديل بيانات الشخص
              </h2>
              <button
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <PersonForm
              initialData={selectedPerson}
              modalType="edit"
              onSubmit={handleEditSubmit}
              onCancel={() => setShowEditModal(false)}
            />
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedPerson && (
        <div className="modal-overlay">
          <motion.div
            className="modal-content bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-header">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-500 dark:from-red-400 dark:to-rose-300 inline-block text-transparent bg-clip-text">
                حذف شخص
              </h2>
              <button
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>

            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center text-red-600 dark:text-red-400 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="font-bold">هل أنت متأكد من حذف {selectedPerson.name} وجميع أبنائه؟</span>
              </div>
              <p className="text-red-600 dark:text-red-400 text-sm">هذا الإجراء لا يمكن التراجع عنه.</p>
            </div>

            <PersonForm
              initialData={selectedPerson}
              modalType="delete"
              onSubmit={handleDeleteSubmit}
              onCancel={() => setShowDeleteModal(false)}
              isReadOnly={true}
            />
          </motion.div>
        </div>
      )}
    </main>
  )
}
