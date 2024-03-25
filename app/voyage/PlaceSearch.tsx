import GeoInputOptions from '@/components/conversation/GeoInputOptions'
import { InputStyle } from '@/components/conversation/UI'
import css from '@/components/css/convertToJs'
import fetchPhoton from '@/components/voyage/fetchPhoton'
import { useCallback, useEffect, useState } from 'react'
import { encodePlace } from './utils'
import Logo from '@/public/voyage.svg'
import Image from 'next/image'
import { getArrayIndex, replaceArrayIndex } from '@/components/utils/utils'
import { buildAllezPart, setStatePart } from './SetDestination'

const useAutoFocus = () => {
	const inputRef = useCallback((inputElement) => {
		if (inputElement) {
			inputElement.focus()
		}
	}, [])

	return inputRef
}

/* I'm  not sure of the interest to attache `results` to each state step.
 * It could be cached across the app. No need to re-query photon for identical
 * queries too.*/
export default function PlaceSearch({
	state,
	setState,
	sideSheet,
	setSnap,
	zoom,
	setSearchParams,
	searchParams,
	autoFocus = false,
	stepIndex,
}) {
	if (stepIndex == null) throw new Error('Step index necessary')
	const [localSearch, setLocalSearch] = useState(true)
	const urlSearchQuery = searchParams.q
	const step = getArrayIndex(state, stepIndex) || {
		results: [],
		inputValue: '',
	}
	const value = step.inputValue

	const autofocusInputRef = useAutoFocus()
	console.log('cornflowerblue search', stepIndex, state)

	const onInputChange =
		(stepIndex = -1, localSearch = false) =>
		(v) => {
			const newState = replaceArrayIndex(
				state,
				stepIndex,
				{
					...(v == null ? { results: null } : {}),
					inputValue: v,
				}
				//validated: false, // TODO was important or not ? could be stored in each state array entries and calculated ?
			)
			console.log('indigo newState', newState)
			setState(newState)
			if (v?.length > 2) {
				const hash = window.location.hash,
					local = hash.split('/').slice(1, 3)

				fetchPhoton(v, setState, stepIndex, localSearch && local, zoom)
			}
		}
	const onDestinationChange = onInputChange(stepIndex, localSearch)

	useEffect(() => {
		if (!urlSearchQuery || value != null) return

		onDestinationChange(urlSearchQuery)
	}, [urlSearchQuery, onDestinationChange, value])

	return (
		<div>
			<div
				css={`
					display: flex;
					justify-content: center;
					> img {
						width: 2rem;
						margin-right: 0.4rem;
						height: auto;
					}
					${sideSheet && `margin: .4rem 0`}
				`}
			>
				<Image src={Logo} alt="Logo de Cartes.app" width="100" height="100" />
				<InputStyle
					css={`
						color: white;
						input {
							max-width: 22rem;
							width: 83vw;

							margin-bottom: 0;
						}
						position: relative;
					`}
				>
					<input
						type="text"
						value={value || ''}
						ref={autoFocus && autofocusInputRef}
						onClick={(e) => {
							setSnap(0)
							e.preventDefault()
							e.stopPropagation()

							setTimeout(() => {
								e.target.focus()
							}, 300)
						}}
						placeholder={'Saint-Malo, Le Conquet, Café du Port...'}
						onChange={({ target: { value } }) => onDestinationChange(value)}
					/>
					{value && (
						<button
							onClick={() => onDestinationChange(null)}
							css={`
								position: absolute;
								right: 0.6rem;
								top: 50%;
								transform: translateY(-50%);
								img {
									width: 0.8rem;
									height: 0.8rem;
								}
								padding: 0;
							`}
						>
							<Image
								src="/close.svg"
								alt="Effacer la recherche"
								width="10"
								height="10"
							/>
						</button>
					)}
				</InputStyle>
			</div>
			{step.inputValue !== '' &&
				(!step.choice || step.choice.inputValue !== step.inputValue) &&
				(step.results ? (
					<div
						css={`
							ul {
								background: var(--darkerColor);
								border-radius: 0.4rem;
								padding: 0.6rem 0;
								list-style-type: none;
								margin-top: 0.2rem;
								${!sideSheet &&
								`
									width: auto
								`}
							}
						`}
					>
						<GeoInputOptions
							{...{
								whichInput: 'vers', // legacy
								data: step,
								updateState: (newData) => {
									setSnap(1)
									// this is questionable; see first comment in this file
									setState(replaceArrayIndex(state, stepIndex, newData))

									console.log('ici', newData)
									const { osmId, featureType, longitude, latitude, name } =
										newData.choice
									const isOsmFeature = osmId && featureType
									setSearchParams({
										allez: setStatePart(
											stepIndex,
											state,
											buildAllezPart(
												name,
												isOsmFeature ? encodePlace(featureType, osmId) : '',
												longitude,
												latitude
											)
										),
										q: undefined,
									})
								},
							}}
						/>
						<label
							css={`
								text-align: right;
								margin: 0 0 auto auto;
								display: block;
								width: 9rem;
								margin-top: 0.2rem;
								background: var(--darkerColor);
								color: white;
								padding: 0rem 0.6rem 0rem;
								border-radius: 0.3rem;
								> span {
									margin-left: 0.4rem;
								}
							`}
						>
							<input
								type="checkbox"
								defaultChecked={localSearch}
								onClick={() => {
									setLocalSearch(!localSearch)
									onInputChange(
										stepIndex,
										!localSearch
									)(state.slice(-1)[0].inputValue)
								}}
							/>
							<span style={css``}>Rechercher ici</span>
						</label>
					</div>
				) : (
					'Chargement..'
				))}
		</div>
	)
}
