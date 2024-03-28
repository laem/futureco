import useSetSearchParams from '@/components/useSetSearchParams'
import distance from '@turf/distance'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useDrawTransit from '../effects/useDrawTransit'
import { decodeDate, initialDate } from './DateSelector'
import { computeMotisTrip } from './motisRequest'
import useDrawRoute from './useDrawRoute'
import useFetchDrawBikeParkings from './useFetchDrawBikeParkings'
import { geoSerializeSteps } from './areStepsEqual'
import { buildAllezPart, removeStatePart } from '../SetDestination'
import { letterFromIndex } from './Steps'

export default function useItinerary(
	map,
	itineraryMode,
	bikeRouteProfile,
	searchParams,
	state
) {
	//TODO
	const [routes, setRoutes] = useState(null)
	const date = decodeDate(searchParams.date) || initialDate()
	const selectedConnection = searchParams.choix

	//const [motisTrips, setMotisTrips] = useState(null)
	//useMotisTrips(routes?.transit, selectedConnection, setMotisTrips)
	// not sure this is useful. On the routes I've tried, there is no precise
	// geojson shape for trains, buses (appart from straight lines from stop to
	// stop) nor walk

	useDrawTransit(map, routes?.transit, selectedConnection)
	useFetchDrawBikeParkings(map, routes?.cycling)

	const updateRoute = (key, value) =>
		setRoutes((routes) => ({ ...(routes || {}), [key]: value }))
	const setSearchParams = useSetSearchParams()

	/*
	 * {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [
      -1.6369411434976087,
      48.17932437715612
    ]
  },
  "properties": {
    "id": "1704742857502"
  }
}
	 */
	const serializedPoints = geoSerializeSteps(state)

	console.log('indigo geo', serializedPoints)
	const points = useMemo(() => {
		const points = state
			.map((step, index) => {
				if (step == null) return
				const { longitude, latitude, key } = step
				return {
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [+longitude, +latitude],
					},
					properties: { key, letter: letterFromIndex(index) },
				}
			})
			.filter(Boolean)
		return points
	}, [serializedPoints])

	const linestrings = useMemo(
		() =>
			points.length < 1
				? []
				: [
						{
							type: 'Feature',
							properties: {},

							geometry: {
								type: 'LineString',
								coordinates: points.map((point) => {
									return point.geometry.coordinates
								}),
							},
						},
				  ],
		[points]
	)

	console.log('linestrings', linestrings)
	const rawDistance = linestrings
		.map((el) => el.properties['track-length'] / 1000)
		.reduce((memo, next) => memo + next, 0)

	const geojson = useMemo(
		() => ({
			type: 'FeatureCollection',
			features: [...points, ...linestrings],
		}),
		[points, linestrings]
	)
	console.log('useDrawRoute from outside', map, geojson)
	useDrawRoute(itineraryMode, map, geojson, 'distance')
	useDrawRoute(
		itineraryMode,
		map,
		routes && routes.cycling !== 'loading' && routes.cycling,
		'cycling'
	)
	useDrawRoute(
		itineraryMode,
		map,
		routes && routes.walking !== 'loading' && routes.walking,
		'walking'
	)

	useEffect(() => {
		if (!map || !itineraryMode) return

		const onClick = (e) => {
			const features =
				points &&
				map.queryRenderedFeatures(e.point, {
					layers: ['distancePoints'],
				})

			// If a feature was clicked, remove it from the map
			if (features?.length) {
				const key = features[0].properties.key
				setSearchParams({ allez: removeStatePart(key, state) })
			} else {
				setSearchParams({
					allez:
						points.map((point) => point.properties.key + '->').join('') +
						buildAllezPart(
							'Point sur la carte',
							null,
							e.lngLat.lng,
							e.lngLat.lat
						),
				})
			}
		}
		const onMouseMove = (e) => {
			const features =
				points &&
				map.queryRenderedFeatures(e.point, {
					layers: ['routePoints'],
				})
			// UI indicator for clicking/hovering a point on the map
			map.getCanvas().style.cursor = features.length ? 'pointer' : 'crosshair'
		}

		/*
		if (!itineraryMode) {
			map.off('click', onClick)
			map.off('mousemove', onMouseMove)
			return
		}
		*/

		map.on('click', onClick)
		map.on('mousemove', onMouseMove)
		return () => {
			if (!map || !itineraryMode) return
			map.off('click', onClick)
			map.off('mousemove', onMouseMove)
			map.getCanvas().style.cursor = 'pointer'
		}
	}, [map, serializedPoints, setSearchParams, itineraryMode])

	/* Routing requests are made here */
	useEffect(() => {
		if (points.length < 2) {
			setRoutes(null)
			return
		}

		async function fetchBrouterRoute(
			points,
			itineraryDistance,
			profile,
			maxDistance
		) {
			if (itineraryDistance > maxDistance) return null

			const lonLats = points
				.map(
					({
						geometry: {
							coordinates: [lon, lat],
						},
					}) => `${lon},${lat}`
				)
				.join('|')
			const url = `https://brouter.osc-fr1.scalingo.io/brouter?lonlats=${lonLats}&profile=${profile}&alternativeidx=0&format=geojson`
			const res = await fetch(url)
			const json = await res.json()
			console.log('Brouter route json', json)
			if (!json.features) return
			return json
		}

		//TODO fails is 3rd point is closer to 1st than 2nd, use reduce that sums
		const itineraryDistance = distance(points[0], points.slice(-1)[0])

		const fetchRoutes = async () => {
			updateRoute('cycling', 'loading')
			const cycling = await fetchBrouterRoute(
				points,
				itineraryDistance,
				bikeRouteProfile,
				35 // ~ 25 km/h (ebike) x 1:30 hours
			)
			updateRoute('cycling', cycling)

			updateRoute('walking', 'loading')
			const walking = await fetchBrouterRoute(
				points,
				itineraryDistance,
				'hiking-mountain',
				2 // ~ 3 km/h donc 2 km = 40 minutes, au-dessus ça me semble peu pertinent de proposer la marche par défaut
			)
			updateRoute('walking', walking)
		}
		fetchRoutes()
	}, [points, setRoutes, bikeRouteProfile])

	useEffect(() => {
		if (points.length < 2) {
			setRoutes(null)
			return
		}

		async function fetchTrainRoute(multiplePoints, itineraryDistance, date) {
			const minTransitDistance = 0.5 // please walk or bike
			if (itineraryDistance < minTransitDistance) return null
			const points =
				multiplePoints.length > 2
					? [multiplePoints[0], multiplePoints.slice(-1)[0]]
					: multiplePoints
			const lonLats = points.map(
				({
					geometry: {
						coordinates: [lng, lat],
					},
				}) => ({ lat, lng })
			)

			const json = await computeMotisTrip(lonLats[0], lonLats[1], date)

			if (json.state === 'error') return json

			if (!json?.content) return null
			/*
			return sections.map((el) => ({
				type: 'Feature',
				properties: el.geojson.properties[0],
				geometry: { coordinates: el.geojson.coordinates, type: 'LineString' },
			}))
			*/
			return json.content
		}
		//TODO fails is 3rd point is closer to 1st than 2nd, use reduce that sums
		const itineraryDistance = distance(points[0], points.slice(-1)[0])

		updateRoute('transit', { state: 'loading' })
		fetchTrainRoute(points, itineraryDistance, date).then((transit) =>
			setRoutes((routes) => ({ ...routes, transit }))
		)
	}, [points, setRoutes, date])

	// GeoJSON object to hold our measurement features

	useEffect(() => {
		if (!map || itineraryMode || map.getSource) return
		const source = map.getSource('measure-points')
		if (!source) return

		map.removeLayer('measure-lines')
		map.removeLayer('measure-points')
		map.removeSource('measure-points')
	}, [itineraryMode, map, serializedPoints])

	/* Not sure it's useful to display the distance in this multimodal new mode
	const computedDistance = isNaN(rawDistance)
		? '...'
		: rawDistance < 1
		? Math.round(rawDistance * 1000) + ' m'
		: rawDistance < 10
		? Math.round(rawDistance * 10) / 10 + ' km'
		: Math.round(rawDistance) + ' km'

*/
	const resetItinerary = () => setSearchParams({ allez: undefined })
	return [resetItinerary, routes, date]
}
