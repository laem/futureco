import { useEffect } from 'react'
import { handleColor } from '../itinerary/motisRequest'
import { findContrastedTextColor } from '@/components/utils/colors'

export default function useDrawTransit(map, transit, selectedConnection) {
	const connection =
		transit?.connections && transit.connections[selectedConnection || 0]

	useEffect(() => {
		if (!map || !connection) return

		const { transports, stops } = connection

		console.log('yotr', transports)
		const featureCollection = {
			type: 'FeatureCollection',
			features: transports.reduce((memo, next) => {
				const route_text_color = handleColor(next.route_text_color, '#000000')
				return [
					...memo,
					{
						type: 'Feature',
						properties: {
							name: next.route_short_name,
							move_type: next.move_type,
							route_color: next.route_color || '#d3b2ee',
							route_color_darker: next.route_color_darker || '',
							route_text_color,
							inverse_color: findContrastedTextColor(route_text_color, true),
						},
						geometry: {
							type: 'LineString',
							coordinates: stops
								.slice(next.move.range.from, next.move.range.to + 1)
								.map((stop) => [stop.station.pos.lng, stop.station.pos.lat]),
						},
					},
				]
			}, []),
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

		map.addLayer({
			id: id + '-lines-symbols',
			type: 'symbol',
			source: id,
			layout: {
				'symbol-placement': 'line',
				'text-font': ['Open Sans Bold'],
				'text-field': '{name}', // part 2 of this is how to do it
				'text-transform': 'uppercase',
				'text-size': 16,
			},
			paint: {
				'text-color': ['get', 'route_text_color'],
				'text-halo-blur': 1,
				'text-halo-color': ['get', 'inverse_color'],
				'text-halo-width': 1,
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

		return () => {
			map.removeLayer(id + '-lines')
			map.removeLayer(id + '-lines-symbols')
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
