'use client'
import icons from '@/app/voyage/icons/icons.json'
import { omit } from 'ramda'
import Highlighter from 'react-highlight-words'
import css from '../css/convertToJs'
import { buildAddress } from '../voyage/Address'

// Beware, this file is shared by the Map app, and the carbon footprint / € calculators

const hash = (item) =>
	Object.entries(
		omit(
			['osmId', 'latitude', 'longitude', 'extent', 'osm_value', 'osm_key'],
			item
		)
	).join('')

const removeDuplicates = (elements) =>
	elements.reduce((memo, next) => {
		const duplicate = memo.find((el) => hash(el) === hash(next))
		return [...memo, ...(duplicate ? [] : [next])]
	}, [])

export default function GeoInputOptions({
	whichInput,
	data,
	updateState,
	rulesPath = '',
	dispatchUpdateSituation = () => () => null,
}) {
	return data?.results.length > 0 ? (
		<ul>
			{removeDuplicates(data.results)
				.slice(0, 5)
				.map((option) => (
					<Option
						key={option.osmId}
						{...{
							whichInput,
							option,
							updateState,
							rulesPath,
							data,
							dispatchUpdateSituation,
						}}
					/>
				))}
		</ul>
	) : (
		<p>Chargement en cours</p>
	)
}

const safe = (text) => (text != null ? text : '')
export const buildLocationText = (item) => {
	if (item.street) return buildAddress(item, true)

	const nameIncludes = (what) => {
		if (!what) return true
		return (
			item.name && item.name.toLowerCase().includes((what || '').toLowerCase())
		)
	}

	const displayCity = !nameIncludes(item.city),
		displayCountry = !nameIncludes(item.country) && item.country !== 'France' // these web apps are mostly designed for metropolitan France
	const displayDépartement = item.country === 'France' // French people will probably not search for cities with the same name, hence small, abroad

	// This is far from perfect, to iterate
	const locationText = `${safe(item.name)} ${
		displayCity ? safe(item.city) + (displayCountry ? ' - ' : '') : ''
	} ${displayDépartement ? safe(item.county) : ''} ${
		displayCountry ? safe(item.country) : ''
	}`

	if (locationText.includes('undefined'))
		console.log('blue', item, locationText)
	return locationText
}

const Option = ({
	whichInput,
	option,
	updateState,
	dispatchUpdateSituation,
	rulesPath,
	data,
}) => {
	const choice = option.choice,
		inputValue = data.inputValue

	const { osm_key: osmKey, osm_value: osmValue } = option

	const locationText = buildLocationText(option)
	console.log({ locationText })
	const foundIcon =
		icons.find(([key]) => key === osmKey + '_' + osmValue) ||
		icons.find(([key]) => key === osmValue)
	console.log('cyan', option, foundIcon)
	const urlBase = `https://cdn.jsdelivr.net/gh/osmandapp/OsmAnd-resources/icons/svg/`
	const iconPath = foundIcon ? urlBase + foundIcon[1] : `/dot.svg`

	return (
		<li
			css={`
				padding: 0.2rem 0.6rem;
				border-radius: 0.3rem;
				${choice && choice.name === option.name
					? 'background: var(--color); color: var(--textColor)'
					: ''};
				button {
					color: white;
					font-size: 100%;
					display: flex;
					align-items: center;
					text-align: left;
					width: 100%;
					padding: 0;
				}
				button > span {
					display: flex;
					justify-content: space-between;
					align-items: center;
					width: 100%;
				}

				button:hover {
					background: var(--darkerColor2);
					border-radius: 0.3rem;
				}
				button > img {
					width: 1.2rem;
					height: 1.2rem;
					margin-right: 0.6rem;
				}
			`}
		>
			<button
				onClick={(e) => {
					const newState = { ...data, choice: { ...option, inputValue } }

					const value =
						rulesPath === 'transport . avion'
							? option.city
							: option.name || option.city
					const entry = [
						rulesPath +
							' . ' +
							{ depuis: 'départ', vers: 'arrivée' }[whichInput],
						`'${value}'`,
					]

					dispatchUpdateSituation(entry[0])(entry[1])
					updateState(newState)
				}}
			>
				<img
					width="10"
					height="10"
					src={iconPath}
					alt="Icône représentant au mieux le type de lieu"
				/>
				<span>
					<Highlighter
						autoEscape={true}
						searchWords={[inputValue]}
						textToHighlight={option.name}
						highlightStyle={highlightStyle}
					/>
					<span style={{ opacity: 0.6, fontSize: '75%', marginLeft: '.6em' }}>
						<Highlighter
							autoEscape={true}
							highlightStyle={highlightStyle}
							searchWords={[inputValue]}
							textToHighlight={locationText}
						/>
					</span>
				</span>
			</button>
		</li>
	)
}

const highlightStyle = css`
	background: gold;
`
