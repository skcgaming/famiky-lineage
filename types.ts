
export enum RelationType {
  SPOUSE = 'SPOUSE',
  PARENT = 'PARENT',
  CHILD = 'CHILD'
}

export interface Member {
  id: string;
  name: string; // Nepali Name
  address: string;
  phone: string;
  photoUri?: string;
  generationLevel: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface Relation {
  id: string;
  fromId: string;
  toId: string;
  type: RelationType;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface KinshipTerm {
  up: number;
  down: number;
  gender?: 'MALE' | 'FEMALE';
  term: string;
}
