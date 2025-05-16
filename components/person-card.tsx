"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Person } from "@/lib/types"
import { calculateAge } from "@/lib/utils"
import {
  Info,
  ChevronDown,
  ChevronUp,
  User,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  BellRingIcon as Ring,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"

interface PersonCardProps {
  person: Person
  isExpanded: boolean
  onToggleExpand: () => void
  onInfoClick: (person: Person) => void
  isAdmin?: boolean
  onEdit?: (person: Person) => void
  onDelete?: (person: Person) => void
  onAddChild?: (parentId: string) => void
  isHighlighted?: boolean
  isChildHighlighted?: boolean
}

export default function PersonCard({
  person,
  isExpanded,
  onToggleExpand,
  onInfoClick,
  isAdmin = false,
  onEdit,
  onDelete,
  onAddChild,
  isHighlighted = false,
  isChildHighlighted = false,
}: PersonCardProps) {
  const [showInfo, setShowInfo] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Add this useEffect to handle closing dropdowns
  useEffect(() => {
    // Function to close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      // تحقق مما إذا كان النقر خارج القائمة المنسدلة
      const target = e.target as Node
      const dropdownElement = document.querySelector(`[data-dropdown-id="${person.id}"]`)
      if (dropdownElement && !dropdownElement.contains(target) && showDropdown) {
        setShowDropdown(false)
      }
    }

    // Function to handle the custom event to close all dropdowns except the one being opened
    const handleCloseAllDropdowns = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail && customEvent.detail.exceptId !== person.id) {
        setShowDropdown(false)
      }
    }

    // Add event listeners
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("closeAllDropdowns", handleCloseAllDropdowns)

    // Clean up event listeners
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("closeAllDropdowns", handleCloseAllDropdowns)
    }
  }, [showDropdown, person.id])

  const age = calculateAge(person.birthYear, person.deathYear)
  const hasChildren = person.children && person.children.length > 0
  const canHaveChildren =
    person.gender === "male" || (person.gender === "female" && person.children && person.children.length > 0)

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowInfo(true)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault() // إضافة هذا السطر لمنع السلوك الافتراضي
    if (onEdit) {
      onEdit(person)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault() // إضافة هذا السطر لمنع السلوك الافتراضي
    if (onDelete) {
      onDelete(person)
    }
  }

  const handleAddChildClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault() // إضافة هذا السطر لمنع السلوك الافتراضي
    if (onAddChild && canHaveChildren) {
      onAddChild(person.id)
    }
  }

  const getBorderClass = () => {
    if (isHighlighted) return "ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
    if (isChildHighlighted) return "ring-2 ring-red-300 shadow-[0_0_10px_rgba(252,165,165,0.5)]"
    return "ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-emerald-300 dark:hover:ring-emerald-700"
  }

  const getMaritalStatus = () => {
    if (person.gender === "male") {
      return person.maritalStatus === "married" ? "متزوج" : "أعزب"
    } else {
      return person.maritalStatus === "married" ? "متزوجة" : "عزباء"
    }
  }

  const getAvatarGradient = () => {
    return person.gender === "male"
      ? "bg-gradient-to-br from-emerald-500 to-teal-600"
      : "bg-gradient-to-br from-pink-500 to-rose-600"
  }

  return (
    <>
      <motion.div
        className={`relative bg-white dark:bg-slate-800 rounded-xl p-1 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${getBorderClass()} backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 hover:shadow-lg w-full min-w-[50px] max-w-[50] h-[20px] sm:h-[20px]`}
        onClick={onToggleExpand}
        whileHover={{ y: -3, scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* صف أفقي: الأيقونة يمين والاسم يسارها */}
        <div className="flex flex-row items-center justify-between w-full gap-2">
          <div className="flex items-center  flex-1">
            <div
              className={`w-4 h-4 sm:w-4 sm:h-4 rounded-full ${getAvatarGradient()} flex items-center justify-center shadow-lg`}
            >
              <User className="text-white" size={10} />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-wide whitespace-nowrap overflow-x-auto">
              {person.name}
            </h3>
          </div>
          <div className="flex items-center gap-1 relative">
            <button
              className="w-4 h-4 rounded-full bg-blue-500/90 hover:bg-blue-600 flex items-center justify-center text-white shadow-md transform hover:scale-110 transition-all"
              onClick={handleInfoClick}
              aria-label="معلومات"
            >
              <Info size={8} />
            </button>
            {isAdmin && (
              <>
                <button
                  className="w-4 h-4 rounded-full bg-slate-500/90 hover:bg-slate-600 flex items-center justify-center text-white shadow-md transform hover:scale-110 transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!showDropdown) {
                      document.dispatchEvent(new CustomEvent("closeAllDropdowns", { detail: { exceptId: person.id } }))
                    }
                    setShowDropdown(!showDropdown)
                  }}
                  aria-label="المزيد من الخيارات"
                >
                  <MoreVertical size={8} />
                </button>
                {showDropdown && (
                  <div
                    className="absolute top-6 right-0 bg-white dark:bg-slate-800 rounded-md shadow-lg p-1 min-w-[100px] z-20"
                    onClick={(e) => e.stopPropagation()}
                    data-dropdown-id={person.id}
                  >
                    {canHaveChildren && onAddChild && (
                      <button
                        className="w-full text-right px-2 py-1.5 text-xs rounded-md flex items-center gap-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          if (onAddChild) {
                            onAddChild(person.id)
                          }
                        }}
                      >
                        <Plus size={12} />
                        إضافة ابن
                      </button>
                    )}
                    <button
                      className="w-full text-right px-2 py-1.5 text-xs rounded-md flex items-center gap-1 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/30"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (onEdit) {
                          onEdit(person)
                        }
                      }}
                    >
                      <Edit size={12} />
                      تعديل
                    </button>
                    <button
                      className="w-full text-right px-2 py-1.5 text-xs rounded-md flex items-center gap-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (onDelete) {
                          onDelete(person)
                        }
                      }}
                    >
                      <Trash2 size={12} />
                      حذف
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* أيقونة السهم في الأسفل في الوسط */}
        {hasChildren && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 p-0.5 rounded-full">
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        )}
      </motion.div>

      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="bg-white dark:bg-slate-800 border-none shadow-xl max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 inline-block text-transparent bg-clip-text">
              معلومات {person.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 rounded-full ${getAvatarGradient()} flex items-center justify-center shadow-lg`}>
              <User className="text-white" size={32} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">الاسم:</span>
              <span className="text-slate-800 dark:text-white">{person.name}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">العمر:</span>
              {/* <span className="text-slate-800 dark:text-white">{age} سنة</span> */}
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">سنة الميلاد:</span>
              <span className="text-slate-800 dark:text-white">{person.birthYear}</span>
            </div>

            {person.deathYear && (
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">سنة الوفاة:</span>
                <span className="text-slate-800 dark:text-white">{person.deathYear}</span>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">الجنس:</span>
              <span
                className={
                  person.gender === "male"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-pink-600 dark:text-pink-400"
                }
              >
                {person.gender === "male" ? "ذكر" : "أنثى"}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">الحالة الاجتماعية:</span>
              <span className="text-slate-800 dark:text-white">{getMaritalStatus()}</span>
            </div>

            {person.maritalStatus === "married" && (
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {person.gender === "male" ? "اسم الزوجة:" : "اسم الزوج:"}
                </span>
                {/* <span className="text-slate-800 dark:text-white">{person.spouseName}</span> */}
              </div>
            )}

            {hasChildren && (
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">عدد الأبناء:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{person.children?.length}</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
