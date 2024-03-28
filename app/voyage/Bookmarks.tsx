import { useLocalStorage } from 'usehooks-ts'
import { pointHash } from './BookmarkButton'
import Image from 'next/image'

export default function Favoris() {
	const [bookmarks, setBookmarks] = useLocalStorage('bookmarks', [])
	return (
		<section>
			<h2>Mes favoris</h2>

			<h3>Adresses</h3>
			<ul
				css={`
					padding-left: 0.6rem;
					li {
						display: flex;
						align-items: center;
					}
				`}
			>
				{bookmarks.map((bookmark) => (
					<li key={pointHash(bookmark)}>
						{pointHash(bookmark)}
						<button
							css={`
								line-height: 1rem;
								img {
									width: 1.2rem;
									height: auto;
								}
							`}
							onClick={() =>
								setBookmarks(
									bookmarks.filter((point) => {
										if (point.geometry.type !== 'Point') return true
										return pointHash(point) !== pointHash(bookmark)
									})
								)
							}
						>
							<Image
								src="/trash.svg"
								width="10"
								height="10"
								alt="Supprimer le favori"
							/>
						</button>
					</li>
				))}
			</ul>
			<h3>Itinéraires</h3>
			<p>Bientôt.</p>
		</section>
	)
}
