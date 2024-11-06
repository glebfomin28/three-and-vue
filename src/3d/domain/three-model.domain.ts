export interface IModelPart {
  id: number;
  name: string;
  geometry: {
    type: string;
    width: number;
    height: number;
    depth: number;
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  color: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}
