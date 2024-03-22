import { buildLocationText } from '@/components/conversation/GeoInputOptions'
import Address from '@/components/voyage/Address'
import computeDistance from '@turf/distance'

export default function ClickedPoint({
	clickedPoint: { latitude, longitude, data },
	origin,
}) {
	if (!data)
		return (
			<div>
				<Distance origin={origin} destination={{ longitude, latitude }} />
				<LatLong {...{ latitude, longitude }} />
			</div>
		)
	const feature = data.features[0],
		item = feature?.properties
	const isAddress = item.street

	if (isAddress)
		return (
			<div
				css={`
					margin: 1rem 0;
				`}
			>
				<strong>Adresse</strong>
				<Address tags={item} noPrefix={true} />
				<strong>Distance</strong>
				<Distance origin={origin} destination={{ longitude, latitude }} />
			</div>
		)

	/* What was I trying to do here ? As far as I've tested, it returns undefined
	 * - undefined
	const locationText = buildLocationText(data)
			{data && <div>{locationText}</div>}

*/
	return (
		<div
			css={`
				margin: 1rem 0;
			`}
		>
			{origin && (
				<>
					<strong>Distance</strong>
					<Distance origin={origin} destination={{ longitude, latitude }} />
				</>
			)}
			<strong>Coordonnées</strong>
			<LatLong {...{ latitude, longitude }} />
		</div>
	)
}

const Distance = ({ destination, origin }) => {
	if (!origin) return null

	const distance = computeDistance(
		{
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [destination.longitude, destination.latitude],
			},
			properties: {},
		},
		{
			properties: {},
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [origin.longitude, origin.latitude],
			},
		}
	)
	const humanDistance =
		distance < 1
			? `${Math.round(distance * 1000)} m`
			: distance < 10
			? `${Math.round(distance * 10) / 10} km`
			: `${Math.round(distance)} km`
	return (
		<div>
			<small>À {humanDistance}</small>
		</div>
	)
}
const LatLong = ({ latitude, longitude }) => (
	<div
		css={`
			small {
				color: #666;
			}
		`}
	>
		<small>longitude</small>&nbsp;{longitude.toFixed(4)} <small>latitude</small>
		&nbsp;{latitude.toFixed(4)}
	</div>
)
