import type { Person } from "./types"
import { generateId } from "./utils"

export const sampleFamilyTree: Person[] = [
  {
    id: generateId(),
    name: "الجد الأكبر",
    birthYear: 1900,
    deathYear: 1980,
    gender: "male",
    maritalStatus: "married",
    spouseName: "زينب",
    children: [
      {
        id: generateId(),
        name: "أحمد",
        birthYear: 1930,
        deathYear: 2010,
        gender: "male",
        maritalStatus: "married",
        spouseName: "فاطمة",
        children: [
          {
            id: generateId(),
            name: "محمد",
            birthYear: 1960,
            gender: "male",
            maritalStatus: "married",
            spouseName: "عائشة",
            children: [],
          },
          {
            id: generateId(),
            name: "خالد",
            birthYear: 1965,
            gender: "male",
            maritalStatus: "married",
            spouseName: "منى",
            children: [],
          },
        ],
      },
      {
        id: generateId(),
        name: "علي",
        birthYear: 1935,
        gender: "male",
        maritalStatus: "married",
        spouseName: "زينب",
        children: [],
      },
      {
        id: generateId(),
        name: "فاطمة",
        birthYear: 1940,
        deathYear: 2015,
        gender: "female",
        maritalStatus: "married",
        childrenCount: 3,
      },
    ],
  },
]
