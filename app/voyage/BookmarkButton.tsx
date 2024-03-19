import distance from '@turf/distance'
import Image from 'next/image'
import { useLocalStorage } from 'usehooks-ts'

const pointHash = (point) => point.geometry.coordinates.join('|')

export default function BookmarkButton({ clickedPoint }) {
	const [bookmarks, setBookmarks] = useLocalStorage('bookmarks', [])
	const feature = {
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: [
				clickedPoint.longitude.toFixed(4), // this is ~ 10 m precision, we don't want more than one bookmark every 10 meters
				clickedPoint.latitude.toFixed(4),
			],
		},
		properties: {},
	}

	const same = bookmarks.find((point) => {
		if (point.geometry.type !== 'Point') return false
		return pointHash(point) === pointHash(feature)
	})
	return (
		<div
			css={`
				text-align: right;
				button {
				}
				img {
					width: 2rem;
					height: auto;
				}
			`}
		>
			<button
				onClick={() =>
					same
						? setBookmarks(
								bookmarks.filter((point) => {
									if (point.geometry.type !== 'Point') return true
									return pointHash(point) !== pointHash(feature)
								})
						  )
						: setBookmarks([...bookmarks, feature])
				}
			>
				<Image
					src={same ? '/star-full.svg' : '/star.svg'}
					alt={same ? 'Enlever des favoris' : 'Mettre en favori'}
					width="10"
					height="10"
				/>
			</button>
		</div>
	)
}
