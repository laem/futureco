import css from '@/components/css/convertToJs'

export default function Brand({ brand, brandWikidata, brandWikipedia }) {
	if (!(brand || brandWikidata || brandWikipedia)) return null
	if (!brandWikipedia) return <div>Marque: {brand}</div>
	const [presumedLang, presumedName] = brandWikipedia.split(':'),
		lang = presumedName ? presumedLang : 'fr',
		name = presumedName || presumedLang,
		url = `https://${lang}.wikipedia.org/wiki/${name}`

	return (
		<div>
			Marque :&nbsp;
			<img
				src={'/wikipedia.svg'}
				alt="Logo de Wikipedia"
				width="20"
				height="20"
				style={css`
					vertical-align: middle;
				`}
			/>{' '}
			<a href={url} target="_blank">
				{brand}
			</a>
			{brandWikidata && <Wikidata id={brandWikidata} />}
		</div>
	)
}

export const Wikidata = ({ id }) => (
	<span
		style={css`
			margin-left: 0.8rem;
		`}
	>
		<img
			src={'/wikidata.svg'}
			alt="Logo de Wikidata"
			width="20"
			height="20"
			style={css`
				vertical-align: middle;
			`}
		/>{' '}
		<a href={`https://wikidata.org/wiki/${id}`} target="_blank">
			<small>wikidata</small>
		</a>
	</span>
)
