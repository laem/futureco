import useSetSearchParams from '@/components/useSetSearchParams'
import Link from 'next/link'
import Image from 'next/image'

// We don't need full precision, just 5 decimals ~ 1m
// https://wiki.openstreetmap.org/wiki/Precision_of_coordinates
// We'll even try with 4 and see
export const buildAllezPart = (name, id, longitude, latitude) => {
	const part = `${name}|${id || ''}|${longitude.toFixed(4)}|${latitude.toFixed(
		4
	)}`
	return part
}

export const setStatePart = (
	key: string | number,
	state: Array<object>,
	value: string
) =>
	state
		.map((part, index) =>
			(typeof key === 'string' ? part.key === key : index === key)
				? value
				: part.key
		)
		.join('->')

export default function SetDestination({
	destination,
	geolocation,
	searchParams,
}) {
	const setSearchParams = useSetSearchParams()

	//const destinationPart = `${destination.longitude}|${destination.latitude}`

	const search = {
		allez: geolocation
			? `${buildAllezPart(
					'Votre position',
					null,
					geolocation.longitude,
					geolocation.latitude
			  )}->${searchParams.allez}`
			: `->${searchParams.allez}`,
	}

	const href = setSearchParams(search, true, false)

	return (
		<Link href={href}>
			<button
				css={`
					border-radius: 0.6rem;
					background: var(--color);
					width: 6rem;
					height: 4rem;
					padding: 0.4rem 0;
					color: white;
				`}
			>
				<div
					css={`
						background: white;
						height: 1.8rem;
						width: 1.8rem;
						border-radius: 1rem;
						margin: 0 auto 0.2rem;
						img {
							width: 100%;
							height: 100%;
							padding: 0.25rem;
						}
					`}
				>
					<Image
						src="/itinerary.svg"
						width="50"
						height="50"
						alt="Lancer le mode itinéraire"
					/>
				</div>
				<div>Y aller</div>
			</button>
		</Link>
	)
}
