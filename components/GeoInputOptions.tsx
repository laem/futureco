'use client'
import icons from '@/app/icons/icons.json'
import { omit } from './utils/utils'
import Highlighter from 'react-highlight-words'
import css from './css/convertToJs'
import { buildAddress } from './Address'

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
	return (
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
	const urlBase = `https://cdn.jsdelivr.net/gh/osmandapp/OsmAnd-resources/icons/svg/`
	const iconPath = foundIcon ? urlBase + foundIcon[1] : `/dot.svg`

	return (
		<li
			css={`
				padding: 0;
				border-radius: 0;
				${choice && choice.name === option.name
					? 'background: var(--color); color: var(--textColor)'
					: ''};
				border-bottom: 1px solid var(--lightestColor);
				button {
					font-size: 90%;
					line-height: 130%;
					display: flex;
					align-items: center;
					text-align: left;
					width: 100%;
					padding: 0.5rem;
					border-radius: 0;
				}
				button > span {
					display: flex;
					justify-content: space-between;
					flex-wrap: wrap;
					gap: 0 0.9rem;
					align-items: center;
					width: 100%;
				}

				button > span > span:nth-of-type(2) {
					flex-grow: 1;
					text-align: right;
					opacity: 0.6;
					font-size: 80%;
				}

				button:hover {
					background: var(--lightestColor);
				}
				button > img {
					width: 1.2rem;
					height: 1.2rem;
					margin-right: 0.6rem;
					filter: invert(1);
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
						textToHighlight={option.name ?? locationText}
						highlightStyle={highlightStyle}
					/>
					{option.name && (
						<Highlighter
							autoEscape={true}
							highlightStyle={highlightStyle}
							searchWords={[inputValue]}
							textToHighlight={locationText}
						/>
					)}
				</span>
			</button>
		</li>
	)
}

const highlightStyle = css`
	background: var(--lighterColor);
`
