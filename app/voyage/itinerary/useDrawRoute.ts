import { useEffect } from 'react'
import { letterFromIndex } from './Steps'
import { useMediaQuery } from 'usehooks-ts'
import getBbox from '@turf/bbox'

/*
 * Draws the walk or cycle route provided by BRouter directly as Geojson
 * */
export default function useDrawRoute(itineraryMode, map, geojson, id) {
	const isMobile = useMediaQuery('(max-width: 800px)')
	useEffect(() => {
		if (
			!itineraryMode ||
			!map ||
			!geojson ||
			!geojson.features ||
			!geojson.features.length
		)
			return undefined
		console.log('will draw useDrawRoute inside ' + id, id, geojson)

		map.addSource(id, {
			type: 'geojson',
			data: geojson,
		})

		if (map) console.log('getsource2', id, map.getSource(id))
		console.log('useDrawRoute did add source')

		map.addLayer({
			id: id + 'PointsSymbols',
			type: 'symbol',
			source: id,
			filter: ['in', '$type', 'Point'],
			paint: {
				'text-color': '#ffffff', //makes the whole drawing fail...
			},
			layout: {
				'text-field': ['get', 'letter'],
				//				'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
				'text-size': 16,
			},
		})
		map.addLayer(
			{
				id: id + 'Points',
				type: 'circle',
				source: id,
				paint: {
					'circle-radius': 12,
					'circle-color': '#2988e6',
					'circle-stroke-color': '#ffffff',
					'circle-stroke-width': 3,
				},
				filter: ['in', '$type', 'Point'],
			},
			id + 'PointsSymbols'
		)

		map.addLayer(
			{
				id: id + 'Line',
				type: 'line',
				source: id,
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
				},
				paint: {
					walking: {
						'line-color': '#8f53c1',
						'line-width': 4,
						'line-dasharray': [1, 2],
					},
					distance: {
						'line-width': 0,
					},
					cycling: {
						'line-color': '#57bff5',
						'line-width': 5,
					},
				}[id],
				filter: ['in', '$type', 'LineString'],
			},
			'distance' + 'Points'
		)
		map.addLayer(
			{
				id: id + 'Contour',
				type: 'line',
				source: id,
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
				},
				paint: {
					walking: {
						'line-color': '#5B099F',
						'line-width': 0, // I wasn't able to make a dasharray contour
					},
					distance: {
						'line-width': 2,
						'line-color': '#185abd60',
						'line-dasharray': [8, 8],
					},
					cycling: {
						'line-color': '#5B099F',
						'line-width': 8,
					},
				}[id],
				filter: ['in', '$type', 'LineString'],
			},
			'distance' + 'Line'
		)

		const bbox = getBbox(geojson)

		map.fitBounds(bbox, {
			//TODO make it right with mobile snap, this is very basic
			padding: isMobile
				? { top: 50, bottom: 400, left: 50, right: 50 }
				: { top: 100, bottom: 100, left: 600, right: 100 },
		})
		return () => {
			// There's something I don't understand in MapLibre's lifecycle...
			// "this.style is undefined" when redimensioning the browser window, need
			// to catch it
			// We're operating on a stale style / map
			try {
				console.log(
					'will remove useDrawRoute' + id,
					map._mapId,
					map.getLayer(id + 'Points')
				)

				map.removeLayer(id + 'Line')
				map.removeLayer(id + 'Contour')
				map.removeLayer(id + 'Points')
				map.removeLayer(id + 'PointsSymbols')
				map.removeSource(id)
			} catch (e) {
				console.log('Could not remove useDrawRoute layers or source', e)
			}
		}
	}, [itineraryMode, geojson, map, id])
}
