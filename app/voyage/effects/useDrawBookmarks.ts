import maplibregl from 'maplibre-gl'
import { useEffect } from 'react'
import { useLocalStorage } from 'usehooks-ts'

export default function useDrawBookmarks(map) {
	console.log('cyan useDrawBookmarks')
	const [bookmarks, setBookmarks] = useLocalStorage('bookmarks', [])

	useEffect(() => {
		const markers = bookmarks.map((bookmark) => {
			const marker = new maplibregl.Marker()
				.setLngLat({
					lng: bookmark.geometry.coordinates[0],
					lat: bookmark.geometry.coordinates[1],
				})
				.addTo(map)
			return marker
		})

		return () => {
			markers.map((marker) => marker.remove())
		}
	}, [bookmarks])
}
