export function createEmitter (object) {
  const handlers = {}

  return Object.assign(object || {}, {
    on,
    off,
    emit,
  })

  function on (eventName, eventHandler) {
    (handlers[eventName] = handlers[eventName] || []).push(eventHandler)
  }

  function off (eventName, eventHandler) {
    const eventHandlers = handlers[eventName] || []
    const index = eventHandlers.indexOf(eventHandler)
    if (index !== -1) {
      eventHandlers.splice(index, 1)
    }
  }

  function emit (eventName, ...args) {
    (handlers[eventName] || []).forEach(eventHandler => eventHandler(...args))
  }
}