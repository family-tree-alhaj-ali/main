import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Person } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Update the calculateAge function to handle deceased persons correctly
export function calculateAge(birthYear: number, deathYear?: number): number {
  const endYear = deathYear || new Date().getFullYear()
  return endYear - birthYear
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function countFamilyMembers(familyTree: Person[]): number {
  let count = familyTree.length

  for (const person of familyTree) {
    if (person.children && person.children.length > 0) {
      count += countFamilyMembers(person.children)
    }
  }

  return count
}

export function findPersonById(familyTree: Person[], id: string): Person | null {
  for (const person of familyTree) {
    if (person.id === id) {
      return person
    }

    if (person.children && person.children.length > 0) {
      const found = findPersonById(person.children, id)
      if (found) {
        return found
      }
    }
  }

  return null
}

export function findParentById(familyTree: Person[], childId: string): Person | null {
  for (const person of familyTree) {
    if (person.children && person.children.some((child) => child.id === childId)) {
      return person
    }

    if (person.children && person.children.length > 0) {
      const found = findParentById(person.children, childId)
      if (found) {
        return found
      }
    }
  }

  return null
}

export function deletePerson(familyTree: Person[], id: string): Person[] {
  return familyTree.filter((person) => {
    if (person.id === id) {
      return false
    }

    if (person.children && person.children.length > 0) {
      person.children = deletePerson(person.children, id)
    }

    return true
  })
}

export function updatePerson(familyTree: Person[], updatedPerson: Person): Person[] {
  return familyTree.map((person) => {
    if (person.id === updatedPerson.id) {
      return { ...updatedPerson, children: person.children }
    }

    if (person.children && person.children.length > 0) {
      return { ...person, children: updatePerson(person.children, updatedPerson) }
    }

    return person
  })
}

export function addChildToPerson(familyTree: Person[], parentId: string, child: Person): Person[] {
  return familyTree.map((person) => {
    if (person.id === parentId) {
      const children = person.children || []
      return { ...person, children: [...children, child] }
    }

    if (person.children && person.children.length > 0) {
      return { ...person, children: addChildToPerson(person.children, parentId, child) }
    }

    return person
  })
}

export function buildFamilyTree(people: Person[]): Person[] {
  const map: { [id: string]: Person & { children: Person[] } } = {};
  const roots: Person[] = [];

  people.forEach((person) => {
    map[person.id] = { ...person, children: [] };
  });

  people.forEach((person) => {
    if (person.parentId && map[person.parentId]) {
      map[person.parentId].children.push(map[person.id]);
    } else {
      roots.push(map[person.id]);
    }
  });

  return roots;
}
