import { buildAllezPart } from '@/app/voyage/SetDestination'
import { clickableClasses } from '@/app/voyage/clickableLayers'
import {
	createPolygon,
	createSearchBBox,
} from '@/app/voyage/createSearchPolygon'
import { disambiguateWayRelation } from '@/app/voyage/osmRequest'
import { encodePlace } from '@/app/voyage/utils'
import { replaceArrayIndex } from '@/components/utils/utils'
import { useEffect } from 'react'

export default function useMapClick(
	map,
	state,
	distanceMode,
	itinerary,
	isTransportsMode,
	setLatLngClicked,
	setState,
	gares,
	clickGare,
	setSearchParams
) {
	// This hook lets the user click on the map to find OSM entities
	// It also draws a polygon to show the search area for pictures
	// (not obvious for the user though)
	useEffect(() => {
		if (isTransportsMode) return

		const onClick = async (e) => {
			console.log('click event', e)
			setLatLngClicked(e.lngLat)

			const source = map.getSource('searchPolygon')
			const polygon = createPolygon(createSearchBBox(e.lngLat))

			if (source) {
				source.setData(polygon.data)
				map && map.setPaintProperty('searchPolygon', 'fill-opacity', 0.6)
			} else {
				map.addSource('searchPolygon', polygon)

				map.addLayer({
					id: 'searchPolygon',
					type: 'fill',
					source: 'searchPolygon',
					layout: {},
					paint: {
						'fill-color': '#57bff5',
						'fill-opacity': 0.6,
					},
				})
			}
			setTimeout(() => {
				map && map.setPaintProperty('searchPolygon', 'fill-opacity', 0)
			}, 1000)

			const allowedLayerProps = ({ properties: { class: c }, sourceLayer }) =>
				sourceLayer === 'poi' ||
				(['place', 'waterway'].includes(sourceLayer) &&
					clickableClasses.includes(c)) // Why ? because e.g. "state" does not map to an existing OSM id in France at least, see https://github.com/openmaptiles/openmaptiles/issues/792#issuecomment-1850139297
			// TODO when "state" place, make an overpass request with name, since OMT's doc explicitely says that name comes from OSM

			// Thanks OSMAPP https://github.com/openmaptiles/openmaptiles/issues/792
			const rawFeatures = map.queryRenderedFeatures(e.point),
				features = rawFeatures.filter(
					(f) => f.source === 'maptiler_planet' && allowedLayerProps(f)
				)

			console.log('clicked map features', rawFeatures)

			if (!features.length || !features[0].id) {
				console.log('no features', features)
				return setSearchParams({ allez: undefined })
			}

			const feature = features[0]
			const openMapTilesId = '' + feature.id

			// For "Vitré", a town, I'm getting id 18426612010. Looks like internal
			// OMT id, that's wrong, we need OSM
			const id = ['place', 'waterway'].includes(feature.sourceLayer)
					? openMapTilesId
					: openMapTilesId.slice(null, -1),
				featureType =
					feature.sourceLayer === 'waterway'
						? 'way' // bold assumption here
						: feature.sourceLayer === 'place'
						? 'node'
						: { '1': 'way', '0': 'node', '4': 'relation' }[ //this is broken. We're getting the "4" suffix for relations AND ways. See https://github.com/openmaptiles/openmaptiles/issues/1587. See below for hack
								openMapTilesId.slice(-1)
						  ]
			if (!featureType) {
				console.log('Unknown OSM feature type from OpenMapTiles ID')
				return
			}

			const [element, realFeatureType] = await disambiguateWayRelation(
				featureType,
				id,
				e.lngLat
			)

			if (element) {
				console.log('reset OSMfeature after click on POI')
				const { lng: longitude, lat: latitude } = e.lngLat
				replaceArrayIndex(
					state,
					-1,
					{
						osmFeature: {
							...element,
							longitude,
							latitude,
						},
					},
					'merge'
				)

				// We store longitude and latitude in order to, in some cases, avoid a
				// subsequent fetch request on link share
				setSearchParams({
					allez: buildAllezPart(
						element.tags?.name || 'sans nom',
						encodePlace(realFeatureType, id),
						longitude,
						latitude
					),
				})
				console.log('sill set OSMFeature', element)
				// wait for the searchParam update to proceed
			}
		}

		if (!map || distanceMode || itinerary.isItineraryMode) return

		map.on('click', onClick)
		return () => {
			if (!map) return
			map.off('click', onClick)
		}
	}, [
		map,
		setState,
		distanceMode,
		itinerary.isItineraryMode,
		gares,
		clickGare,
		isTransportsMode,
		setSearchParams,
		setLatLngClicked,
	])
}