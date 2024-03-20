import { useEffect, useState } from 'react'
import getCityData, { extractFileName, getThumb } from '@/components/wikidata'

export default function useWikidata(osmFeature, state) {
	const [wikidata, setWikidata] = useState(null)
	const vers = state.slice(-1)[0]
	useEffect(() => {
		if (!osmFeature) return // We're waiting for osmFeature first, since it can contain the wikidata tag, way more precise than guessing the wikidata from the name
		if (osmFeature.tags?.wikidata || osmFeature.tags?.wikimedia_commons) return
		if (!vers.choice) return

		getCityData(vers.choice.name, false).then((json) => {
			const firstResult = json?.results?.bindings[0],
				wikimediaUrl = firstResult?.pic?.value

			if (!wikimediaUrl) return
			const pictureName = extractFileName(decodeURI(wikimediaUrl))
			const pictureUrl = getThumb(pictureName, 500)
			setWikidata({ pictureName, pictureUrl })
		})
	}, [vers, osmFeature])

	useEffect(() => {
		if (!osmFeature?.tags?.wikidata) return

		const id = osmFeature.tags.wikidata

		const doFetch = async () => {
			const request = await fetch(
				`https://www.wikidata.org/w/rest.php/wikibase/v0/entities/items/${id}`
			)
			const json = await request.json()
			if (!json.statements) return

			const p18 = json.statements.P18
			const pictureStatement = p18 && p18[0]
			if (!pictureStatement) return
			const pictureName = pictureStatement.value.content

			const pictureUrl = getThumb(pictureName, 500)
			setWikidata({ pictureName, pictureUrl, ...json })
		}

		doFetch()
	}, [osmFeature])

	return wikidata
}
