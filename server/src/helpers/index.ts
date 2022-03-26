let ObjectID = require('mongodb').ObjectID
import { InvalidIdError } from '../errors/invalid-id-error';

const asyncForEach = async<T>(array: Array<T>, cb: Function) => {
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    await cb(element)
  }
}

const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 10)
}

const validateMongoId = (id: string) => {
  if (!ObjectID.isValid(id)) {
    throw new InvalidIdError('Invalid mongo ID');
  }
}

export {
  asyncForEach,
  generateUniqueId,
  validateMongoId
}