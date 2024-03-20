import { extractOsmFeature } from '@/components/voyage/fetchPhoton'
import { centerOfMass } from '@turf/turf'
import { useEffect, useState } from 'react'
import { osmRequest } from '../osmRequest'
import { decodePlace } from '../utils'

// TODO this function will enrich the array of steps stored in the URL
// with an osm object if relevant and if it's not been done already
export default function useOsmRequest(map, state, choice) {
	const [featureType, featureId] = place
		? decodePlace(place)
		: extractOsmFeature(choice)
	useEffect(() => {
		if (!map || !featureType || !featureId) return
		if (osmFeature && osmFeature.id == featureId) return
		const request = async () => {
			console.log('Preparing OSM request ', featureType, featureId)
			const full = ['way', 'relation'].includes(featureType)
			const isNode = featureType === 'node'
			if (!isNode && !full)
				return console.log(
					"This OSM feature is neither a node, a relation or a way, we don't know how to handle it"
				)

			const elements = await osmRequest(featureType, featureId, full)
			if (!elements.length) return
			console.log(
				'OSM elements received',
				elements,
				' for ',
				featureType,
				featureId
			)

			const element = elements.find((el) => el.id == featureId)

			const featureCollectionFromOsmNodes = (nodes) => {
				console.log('yanodes', nodes)
				const fc = {
					type: 'FeatureCollection',
					features: nodes.map((el) => ({
						type: 'Feature',
						properties: {},
						geometry: {
							type: 'Point',
							coordinates: [el.lon, el.lat],
						},
					})),
				}
				console.log('centerofmass', fc, centerOfMass(fc))
				return fc
			}
			const relation = elements.find((el) => el.id == featureId),
				adminCenter =
					relation &&
					relation.members?.find((el) => el.role === 'admin_centre'),
				adminCenterNode =
					adminCenter && elements.find((el) => el.id == adminCenter.ref)

			console.log('admincenter', relation, adminCenter, adminCenterNode)
			const nodeCenter = adminCenterNode
				? [adminCenterNode.lon, adminCenterNode.lat]
				: !full
				? [element.lon, element.lat]
				: centerOfMass(
						featureCollectionFromOsmNodes(
							elements.filter((el) => el.lat && el.lon)
						)
				  ).geometry.coordinates

			console.log('will set OSMfeature after loading it from the URL')
			setOsmFeature(element)
			console.log('should fly to', nodeCenter)
			if (!choice || choice.osmId !== featureId) {
				console.log(
					'blue',
					'will fly to in after OSM download from url query param',
					nodeCenter
				)
				map.flyTo({
					center: nodeCenter,
					zoom: 18,
					pitch: 50, // pitch in degrees
					bearing: 20, // bearing in degrees
				})
			}
		}
		request()
	}, [map, featureType, featureId, choice, osmFeature])
	return [osmFeature, setOsmFeature]
}
