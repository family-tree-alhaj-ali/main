export interface Person {
  id: string
  name: string
  birthYear: number
  deathYear?: number
  gender: "male" | "female"
  maritalStatus: "single" | "married"
  spouseName?: string
  childrenCount?: number
  parentId?: string
  children?: Person[]
}

export interface FormData {
  name: string
  birthYear: number
  deathYear?: number
  gender: "male" | "female"
  maritalStatus: "single" | "married"
  spouseName?: string
  childrenCount?: number
  parentId?: string
}
