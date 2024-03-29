// Inspired by https://github.com/zbycz/osmapp/blob/master/src/services/helpers.ts#L107

export const addressKeys = [
	'addr:place',
	'addr:street',
	'addr:housenumber',
	'addr:city',
	'addr:state',
	'addr:postcode',
	'contact:city',
	'contact:housenumber',
	'contact:postcode',
	'contact:street',
]

export default function Address({ tags: t, noPrefix }) {
	const g = (key) => {
		const value = noPrefix ? t[key] : t[`addr:` + key] || t['contact:' + key]
		return value || ''
	}

	return (
		<address
			css={`
				line-height: 1.4rem;
				font-size: 90%;
				font-style: normal;
			`}
		>
			{buildAddress(g)}
		</address>
	)
}

export const buildAddress = (g) => `
${g('housenumber')} ${g('street')} ${
	g('postcode') || g('city') || g('state') ? ', ' : ''
} ${g('postcode')} ${g('city')} ${g('state')}
`
