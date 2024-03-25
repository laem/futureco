const coordinates = (step) => step.longitude + step.latitude
export const geoSerializeSteps = (steps) =>
	steps.filter(Boolean).map(coordinates).join('->')
