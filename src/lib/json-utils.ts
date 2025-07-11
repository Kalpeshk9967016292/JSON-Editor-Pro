import type { JsonPath, JsonValue, JsonObject, JsonArray } from "@/hooks/use-json-editor";

export function getIn(data: JsonValue, path: JsonPath): JsonValue {
  let current: any = data;
  for (const key of path) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  return current;
}

export function setIn(data: JsonValue, path: JsonPath, value: JsonValue): any {
  if (path.length === 0) return value;
  
  let current: any = data;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (current[key] === undefined || current[key] === null) {
      // If next key is a number, create an array, otherwise an object
      current[key] = typeof path[i+1] === 'number' ? [] : {};
    }
    current = current[key];
  }
  current[path[path.length - 1]] = value;
  return data;
}

export function unsetIn(data: JsonValue, path: JsonPath): any {
  if (path.length === 0) return null;

  let current: any = data;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (current === null || current === undefined || current[key] === undefined) return data;
    current = current[key];
  }

  const finalKey = path[path.length - 1];
  if (Array.isArray(current)) {
    current.splice(finalKey as number, 1);
  } else if (typeof current === 'object' && current !== null) {
    delete current[finalKey];
  }
  return data;
}

export function insertIn(data: JsonValue, path: JsonPath, value: JsonValue, inArray: boolean, isDuplicate=false): any {
  if (inArray) {
    // Insert into an array
    const arrayPath = isDuplicate ? path.slice(0, -1) : path;
    const index = isDuplicate ? (path[path.length-1] as number) + 1 : (path[path.length-1] as number);

    let array = getIn(data, arrayPath) as JsonArray | undefined;
    if (array && Array.isArray(array)) {
      if(isDuplicate){
        array.splice(index, 0, value);
      } else {
        array.push(value);
      }
    } else { // Should be a top-level add to the root object, which is an array
      if(Array.isArray(data)){
        data.push(value);
      }
    }
  } else {
    // Insert into an object
    const objectPath = isDuplicate ? path.slice(0,-1) : path;
    const object = getIn(data, objectPath) as JsonObject | undefined;
    
    if (object && typeof object === 'object' && !Array.isArray(object)) {
      if(isDuplicate){
        const originalKey = path[path.length - 1];
        object[`${String(originalKey)}_copy`] = value;
      } else {
        const newKey = path[path.length - 1];
        object[newKey] = value;
      }
    }
  }

  return data;
}
