'use client'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPolygon, createSearchBBox } from './createSearchPolygon'
import { sortGares } from './gares'

import useSetSearchParams from '@/components/useSetSearchParams'
import { getCategory } from '@/components/voyage/categories'
import MapButtons from '@/components/voyage/MapButtons'
import { goodIconSize } from '@/components/voyage/mapUtils'
import useAddMap, { defaultZoom } from './effects/useAddMap'
import useDrawQuickSearchFeatures from './effects/useDrawQuickSearchFeatures'
import useImageSearch from './effects/useImageSearch'
import useItinerary from './itinerary/useItinerary'
import useItineraryFromUrl from './itinerary/useItineraryFromUrl'
import ModalSwitch from './ModalSwitch'
import { disambiguateWayRelation } from './osmRequest'
import { styles } from './styles/styles'
import { MapContainer, MapHeader } from './UI'
import useHoverOnMapFeatures from './useHoverOnMapFeatures'
import useTerrainControl from './useTerrainControl'
import { encodePlace } from './utils'
import { useZoneImages } from './ZoneImages'

import CenteredCross from './CenteredCross'
import { clickableClasses } from './clickableLayers'
import useDrawSearchResults from './effects/useDrawSearchResults'
import useDrawTransport from './effects/useDrawTransport'
import useOsmRequest from './effects/useOsmRequest'
import useRightClick from './effects/useRightClick'
import useSearchLocalTransit from './effects/useSearchLocalTransit'
import useSetTargetMarkerAndZoom from './effects/useSetTargetMarkerAndZoom'
import useTransportStopData from './transport/useTransportStopData'
import useDrawTransportsMap from './effects/useDrawTransportsMap'
import useOverpassRequest from './effects/useOverpassRequest'
import MapComponents from './MapComponents'
import { replaceArrayIndex } from '@/components/utils/utils'

export const defaultState = {
	depuis: { inputValue: null, choice: false },
	vers: { inputValue: null, choice: false },
	validated: false,
}

