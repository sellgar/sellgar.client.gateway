import { PropertyOptionEntity } from './property-option-entity';
import { UnitEntity } from './unit-entity';
export interface PropertyEntity {
  code: string;
  name: string;
  kind: 'TEXT' | 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'DATE' | 'OPTIONS';
  description: string | null;
  unitCode: string | null;
  unit: UnitEntity | null;
  options: PropertyOptionEntity[];
}
