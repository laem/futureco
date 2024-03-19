import useSetSearchParams from '@/components/useSetSearchParams'
import Link from 'next/link'
import Image from 'next/image'

export default function SetDestination({ destination, origin }) {
	const { latitude, longitude } = origin

	const setSearchParams = useSetSearchParams()

	const href = setSearchParams(
		{
			allez: `${longitude}|${latitude};${destination.longitude}|${destination.latitude}`,
		},
		true,
		false
	)

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