export default function Map({ searchParams }) {
	const mapContainerRef = useRef(null)
	const [zoom, setZoom] = useState(defaultZoom)
	const [bbox, setBbox] = useState(null)
	const center = useMemo(
		() =>
			bbox && [(bbox[0][0] + bbox[1][0]) / 2, (bbox[0][1] + bbox[1][1]) / 2],
		[bbox]
	)
	const [safeStyleKey, setSafeStyleKey] = useState(null)
	const [tempStyle, setTempStyle] = useState(null)
	const styleKey = tempStyle || searchParams.style || 'base',
		style = styles[styleKey],
		styleUrl = styles[styleKey].url

	// This is a generic name herited from the /ferry and /avion pages, state means the from and to box's states.
	// From is not currently used but will be.

	const allez = searchParams.allez
		? searchParams.allez.split('->')
		: [defaultState.depuis, defaultState.vers]
	const [state, setState] = useState(allez)
	console.log('bleu state', state)
	const map = useAddMap(styleUrl, setZoom, setBbox, mapContainerRef, setState)

	const [latLngClicked, setLatLngClicked] = useState(null)
	const [bikeRouteProfile, setBikeRouteProfile] = useState('safety')
	const [distanceMode, setDistanceMode] = useState(false)
	const [itineraryMode, setItineraryMode] = useState(false)
	const [styleChooser, setStyleChooser] = useState(false)

	useItineraryFromUrl(allez, setItineraryMode, map)

	const setSearchParams = useSetSearchParams()

	const lieu = searchParams.lieu
	const category = getCategory(searchParams)

	const showOpenOnly = searchParams.o

	const [zoneImages, panoramaxImages, resetZoneImages] = useZoneImages({
		latLngClicked,
		setLatLngClicked,
	})

	useImageSearch(map, zoom, bbox, searchParams.photos === 'oui')

	if (process.env.NEXT_PUBLIC_MAPTILER == null) {
		throw new Error(
			'You have to configure env NEXT_PUBLIC_MAPTILER, see README'
		)
	}

	const vers = state.slice(-1)[0]
	const choice = vers && vers.choice
	const target = useMemo(
		() => choice && [choice.longitude, choice.latitude],
		[choice]
	)

	useOsmRequest(map, state, setState, choice)

	const transportStopData = useTransportStopData(vers.osmFeature)

	useEffect(() => {
		if (!transportStopData || !transportStopData.routesGeojson) return
		console.log('debug', transportStopData.routesGeojson)

		setTempStyle('transit')

		return () => {
			console.log('will unset')
			setTempStyle(null)
		}
	}, [setTempStyle, transportStopData])

	useSearchLocalTransit(map, searchParams.transports === 'oui', center, zoom)

	const transportsData = useDrawTransportsMap(
		map,
		searchParams.transports === 'oui',
		safeStyleKey,
		setTempStyle,
		searchParams.day,
		bbox
	)

	const agencyId = searchParams.agence
	const agency = useMemo(() => {
		const agencyData =
			transportsData && transportsData.find((el) => el[0] === agencyId)
		return agencyData && { id: agencyData[0], ...agencyData[1] }
	}, [agencyId]) // including transportsData provokes a loop : maplibre bbox updated -> transportsData recreated -> etc

	console.log('pink agency', agency)

	useEffect(() => {
		if (!map || !agency) return

		const bbox = agency.bbox

		const mapLibreBBox = [
			[bbox[2], bbox[1]],
			[bbox[0], bbox[3]],
		]
		console.log('pink will fitbounds', mapLibreBBox)
		map.fitBounds(mapLibreBBox)
	}, [map, agency])

	useDrawTransport(
		map,
		transportStopData,
		safeStyleKey,
		transportStopData?.stopId
	)

	const [gares, setGares] = useState(null)

	const uic = searchParams.gare
	const clickedGare = gares && gares.find((g) => g.uic.includes(uic))
	const clickGare = (uic) => setSearchParams({ gare: uic })
	const [bikeRoute, setBikeRoute] = useState(null)
	const [resetItinerary, routes, date] = useItinerary(
		map,
		itineraryMode,
		bikeRouteProfile,
		searchParams
	)

	const itinerary = {
		bikeRouteProfile,
		itineraryMode,
		setItineraryMode,
		reset: resetItinerary,
		routes,
		date,
	}
	console.log('itinerary', itinerary)

	const simpleArrayBbox = useMemo(() => {
		if (!map) return
		const mapLibreBbox = map.getBounds().toArray(),
			bbox = [
				mapLibreBbox[0][1],
				mapLibreBbox[0][0],
				mapLibreBbox[1][1],
				mapLibreBbox[1][0],
			]
		return bbox
	}, [map])

	const [features] = useOverpassRequest(simpleArrayBbox, category)

	const onSearchResultClick = (feature) => {
		setState([...state.slice(0, -1), defaultState.vers])
		setOsmFeature(feature)
	}

	useDrawQuickSearchFeatures(
		map,
		features,
		showOpenOnly,
		category,
		onSearchResultClick
	)
	useDrawSearchResults(map, state, onSearchResultClick)

	useEffect(() => {
		if (!target || !clickedGare) return

		const [lon1, lat1] = clickedGare.coordonnées,
			[lon2, lat2] = target

		async function fetchBikeRoute() {
			const url = `https://brouter.osc-fr1.scalingo.io/brouter?lonlats=${lon1},${lat1}|${lon2},${lat2}&profile=${bikeRouteProfile}&alternativeidx=0&format=geojson`
			const res = await fetch(url)
			const json = await res.json()
			setBikeRoute(json)
		}

		fetchBikeRoute()
	}, [target, clickedGare, bikeRouteProfile])

	useEffect(() => {
		async function fetchGares() {
			const res = await fetch('/gares.json')
			const json = await res.json()
			setGares(json)
		}
		fetchGares()
	}, [setGares])

	useTerrainControl(map, style)

	useEffect(() => {
		if (!map) return
		map.on('zoom', () => {
			const approximativeZoom = Math.round(map.getZoom())
			if (approximativeZoom !== zoom) setZoom(approximativeZoom)
		})
		map.on('moveend', () => {
			setBbox(map.getBounds().toArray())
		})
	}, [zoom, setZoom, map, setBbox])

	const prevStyleKeyRef = useRef()
	useEffect(() => {
		prevStyleKeyRef.current = styleKey
	}, [styleKey])

	const prevStyleKey = prevStyleKeyRef.current
	useEffect(() => {
		if (!map) return
		if (styleKey === prevStyleKey) return
		console.log(
			'onload useEffect style hook mapId ',
			map._mapId,
			' from ',
			styleKey,
			' to ',
			prevStyleKey
		)

		console.log('onload should diff', styleKey !== 'base')
		// diff seems to fail because of a undefined sprite error showed in the
		// console
		// hence this diff: false. We're not loosing much
		map.setStyle(styleUrl, { diff: false }) //setting styleKey!== 'base' doesn't work, probably because the error comes from switching from base to another ?
		setTimeout(() => {
			// Hack : I haven't found a way to know when this style change is done, hence this setTimeout, absolutely not a UI problem but could be too quick ?
			setSafeStyleKey(styleKey)
		}, 300)
	}, [styleUrl, map, styleKey, prevStyleKey])

	const [clickedPoint, resetClickedPoint] = useRightClick(map)
	console.log('jaune point', clickedPoint)

	// This hook lets the user click on the map to find OSM entities
	// It also draws a polygon to show the search area for pictures
	// (not obvious for the user though)
	useEffect(() => {
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

			console.log('rawFeatures', rawFeatures)
			console.log('filteredFeatures', features)
			if (!features.length || !features[0].id) {
				console.log('no features', features)
				return
			}

			const feature = features[0]
			const openMapTilesId = '' + feature.id

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
			console.log('Clicked features from openmaptiles', {
				features,
				id,
				featureType,
				openMapTilesId,
			})

			const [element, realFeatureType] = await disambiguateWayRelation(
				featureType,
				id,
				e.lngLat
			)

			if (element) {
				console.log('reset OSMfeature after click on POI')
				console.log('will set lieu searchparam after click on POI')
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
					true
				)
				// We store longitude and latitude in order to, in some cases, avoid a
				// subsequent fetch request on link share
				setSearchParams({
					allez: `${encodePlace(realFeatureType, id)}|${longitude}|${latitude}`,
				})
				console.log('sill set OSMFeature', element)
				// wait for the searchParam update to proceed
				const uic = element.tags?.uic_ref,
					gare = gares && gares.find((g) => g.uic.includes(uic))
				if (uic && gare) clickGare(gare.uic)
			}
		}

		if (!map || distanceMode || itineraryMode) return

		map.on('click', onClick)
		return () => {
			if (!map) return
			map.off('click', onClick)
		}
	}, [map, setState, distanceMode, itineraryMode, gares, clickGare])

	useHoverOnMapFeatures(map)

	/* Transform this to handle the last itinery point if alone (just a POI url),
	 * but also to add markers to all the steps of the itinerary */
	/*
	useSetTargetMarkerAndZoom(
		map,
		target,
		state.vers.marker,
		state.vers.choice.type,
		setState,
		setLatLngClicked,
		zoom
	)
	*/

	const lesGaresProches =
		target && gares && sortGares(gares, target).slice(0, 30)

	useEffect(() => {
		if (!lesGaresProches) return
		const markers = lesGaresProches.map((gare) => {
			const element = document.createElement('div')
			const factor = { 1: 0.9, 2: 1.1, 3: 1.3 }[gare.niveau] || 0.7
			element.style.cssText = `
				display: flex;
				flex-direction: column;
				align-items: center;
				cursor: help;
			`
			const size = goodIconSize(zoom, factor) + 'px'

			const image = document.createElement('img')
			image.src = '/gare.svg'
			image.style.width = size
			image.style.height = size
			image.alt = "Icône d'une gare"
			element.append(image)

			element.addEventListener('click', () => {
				clickGare(gare.uic === clickedGare?.uic ? null : gare.uic)
			})

			const marker = new maplibregl.Marker({ element })
				.setLngLat(gare.coordonnées)
				.addTo(map)
			return marker
		})
		return () => {
			markers.map((marker) => marker.remove())
		}
	}, [lesGaresProches, map, zoom, clickGare, clickedGare?.uic])

	return (
		<MapContainer>
			<MapHeader $style={style}>
				<ModalSwitch
					{...{
						setState,
						state,
						clickedGare,
						clickGare,
						bikeRoute,
						latLngClicked,
						setLatLngClicked,
						setBikeRouteProfile,
						bikeRouteProfile,
						zoneImages,
						panoramaxImages,
						resetZoneImages,
						zoom,
						searchParams,
						style,
						styleChooser,
						setStyleChooser,
						itinerary,
						transportStopData,
						clickedPoint,
						resetClickedPoint,
						transportsData,
					}}
				/>
			</MapHeader>
			<MapButtons
				{...{
					style,
					setStyleChooser,
					styleChooser,
					distanceMode,
					setDistanceMode,
					map,
					itinerary,
					searchParams,
				}}
			/>
			{searchParams.transports === 'oui' && <CenteredCross />}
			{map && <MapComponents map={map} />}
			<div ref={mapContainerRef} />
		</MapContainer>
	)
}
