import distance from '@turf/distance'
import Image from 'next/image'
import { useLocalStorage } from 'usehooks-ts'

export default function BookmarkButton({ clickedPoint }) {
	const [bookmarks, setBookmarks] = useLocalStorage('bookmarks', [])
	const feature = {
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: [clickedPoint.longitude, clickedPoint.latitude],
		},
		properties: {},
	}
	const closeBookmark = bookmarks.find((point) => {
		if (point.geometry.type !== 'Point') return false
		const kilometers = distance(point, feature)
		return kilometers < 0.1 && kilometers > 0.001
	})
	console.log('cyan close', closeBookmark)
	if (closeBookmark) return null
	const sameBookmark = bookmarks.find((point) => {
		if (point.geometry.type !== 'Point') return false
		const kilometers = distance(point, feature)
		return kilometers < 0.001
	})
	console.log('cyan same', sameBookmark)
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
					sameBookmark
						? setBookmarks(
								bookmarks.filter((point) => {
									if (point.geometry.type !== 'Point') return true
									const kilometers = distance(point, feature)
									return kilometers < 0.001
								})
						  )
						: setBookmarks([...bookmarks, feature])
				}
			>
				<Image
					src={sameBookmark ? '/star-full.svg' : '/star.svg'}
					alt={sameBookmark ? 'Enlever des favoris' : 'Mettre en favori'}
					width="10"
					height="10"
				/>
			</button>
		</div>
	)
}
