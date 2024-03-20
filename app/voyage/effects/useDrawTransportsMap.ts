import { keys } from '@/components/utils/utils'
import { useEffect, useMemo, useState } from 'react'
import { gtfsServerUrl } from '../serverUrls'
import useDrawTransport from './useDrawTransport'

export default function useDrawTransportsMap(
	map,
	active,
	safeStyleKey,
	setTempStyle,
	day,
	bbox
) {
	const [data, setData] = useState({ cache: [], active: [] })
	useEffect(() => {
		if (!map || !active) return

		setTempStyle('transit')
		return () => {
			setTempStyle(null)
		}
	}, [setTempStyle, active, map])
	useEffect(() => {
		if (!active || !bbox) return

		const doFetch = async () => {
			const [[longitude2, latitude], [longitude, latitude2]] = bbox

			const url = (format) =>
				`${gtfsServerUrl}/agencyArea/${latitude}/${longitude}/${latitude2}/${longitude2}/${format}/?${
					day ? `day=${formattedDay}` : ''
				}`
			const format = !data ? 'geojson' : 'prefetch'
			const formattedDay = day?.replace(/-/g, '')
			const request = await fetch(url(format), { mode: 'cors' })
			const json = await request.json()

			if (format === 'geojson')
				return setData({ cache: json, active: keys(json) })

			// The request was a prefetch request
			const agenciesInCache = data.cache.map(([id]) => id),
				newAgencies = json.filter((agency) => !agenciesInCache.includes(agency))

			if (!newAgencies.length) {
				setData((data) => ({
					...data,
					active: json,
				}))
				return
			}

			const dataRequest = await fetch(
				url('geojson') + `&selection=${newAgencies.join('|')}`,
				{ mode: 'cors' }
			)

			const dataJson = await dataRequest.json()

			setData((data) => ({
				cache: [...data.cache, ...dataJson],
				active: keys(dataJson),
			}))
		}
		doFetch()
	}, [setData, bbox, active, day])

	const activeAgencies = data.active.map((agency) =>
		data.cache.find(([id]) => id === agency)
	)

	const drawEntries = useMemo(() => {
		return activeAgencies.map(([agencyId, { geojson }]) => [
			agencyId,
			agencyId == '1187' ? addDefaultColor(geojson) : geojson,
		])
	}, [data])

	const sourcePrefix = 'gtfs-agency-'
	useDrawTransport(map, drawEntries, safeStyleKey, sourcePrefix)
	return activeAgencies
}

const addDefaultColor = (featureCollection) => {
	const maxCountLine = Math.max(
		...featureCollection.features
			.map(
				(feature) =>
					feature.geometry.type === 'LineString' && feature.properties.count
			)
			.filter(Boolean)
	)
	const maxCountPoint = Math.max(
		...featureCollection.features
			.map(
				(feature) =>
					feature.geometry.type === 'Point' && feature.properties.count
			)
			.filter(Boolean)
	)
	return {
		type: 'FeatureCollection',
		features: featureCollection.features.map((feature) =>
			feature.geometry.type === 'Point'
				? {
						...feature,
						properties: {
							...feature.properties,
							width: Math.max(feature.properties.count / maxCountPoint, 0.1),
							'circle-stroke-color': '#0a2e52',
							'circle-color': '#185abd',
						},
				  }
				: {
						...feature,
						properties: {
							...feature.properties,
							route_color: '#821a73',
							route_type: 2,
							opacity: Math.max(feature.properties.count / maxCountLine, 0.1),
						},
				  }
		),
	}
}
