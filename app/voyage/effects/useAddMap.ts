import maplibregl from 'maplibre-gl'
import { useEffect, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

const defaultCenter =
	// Saint Malo [-1.9890417068124002, 48.66284934737089]
	[-1.678, 48.11]
export const defaultZoom = 8
const defaultHash = `#${defaultZoom}/${defaultCenter[0]}/${defaultCenter[1]}`

export default function useAddMap(styleUrl, setZoom, setBbox, mapContainerRef) {
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
		newMap.on('style.load', function () {
			console.log('ONLOAD STYLE', newMap._mapId)
		})
		newMap.on('load', () => {
			console.log('ONLOAD', newMap._mapId)
			setMap(newMap)

			setZoom(Math.round(newMap.getZoom()))
			setBbox(newMap.getBounds().toArray())

			if (window.location.hash === defaultHash && mobile) geolocate.trigger()
		})

		return () => {
			setMap(null)
			newMap?.remove()
		}
	}, [setMap, setZoom, setBbox, mapContainerRef]) // styleUrl not listed on purpose

	return map
}
