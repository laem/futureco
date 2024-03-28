const coordinates = (step) => (step ? step.longitude + step.latitude : '?')
export const geoSerializeSteps = (steps) => steps.map(coordinates).join('->')
