"use client"

import { useState, useEffect, useRef } from "react"
import type { Person } from "@/lib/types"
import PersonCard from "./person-card"
import { countFamilyMembers } from "@/lib/utils"
import { Users } from "lucide-react"

interface FamilyTreeProps {
  familyTree: Person[]
  isAdmin?: boolean
  onEdit?: (person: Person) => void
  onDelete?: (person: Person) => void
}

export default function FamilyTree({ familyTree, isAdmin = false, onEdit, onDelete }: FamilyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [familyCount, setFamilyCount] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    setFamilyCount(countFamilyMembers(familyTree))
  }, [familyTree])

  const toggleExpand = (id: string) => {
    const newExpandedNodes = new Set(expandedNodes)
    if (newExpandedNodes.has(id)) {
      newExpandedNodes.delete(id)
    } else {
      newExpandedNodes.add(id)
    }
    setExpandedNodes(newExpandedNodes)
  }

  const renderConnectingLines = (person: Person, personElements: Map<string, HTMLElement>) => {
    if (!person.children || person.children.length === 0 || !expandedNodes.has(person.id)) {
      return null
    }

    const parentElement = personElements.get(person.id)
    if (!parentElement) return null

    const parentRect = parentElement.getBoundingClientRect()
    const svgRect = svgRef.current?.getBoundingClientRect()

    if (!svgRect) return null

    const lines = []
    const parentX = parentRect.left + parentRect.width / 2 - svgRect.left
    const parentY = parentRect.bottom - svgRect.top

    for (const child of person.children) {
      const childElement = personElements.get(child.id)
      if (!childElement) continue

      const childRect = childElement.getBoundingClientRect()
      const childX = childRect.left + childRect.width / 2 - svgRect.left
      const childY = childRect.top - svgRect.top

      // Calculate control points for the curve
      const midY = parentY + (childY - parentY) / 2

      // Create a curved path from parent to child
      const path = `M ${parentX},${parentY} C ${parentX},${midY} ${childX},${midY} ${childX},${childY}`

      lines.push(<path key={`${person.id}-${child.id}`} d={path} stroke="#ccc" strokeWidth="1" fill="none" />)
    }

    return lines
  }

  const renderPerson = (person: Person, level = 0, personElements: Map<string, HTMLElement>) => {
    const isExpanded = expandedNodes.has(person.id)
    const hasChildren = person.children && person.children.length > 0

    return (
      <div key={person.id} className="flex flex-col items-center">
        <div
          className="mb-10 sm:mb-12"
          ref={(el) => {
            if (el) personElements.set(person.id, el)
          }}
        >
          <PersonCard
            person={person}
            isExpanded={isExpanded}
            onToggleExpand={() => toggleExpand(person.id)}
            onInfoClick={() => {}}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-row items-start gap-4 sm:gap-8 md:gap-12">
            {person.children.map((child) => renderPerson(child, level + 1, personElements))}
          </div>
        )}
      </div>
    )
  }

  const personElements = new Map<string, HTMLElement>()

  return (
    <div className="w-full flex flex-col items-center py-8 relative">
      <div className="family-counter">
        <Users size={20} />
        <span>عدد أفراد العائلة: {familyCount}</span>
      </div>

      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full" style={{ zIndex: -1, pointerEvents: "none" }}>
        {familyTree.map((person) => renderConnectingLines(person, personElements))}
      </svg>

      {familyTree.map((person) => renderPerson(person, 0, personElements))}
    </div>
  )
}
