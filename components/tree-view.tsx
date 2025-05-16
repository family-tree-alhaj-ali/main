"use client"

import { useState, useEffect, useRef } from "react"
import type { Person } from "@/lib/types"
import PersonCard from "./person-card"
import { countFamilyMembers } from "@/lib/utils"
import { Users } from "lucide-react"
import type { JSX } from "react/jsx-runtime"
import { motion } from "framer-motion"

interface TreeViewProps {
  familyTree: Person[]
  isAdmin?: boolean
  onEdit?: (person: Person) => void
  onDelete?: (person: Person) => void
  onAddChild?: (parentId: string) => void
}

export default function TreeView({ familyTree, isAdmin = false, onEdit, onDelete, onAddChild }: TreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [familyCount, setFamilyCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<JSX.Element[]>([])
  const [forceUpdate, setForceUpdate] = useState(0)
  const [lastExpandedNode, setLastExpandedNode] = useState<string | null>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    setFamilyCount(countFamilyMembers(familyTree))

    // Expand the root node by default
    if (familyTree.length > 0 && expandedNodes.size === 0) {
      const newExpandedNodes = new Set<string>()
      newExpandedNodes.add(familyTree[0].id)
      setExpandedNodes(newExpandedNodes)
      setLastExpandedNode(familyTree[0].id)
    }
  }, [familyTree])

  const toggleExpand = (id: string) => {
    const newExpandedNodes = new Set(expandedNodes)
    if (newExpandedNodes.has(id)) {
      newExpandedNodes.delete(id)
      // If we're collapsing the last expanded node, find its parent
      if (lastExpandedNode === id) {
        // Find the parent of this node
        for (const person of familyTree) {
          const parent = findParentInTree(person, id)
          if (parent) {
            setLastExpandedNode(parent.id)
            break
          }
        }
      }
    } else {
      newExpandedNodes.add(id)
      setLastExpandedNode(id)
    }
    setExpandedNodes(newExpandedNodes)

    // Force redraw of lines after a short delay to allow DOM to update
    setTimeout(() => {
      setForceUpdate((prev) => prev + 1)
    }, 50)
  }

  const findParentInTree = (person: Person, childId: string): Person | null => {
    if (!person.children) return null

    for (const child of person.children) {
      if (child.id === childId) return person

      const result = findParentInTree(child, childId)
      if (result) return result
    }

    return null
  }

  const isChildOfLastExpanded = (personId: string): boolean => {
    if (!lastExpandedNode) return false

    // Find the last expanded person
    const findPerson = (id: string, tree: Person[]): Person | null => {
      for (const person of tree) {
        if (person.id === id) return person
        if (person.children) {
          const found = findPerson(id, person.children)
          if (found) return found
        }
      }
      return null
    }

    const lastExpandedPerson = findPerson(lastExpandedNode, familyTree)
    if (!lastExpandedPerson || !lastExpandedPerson.children) return false

    return lastExpandedPerson.children.some((child) => child.id === personId)
  }

  useEffect(() => {
    // Draw connecting lines after the DOM has been updated
    const drawLines = () => {
      if (!containerRef.current) return

      const newLines: JSX.Element[] = []
      const personElements = containerRef.current.querySelectorAll("[data-person-id]")
      const personMap = new Map<string, HTMLElement>()

      personElements.forEach((el) => {
        const id = el.getAttribute("data-person-id")
        if (id) {
          personMap.set(id, el as HTMLElement)
        }
      })

      const drawLinesForPerson = (person: Person) => {
        if (!person.children || person.children.length === 0 || !expandedNodes.has(person.id)) {
          return
        }

        const parentEl = personMap.get(person.id)
        if (!parentEl) return

        const parentRect = parentEl.getBoundingClientRect()
        const containerRect = containerRef.current!.getBoundingClientRect()

        const parentX = parentRect.left + parentRect.width / 2 - containerRect.left
        const parentY = parentRect.bottom - containerRect.top

        // Draw lines to each child
        for (const child of person.children) {
          const childEl = personMap.get(child.id)
          if (!childEl) continue

          const childRect = childEl.getBoundingClientRect()
          const childX = childRect.left + childRect.width / 2 - containerRect.left
          const childY = childRect.top - containerRect.top

          // Calculate control points for the curve
          const distance = Math.abs(childX - parentX)
          const midY = parentY + (childY - parentY) * 0.5

          // Create a curved path from parent to child
          const path = `M ${parentX},${parentY} C ${parentX},${midY} ${childX},${midY} ${childX},${childY}`

          newLines.push(
            <path
              key={`${person.id}-${child.id}`}
              d={path}
              stroke="url(#lineGradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="0"
              className="transition-all duration-300"
            />,
          )
        }

        // Recursively draw lines for children
        for (const child of person.children) {
          if (expandedNodes.has(child.id)) {
            drawLinesForPerson(child)
          }
        }
      }

      // Start drawing from root nodes
      for (const person of familyTree) {
        drawLinesForPerson(person)
      }

      setLines(newLines)
    }

    // Draw lines after a short delay to ensure DOM is updated
    const timer = setTimeout(drawLines, 100)

    // Also add a resize observer to redraw lines when window size changes
    const resizeObserver = new ResizeObserver(() => {
      drawLines()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
    }
  }, [familyTree, expandedNodes, forceUpdate, lastExpandedNode, scale])

  const renderPerson = (person: Person, level = 0) => {
    const isExpanded = expandedNodes.has(person.id)
    const hasChildren = person.children && person.children.length > 0
    const isLastExpanded = lastExpandedNode === person.id
    const isChildOfLast = isChildOfLastExpanded(person.id)

    return (
      <motion.div
        key={person.id}
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-10 sm:mb-12" data-person-id={person.id}>
          <PersonCard
            person={person}
            isExpanded={isExpanded}
            onToggleExpand={() => toggleExpand(person.id)}
            onInfoClick={() => {}}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            isHighlighted={isLastExpanded}
            isChildHighlighted={isChildOfLast}
          />
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-row items-start gap-4 sm:gap-8 md:gap-12">
            {person.children.map((child) => renderPerson(child, level + 1))}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <>
      <div className="fixed top-16 sm:top-20 left-3 sm:left-6 bg-white dark:bg-slate-800 rounded-full shadow-lg px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 text-base sm:text-lg font-bold z-10 print:hidden">
        <Users size={16} className="sm:w-5 sm:h-5 text-emerald-500 dark:text-emerald-400" />
        <span className="text-slate-700 dark:text-slate-200 text-sm sm:text-base">
          عدد أفراد العائلة: <span className="text-emerald-500 dark:text-emerald-400">{familyCount}</span>
        </span>
      </div>

      {/* إضافة حاوية خارجية مع إمكانية التمرير الأفقي */}
      <div className="w-full overflow-x-auto overflow-y-visible pb-8" style={{ minHeight: "calc(100vh - 100px)" }}>
        <div
          className="flex flex-col items-center py-8 relative transition-transform min-w-max"
          ref={containerRef}
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        >
          <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: -1, pointerEvents: "none" }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
            </defs>
            {lines}
          </svg>

          {familyTree.map((person) => renderPerson(person, 0))}
        </div>
      </div>
    </>
  )
}
