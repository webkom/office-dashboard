export const IsEmpty = (obj: object): obj is Record<string, never> =>
  Object.keys(obj).length === 0;
