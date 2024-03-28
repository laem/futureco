import maplibregl from 'maplibre-gl'
import { useEffect, useState } from 'react'
import garesCitiz from './garesCitiz.yaml'

export default function useCars(map, clickedGare) {
	const [cars, setCars] = useState([])

	useEffect(() => {
		if (!map || !clickedGare) return

		const fetchCars = async () => {
			const { provider, cityId, website } = garesCitiz[+clickedGare.uic]
			console.log('citiz provider', provider, clickedGare, garesCitiz)
			if (!provider) return

			const url = `https://service.citiz.fr/citiz/api/provider/${provider}/reservation/schedule`
			console.log('will fetch citiz', url)
			const data = {
				from: '2023-12-01T00:00:00',
				until: '2023-12-02T00:00:00',
				where: { citiesIds: [cityId], stationsIds: [] },
			}
			const request = await fetch(url, {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json',
				},
			})

			const json = await request.json()

			const city = json?.citiz?.find((el) => el.cityId === cityId),
				cars =
					city &&
					city.stations
						?.map((s) => {
							const { vehicles, ...rest } = s

							return vehicles?.map((v) => ({ ...v, station: rest, website }))
						})
						.filter(Boolean)
						.flat()

			if (cars) setCars(cars)
		}

		fetchCars()
	}, [map, clickedGare, setCars])

	console.log('CARS', cars)

	const geojson = {
		type: 'FeatureCollection',
		features: cars.map((car) => ({
			type: 'Feature',
			properties: {
				description: `${car.station.stationName} \n ${
					car.vehicleName
				} \n autonomie ${car.autonomy} \n ⚡️ : ${
					car.electricEngine ? 'électrique' : 'thermique'
				} \n ${car.website}`,
				vehicleId: car.vehicleId,
			},
			geometry: {
				type: 'Point',
				coordinates: [car.station.gpsLongitude, car.station.gpsLatitude],
			},
		})),
	}
	useEffect(() => {
		if (!map) return
		// add markers to map
		const markers = geojson.features.map((marker) => {
			// create a DOM element for the marker
			const el = document.createElement('img')
			el.className = 'marker'
			el.src = `https://service.citiz.fr/citiz/api/vehicule/${marker.properties.vehicleId}/photo`
			el.style.width = `60px`
			el.style.height = `60px`
			el.style.borderRadius = `60px`
			el.style.border = '4px solid var(--darkerColor)'
			el.style.objectFit = 'cover'

			el.addEventListener('click', () => {
				window.alert(marker.properties.description)
			})

			// add marker to map
			const mapMarker = new maplibregl.Marker({ element: el }).setLngLat(
				marker.geometry.coordinates
			)

			mapMarker.addTo(map)
			return mapMarker
		})
		return () => {
			markers.map((marker) => marker.remove())
		}
	}, [map, geojson])
}
