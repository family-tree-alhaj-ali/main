"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Person, FormData } from "@/lib/types"
import { User, Calendar, Heart, Users } from "lucide-react"
import { motion } from "framer-motion"

interface PersonFormProps {
  initialData?: Person
  onSubmit: (data: FormData) => void
  onCancel: () => void
  isReadOnly?: boolean
  modalType: "add" | "edit" | "delete"
  parentId?: string
}

export default function PersonForm({
  initialData,
  onSubmit,
  onCancel,
  isReadOnly = false,
  modalType,
  parentId,
}: PersonFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    birthYear: new Date().getFullYear() - 30,
    gender: "male",
    maritalStatus: "single",
    parentId: parentId,
  })

  const [showSpouseField, setShowSpouseField] = useState(false)
  const [isDeceased, setIsDeceased] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        birthYear: initialData.birthYear,
        deathYear: initialData.deathYear,
        gender: initialData.gender,
        maritalStatus: initialData.maritalStatus,
        spouseName: initialData.spouseName,
        childrenCount: initialData.childrenCount,
        parentId: initialData.parentId,
      })

      setShowSpouseField(initialData.maritalStatus === "married")
    }
  }, [initialData])

  useEffect(() => {
    if (initialData?.deathYear) {
      setIsDeceased(true)
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "birthYear" || name === "deathYear" || name === "childrenCount") {
      setFormData((prev) => ({ ...prev, [name]: value ? Number.parseInt(value) : undefined }))
    } else if (name === "maritalStatus") {
      setShowSpouseField(value === "married")
      setFormData((prev) => ({ ...prev, [name]: value, spouseName: value === "married" ? prev.spouseName : undefined }))
    } else if (name === "gender") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        childrenCount: value === "female" ? prev.childrenCount : undefined,
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const getConfirmButtonText = () => {
    switch (modalType) {
      case "add":
        return "إضافة"
      case "edit":
        return "تعديل"
      case "delete":
        return "تأكيد الحذف"
      default:
        return ""
    }
  }

  const getConfirmButtonClass = () => {
    switch (modalType) {
      case "add":
        return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
      case "edit":
        return "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
      case "delete":
        return "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
      default:
        return ""
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label htmlFor="name" className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
          الاسم
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <User className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isReadOnly}
            className="w-full pr-10 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="birthYear" className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
          سنة الميلاد
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Calendar className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="number"
            id="birthYear"
            name="birthYear"
            value={formData.birthYear}
            onChange={handleChange}
            required
            disabled={isReadOnly}
            className="w-full pr-10 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400"
          />
        </div>
      </div>

      <div className="form-group">
        <div className="flex items-center mb-2">
          <label htmlFor="isDeceased" className="font-medium text-slate-700 dark:text-slate-300 flex items-center">
            <input
              type="checkbox"
              id="isDeceased"
              checked={isDeceased}
              onChange={(e) => {
                setIsDeceased(e.target.checked)
                if (!e.target.checked) {
                  setFormData((prev) => ({ ...prev, deathYear: undefined }))
                }
              }}
              disabled={isReadOnly}
              className="mr-2 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            متوفي
          </label>
        </div>

        {isDeceased && (
          <div>
            <label htmlFor="deathYear" className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
              سنة الوفاة
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Calendar className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="number"
                id="deathYear"
                name="deathYear"
                value={formData.deathYear || ""}
                onChange={handleChange}
                required={isDeceased}
                disabled={isReadOnly}
                className="w-full pr-10 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400"
              />
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300">الجنس</label>
        <div className="grid grid-cols-2 gap-4">
          <label
            className={`flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${formData.gender === "male" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500 dark:border-emerald-700" : "bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"} ${isReadOnly ? "opacity-70 cursor-not-allowed" : "hover:bg-slate-100 dark:hover:bg-slate-600"}`}
          >
            <input
              type="radio"
              name="gender"
              value="male"
              checked={formData.gender === "male"}
              onChange={handleChange}
              disabled={isReadOnly}
              className="sr-only"
            />
            <User className="h-5 w-5" />
            ذكر
          </label>
          <label
            className={`flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${formData.gender === "female" ? "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-2 border-pink-500 dark:border-pink-700" : "bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"} ${isReadOnly ? "opacity-70 cursor-not-allowed" : "hover:bg-slate-100 dark:hover:bg-slate-600"}`}
          >
            <input
              type="radio"
              name="gender"
              value="female"
              checked={formData.gender === "female"}
              onChange={handleChange}
              disabled={isReadOnly}
              className="sr-only"
            />
            <User className="h-5 w-5" />
            أنثى
          </label>
        </div>
      </div>

      <div className="form-group">
        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300">الحالة الاجتماعية</label>
        <div className="grid grid-cols-2 gap-4">
          <label
            className={`flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${formData.maritalStatus === "single" ? "bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 border-2 border-slate-400 dark:border-slate-600" : "bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"} ${isReadOnly ? "opacity-70 cursor-not-allowed" : "hover:bg-slate-100 dark:hover:bg-slate-600"}`}
          >
            <input
              type="radio"
              name="maritalStatus"
              value="single"
              checked={formData.maritalStatus === "single"}
              onChange={handleChange}
              disabled={isReadOnly}
              className="sr-only"
            />
            <User className="h-5 w-5" />
            {formData.gender === "male" ? "أعزب" : "عزباء"}
          </label>
          <label
            className={`flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${formData.maritalStatus === "married" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-2 border-amber-500 dark:border-amber-700" : "bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"} ${isReadOnly ? "opacity-70 cursor-not-allowed" : "hover:bg-slate-100 dark:hover:bg-slate-600"}`}
          >
            <input
              type="radio"
              name="maritalStatus"
              value="married"
              checked={formData.maritalStatus === "married"}
              onChange={handleChange}
              disabled={isReadOnly}
              className="sr-only"
            />
            <Heart className="h-5 w-5" />
            {formData.gender === "male" ? "متزوج" : "متزوجة"}
          </label>
        </div>
      </div>

      {showSpouseField && (
        <motion.div
          className="form-group"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <label htmlFor="spouseName" className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
            {formData.gender === "male" ? "اسم الزوجة" : "اسم الزوج"}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Heart className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="spouseName"
              name="spouseName"
              value={formData.spouseName || ""}
              onChange={handleChange}
              required
              disabled={isReadOnly}
              className="w-full pr-10 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400"
            />
          </div>
        </motion.div>
      )}

      {formData.gender === "female" && formData.maritalStatus === "married" && (
        <motion.div
          className="form-group"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <label htmlFor="childrenCount" className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
            عدد الأبناء
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="number"
              id="childrenCount"
              name="childrenCount"
              value={formData.childrenCount || 0}
              onChange={handleChange}
              required
              disabled={isReadOnly}
              className="w-full pr-10 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400"
            />
          </div>
        </motion.div>
      )}

      <div className="modal-footer pt-4 flex justify-end gap-3">
        <button
          type="button"
          className="px-5 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
          onClick={onCancel}
        >
          إلغاء
        </button>
        <button
          type="submit"
          className={`px-5 py-2.5 rounded-lg text-white shadow-md hover:shadow-lg transition-all ${getConfirmButtonClass()}`}
        >
          {getConfirmButtonText()}
        </button>
      </div>
    </form>
  )
}
