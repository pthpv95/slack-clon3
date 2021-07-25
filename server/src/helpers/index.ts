const asyncForEach = async<T>(array: Array<T>, cb: Function) => {
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    await cb(element)
  }
}

export {
  asyncForEach
}