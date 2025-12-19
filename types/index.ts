export interface CarSpecs {
  engine: string
  power: string
  transmission: string
  seats: number
}

export interface CarModel {
  id: string
  name: string
  tagline: string
  price: string
  image: string
  category: string
  specs: CarSpecs
}

export interface NavLink {
  label: string
  href: string
}

