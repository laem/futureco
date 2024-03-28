import { useEffect } from 'react'
import getBbox from '@turf/bbox'
import { useMediaQuery } from 'usehooks-ts'

export default function useDrawTransit(map, transit, selectedConnection) {
	const connection =
		transit?.connections && transit.connections[selectedConnection || 0]

	const isMobile = useMediaQuery('(max-width: 800px)')
	useEffect(() => {
		if (!map || !connection) return

		const { transports, stops } = connection

		console.log('yotr', transports)
		const featureCollection = {
			type: 'FeatureCollection',
			features: transports.reduce(
				(memo, next) => [
					...memo,
					{
						type: 'Feature',
						properties: {
							move_type: next.move_type,
							route_color: next.route_color || '#d3b2ee',
							route_color_darker: next.route_color_darker || '',
							route_text_color: next.route_text_color,
						},
						geometry: {
							type: 'LineString',
							coordinates: stops
								.slice(next.move.range.from, next.move.range.to + 1)
								.map((stop) => [stop.station.pos.lng, stop.station.pos.lat]),
						},
					},
				],
				[]
			),
		}
		console.log(featureCollection)
		const id = 'transit-' + Math.random()

		const source = map.getSource(id)
		if (source) return
		console.log('will (re)draw transport route geojson')
		map.addSource(id, { type: 'geojson', data: featureCollection })

		map.addLayer({
			source: id,
			type: 'line',
			id: id + '-lines-contour',
			filter: ['==', ['get', 'move_type'], 'Transport'],
			layout: {
				'line-join': 'round',
				'line-cap': 'round',
			},
			paint: {
				'line-color': ['get', 'route_color_darker'],
				'line-width': [
					'interpolate',
					['linear', 1],
					['zoom'],
					3,
					0.4,
					12,
					7,
					18,
					18,
				],
			},
		})
		map.addLayer({
			source: id,
			type: 'line',
			id: id + '-lines',
			filter: ['==', ['get', 'move_type'], 'Transport'],

			layout: {
				'line-join': 'round',
				'line-cap': 'round',
			},
			paint: {
				'line-color': ['get', 'route_color'],
				'line-width': [
					'interpolate',
					['linear', 1],
					['zoom'],
					3,
					0.3,
					12,
					4,
					18,
					12,
				],
			},
		})
		map.addLayer(
			{
				source: id,
				type: 'line',
				id: id + '-lines-walking',
				filter: ['==', ['get', 'move_type'], 'Walk'],
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
				},
				paint: {
					'line-color': '#8f53c1',
					'line-width': 4,
					'line-dasharray': [1, 2],
				},
			},
			'distancePoints'
		)
		map.addLayer({
			source: id,
			type: 'circle',
			id: id + '-points',
			filter: ['in', '$type', 'Point'],
			paint: {
				'circle-radius': [
					'interpolate',
					['linear', 1],
					['zoom'],
					0,
					0.1,
					12,
					1,
					18,
					10,
				],
				'circle-color': 'white',
				'circle-pitch-alignment': 'map',
				'circle-stroke-color': ['get', 'route_color'],
				'circle-stroke-width': [
					'interpolate',
					['linear', 1],
					['zoom'],
					0,
					0.1,
					12,
					1,
					18,
					4,
				],
			},
		})
		const bbox = getBbox(featureCollection)

		console.log('blue will fit bounds')
		map.fitBounds(bbox, {
			//TODO make it right with mobile snap, this is very basic
			padding: isMobile
				? { top: 50, bottom: 400, left: 50, right: 50 }
				: { top: 100, bottom: 100, left: 600, right: 100 },
		})

		return () => {
			map.removeLayer(id + '-lines')
			map.removeLayer(id + '-lines-walking')
			map.removeLayer(id + '-lines-contour')
			map.removeLayer(id + '-points')
			const source = map.getSource(id)
			if (source) {
				map.removeSource(id)
			}
		}
	}, [map, connection])
}
