import { lightenColor } from '@/components/utils/colors'

const datePlusHours = (date, hours) => {
	const today = new Date(date)
	const newToday = today.setHours(today.getHours() + hours)
	return Math.round(newToday / 1000)
}

export const nowStamp = () => Math.round(Date.now() / 1000)

export const stamp = (date) => Math.round(new Date(date).getTime() / 1000)

export const buildRequestBody = (start, destination, date) => {
	const begin = Math.round(new Date(date).getTime() / 1000),
		end = datePlusHours(date, 2) // TODO This parameter should probably be modulated depending on the transit offer in the simulation setup. Or, query for the whole day at once, and filter them in the UI

	console.log('lac', date, begin, end)
	console.log('dato', nowStamp(), 'begin date then timestamp', date, begin, end)
	const body = {
		destination: { type: 'Module', target: '/intermodal' },
		content_type: 'IntermodalRoutingRequest',
		content: {
			start_type: 'IntermodalPretripStart',
			start: {
				position: start,
				interval: {
					begin,
					end,
				},
				min_connection_count: 5,
				extend_interval_earlier: true,
				extend_interval_later: true,
			},
			start_modes: [
				{
					mode_type: 'FootPPR',
					mode: {
						search_options: { profile: 'default', duration_limit: 1800 },
					},
				},
			],
			destination_type: 'InputPosition',
			destination,
			destination_modes: [
				{
					mode_type: 'FootPPR',
					mode: { search_options: { profile: 'default', duration_limit: 900 } },
				},
			],
			search_type: 'Accessibility',
			search_dir: 'Forward',
			router: '',
		},
	}
	return body
}

export const computeMotisTrip = async (start, destination, date) => {
	const body = buildRequestBody(start, destination, date)

	try {
		const request = await fetch(`https://motis.cartes.app`, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		})
		if (!request.ok) {
			console.error('Error fetching motis server')
			return { state: 'error' }
		}
		const json = await request.json()
		console.log('motis', json)

		const augmentedConnections = await Promise.all(
			json.content.connections.map(async (connection) => {
				const { trips, stops, transports } = connection
				const augmentedTransports = await Promise.all(
					transports.map(async (transport) => {
						const trip = trips.find(
							(trip) => trip.id.line_id === transport.move.line_id
						)

						const tripId = trip?.id.id.split('_').slice(1).join('_') // `bretagne_` prefix added by Motis it seems, coming from its config.ini file that names schedules with ids
						const doFetch = async () => {
							try {
								if (!tripId) return {}
								const request = await fetch(
									`https://motis.cartes.app/gtfs/routes/trip/${tripId}`
								)
								const json = await request.json()
								const safeAttributes = json.routes[0] || {}
								return safeAttributes
							} catch (e) {
								console.error('Unable to fetch route color from GTFS server')
								return {}
							}
						}
						const gtfsAttributes = await doFetch()
						const { route_color, route_text_color } = gtfsAttributes

						const isBretagneTGV = trip?.id.id.startsWith('bretagne_SNCF2')

						const isOUIGO =
							trip?.id.station_id.includes('OUIGO') ||
							trip?.id.target_station_id.includes('OUIGO') // well, on fait avec ce qu'on a
						const isTGVStop =
							trip?.id.station_id.includes('TGV INOUI') ||
							trip?.id.target_station_id.includes('TGV INOUI') // well, on fait avec ce qu'on a
						const isTGV = isTGVStop || isBretagneTGV
						//TODO this should be a configuration file that sets not only main
						//colors, but gradients, icons (ouigo, inoui, tgv, ter, etc.)
						const transportType = trip?.id.id.split('_')[0],
							frenchTrainType = isOUIGO
								? 'OUIGO'
								: isTGV
								? 'TGV'
								: transportType && { tgv: 'TGV', ter: 'TER' }[transportType]

						const customAttributes = {
							route_color: isTGV
								? colors.TGV
								: isOUIGO
								? colors.OUIGO
								: frenchTrainType === 'TER'
								? colors.TER
								: handleColor(route_color, '#d3b2ee'),
							route_text_color: isTGV
								? '#fff'
								: isOUIGO
								? '#fff'
								: handleColor(route_text_color, '#000000'),
						}
						const attributes = {
							...gtfsAttributes,
							...customAttributes,
						}

						/* Temporal aspect */
						const fromStop = stops[transport.move.range.from]
						const toStop = stops[transport.move.range.to]

						const seconds = toStop.arrival.time - fromStop.departure.time
						const name = transport.move.name
						const shortName =
							frenchTrainType ||
							(name?.startsWith('Bus ') ? name.replace('Bus ', '') : name)
						return {
							...transport,
							...attributes,

							route_color_darker: attributes.route_color
								? lightenColor(attributes.route_color, -20)
								: '#5b099f',
							trip,
							tripId,
							frenchTrainType,
							seconds,
							shortName,
						}
					})
				)
				const seconds = augmentedTransports.reduce(
					(memo, next) => memo + next.seconds,
					0
				)

				return { ...connection, transports: augmentedTransports, seconds }
			})
		)
		const augmentedResponse = {
			...json,
			content: {
				...json.content,
				connections: augmentedConnections,
			},
		}
		return augmentedResponse
	} catch (e) {
		// Can happen when no transit found, the server returns a timeout
		// e.g. for Rennes -> Port Navalo on a sunday...
		// Erratum : there was a problem on the server. Anyway, this error state is
		// useful
		console.error('Error fetching motis server', e)
		return { state: 'error' }
	}
}

export const colors = {
	TGV: '#b8175e',
	OUIGO: '#0193c9',
	TER: '#034EA2',
}
export function handleColor(rawColor, defaultColor) {
	if (!rawColor) return defaultColor
	if (rawColor.startsWith('#')) return rawColor
	if (rawColor.match(/^([0-9A-Fa-f])+$/) && rawColor.length === 6)
		return '#' + rawColor
	console.log('Unrecognized route color', rawColor)
	return defaultColor
}
