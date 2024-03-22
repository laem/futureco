import maplibregl from 'maplibre-gl'
import { useEffect, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { styles } from '../styles/styles'
import { replaceArrayIndex } from '@/components/utils/utils'

const defaultCenter =
	// Saint Malo [-1.9890417068124002, 48.66284934737089]
	[-1.678, 48.11]
export const defaultZoom = 8
const defaultHash = `#${defaultZoom}/${defaultCenter[1]}/${defaultCenter[0]}`

export default function useAddMap(
	styleUrl,
	setZoom,
	setBbox,
	mapContainerRef,
	setState
) {
	const [map, setMap] = useState(null)
	const mobile = useMediaQuery('(max-width: 800px)')
	useEffect(() => {
		if (!mapContainerRef.current) return undefined

		const newMap = new maplibregl.Map({
			container: mapContainerRef.current,
			style: styleUrl,
			center: defaultCenter,
			zoom: defaultZoom,
			hash: true,
			attributionControl: false,
		})
		newMap.addControl(
			new maplibregl.NavigationControl({
				visualizePitch: true,
				showZoom: true,
				showCompass: true,
			}),
			'top-right'
		)

		const geolocate = new maplibregl.GeolocateControl({
			positionOptions: {
				enableHighAccuracy: true,
			},
			trackUserLocation: true,
		})

		newMap.addControl(geolocate)

		geolocate.on('geolocate', function (e) {
			console.log('bleu ', e.coords)
			setState((state) =>
				replaceArrayIndex(state, -1, { geolocated: e.coords }, 'merge')
			)
		})

		newMap.on('style.load', function () {
			console.log('ONLOAD STYLE', newMap._mapId)
		})
		newMap.on('load', () => {
			console.log('ONLOAD', newMap._mapId)
			setMap(newMap)

			setZoom(Math.round(newMap.getZoom()))
			setBbox(newMap.getBounds().toArray())

			console.log('MOBILE', mobile, window.location.hash, defaultHash)
			if (window.location.hash === defaultHash && mobile) geolocate.trigger()
		})

		newMap.on('moveend', (e) => {
			setBbox(newMap.getBounds().toArray())
		})

		return () => {
			setMap(null)
			newMap?.remove()
		}
	}, [setMap, setZoom, setBbox, mapContainerRef]) // styleUrl not listed on purpose

	useEffect(() => {
		if (!map) return
		const style = Object.values(styles).find((style) => style.url === styleUrl)
		const attribution = new maplibregl.AttributionControl({
			customAttribution: style.attribution,
		})
		map.addControl(attribution)

		return () => {
			map.removeControl(attribution)
		}
	}, [map, styleUrl])

	return map
}
