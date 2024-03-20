import useSetSearchParams from '@/components/useSetSearchParams'
import { keys } from '@/components/utils/utils'
import { featureCollection } from '@turf/turf'
import { useEffect } from 'react'

/***
 * This hook draws transit lines on the map.
 */
export default function useDrawTransport(
	map,
	entries: Array<string, object>,
	styleKey,
	sourcePrefix
) {
	const setSearchParams = useSetSearchParams()

	useEffect(() => {
		if (!map || !entries) return

		const sources = Object.entries(map.getStyle().sources).filter(
			([sourceId]) => sourceId.startsWith(sourcePrefix)
		)

		const sourcesToRemove = sources.filter(([sourceId]) => {
			const found = entries.find(([id]) => sourceId === sourcePrefix + id)

			return !found
		})
		sourcesToRemove.forEach(([id]) => {
			// TODO we could also just remove the layer but not the source. It's a
			// tradeoff, since I guess keeping a source holds memory for an incertain
			// future, but spares GPU time
			map.removeLayer(id + '-lines')
			map.removeLayer(id + '-points')
			map.removeSource(id)
		})

		console.log('indigo entries ', keys(entries))
		console.log('indigo map sources', keys(sources))
		console.log('indigo to remove', keys(sourcesToRemove))

		entries.map(([drawKey, featureCollection]) => {
			const id = sourcePrefix + drawKey
			try {
				const source = map.getSource(id)
				if (source) return
				console.log('indigo will add source', id)
				map.addSource(id, { type: 'geojson', data: featureCollection })

				const linesId = id + '-lines'

				map.addLayer({
					source: id,
					type: 'line',
					id: linesId,
					filter: [
						'all',
						['in', '$type', 'LineString'],
						['has', 'route_color'],
					],
					layout: {
						'line-join': 'round',
						'line-cap': 'round',
					},
					paint: {
						// In Rennes, one crazy bus network is the football stadium route, code E4
						// Since the agency did not give it colors, it's hard to draw it on a map
						// Moreover, it should be handled as an exceptional bus, not a regular one
						// This is easy to check through the data, see that it runs only on selected
						// days / hours and display it to the user TODO
						'line-color': ['get', 'route_color'],
						'line-opacity': ['get', 'opacity'],
						'line-width': [
							'let',
							'importance',
							[
								'match',
								['get', 'route_type'],
								0,
								1.6,
								1,
								2.6,
								2,
								3,
								3,
								0.8,
								0.8,
							],
							[
								'interpolate',
								['linear', 1],
								['zoom'],
								3,
								['*', ['var', 'importance'], 0.2],
								12,
								['*', ['var', 'importance'], 2.5],
								18,
								['*', ['var', 'importance'], 4],
							],
						],
					},
				})
				const pointsId = id + '-points'
				map.addLayer({
					source: id,
					type: 'circle',
					id: pointsId,
					filter: ['in', '$type', 'Point'],
					paint: {
						'circle-radius': [
							'interpolate',
							['linear', 1],
							['zoom'],
							0,
							['*', 10, ['get', 'width']],
							12,
							['*', 20, ['get', 'width']],
							18,
							['*', 50, ['get', 'width']],
						],
						'circle-stroke-width': [
							'interpolate',
							['linear', 1],
							['zoom'],
							0,
							['*', 2, ['get', 'width']],
							12,
							['*', 5, ['get', 'width']],
							18,
							['*', 10, ['get', 'width']],
						],
						'circle-stroke-color': ['get', 'circle-stroke-color'],

						'circle-pitch-alignment': 'map',
						'circle-color': ['get', 'circle-color'],
					},
				})

				map.on('click', linesId, (e) => {
					setSearchParams({
						routes: e.features
							.map((feature) => feature.properties.routeId)
							.join('|'),
					})
				})
				map.on('click', pointsId, (e) => {
					console.log('click', e)
					const feature = e.features[0],
						stopId = feature.properties.stopId,
						gare = stopId.split('-').slice(-1)[0]

					setSearchParams({
						gare,
					})
				})

				map.on('mouseenter', linesId, () => {
					map.getCanvas().style.cursor = 'pointer'
				})
				// Change it back to a pointer when it leaves.
				map.on('mouseleave', linesId, () => {
					map.getCanvas().style.cursor = 'auto'
				})
			} catch (e) {
				console.log('Caught error drawing useDrawTransport', e)
			}
		})

		return () => {
			return // this would delete then re-render on each agency list change
			entries.map(([id]) => {
				try {
					map.removeLayer(id + '-lines')
					map.removeLayer(id + '-points')
					const source = map.getSource(id)
					if (source) {
						map.removeSource(id)
					}
				} catch (e) {
					console.log('Caught error undrawing useDrawTransport', e)
				}
			})
		}
	}, [map, entries, styleKey, setSearchParams])
}
function mergeRoutes(geojson) {
	// TODO I can't yet understand why so many geojsons for one route, and how to
	// draw them correctly.
	// Iterating on client for now, then will be cached on the server
	const { features: rawFeatures } = geojson

	const reduced = rawFeatures.reduce((memo, next) => {
		const id = next.properties.route_id
		const already = memo[id]
		return { ...memo, [id]: [...(already || []), next] }
	}, {})

	const features = Object.entries(reduced)
		.map(
			([id, list]) =>
				Array.isArray(list) && {
					...list[0],
					geometry: {
						type: 'LineString',
						coordinates: list
							.slice(0, 1)
							.map((el) => el.geometry.coordinates)
							.flat(),
					},
				}
		)
		.filter(Boolean)

	return { ...geojson, features }
}
