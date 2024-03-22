import { useEffect } from 'react'

export default function useItineraryFromUrl(allez, setItineraryMode, map) {
	useEffect(() => {
		if (!map || allez.length < 2) return

		setItineraryMode(true)
	}, [allez, setItineraryMode, map])
}
