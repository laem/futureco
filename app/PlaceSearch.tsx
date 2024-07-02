import GeoInputOptions from '@/components/GeoInputOptions'
import { InputStyle } from '@/components/InputStyle'
import css from '@/components/css/convertToJs'
import { getArrayIndex, replaceArrayIndex } from '@/components/utils/utils'
import { buildAddress } from '@/components/Address'
import fetchPhoton from '@/components/fetchPhoton'
import Logo from '@/public/logo.svg'
import { isIOS } from '@react-aria/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useLocalStorage } from 'usehooks-ts'
import { buildAllezPart, setAllezPart } from './SetDestination'
import { hasStepBeingSearched } from './itinerary/Steps'
import { encodePlace } from './utils'
import { close } from '@/components/icons/close'
import { Loader } from '@/components/loader'

// The idead here was to enable triggering of geoloc with an input. Not
// exectuted, there is a button now.
const positionTriggers = ['ma pos', 'position', 'ici', 'géoloc', 'geoloc']

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
	geolocation,
	placeholder,
}) {
	if (stepIndex == null) throw new Error('Step index necessary')
	const [localSearch, setLocalSearch] = useState(true)
	const [searchHistory, setSearchHistory] = useLocalStorage('searchHistory', [])

	const urlSearchQuery = searchParams.q
	const step = getArrayIndex(state, stepIndex) || {
		results: [],
		inputValue: '',
	}
	const value = step.inputValue

	const autofocusInputRef = useAutoFocus(),
		ref = useRef()

	const inputRef = autoFocus ? autofocusInputRef : ref
	// doesn't work :
	const inputHasFocus = document.activeElement === inputRef.current
	// hence this, but does it work with autofocus from triggered indirectly by
	// the Steps component ?
	const [isMyInputFocused, instantaneousSetIsMyInputFocused] = useState(false)

	//
	useEffect(() => {
		// the onClick below doesn't work on iOS, and this technique produces worse
		// results on Android Firefox and especially chrome
		if (!isIOS()) return
		if (!isMyInputFocused) return
		setSnap(0, 'PlaceSearch')
	}, [isMyInputFocused, setSnap])

	const setIsMyInputFocused = (value) => {
		// click on suggestion would close the suggestion before it works haha dunno
		// why
		setTimeout(() => instantaneousSetIsMyInputFocused(value), 300)
	}

	const onInputChange =
		(stepIndex = -1, localSearch = false) =>
		(v) => {
			const oldStateEntry = state[stepIndex]
			const stateEntry = {
				...(oldStateEntry?.results?.length && v == null
					? { results: null }
					: {}),
				...(v === '' ? {} : { inputValue: v }),
			}
			const safeStateEntry =
				Object.keys(stateEntry).length > 0 ? stateEntry : null

			console.log('will call replaceArrayIndex', state, stepIndex)
			const newState = replaceArrayIndex(
				state,
				stepIndex,
				safeStateEntry
				//validated: false, // TODO was important or not ? could be stored in each state array entries and calculated ?
			)
			setState(newState)
			if (v?.length > 2) {
				const hash = window.location.hash,
					local = hash && hash.split('/').slice(1, 3)

				fetchPhoton(v, setState, stepIndex, localSearch && local, zoom)
			}
		}
	const onDestinationChange = onInputChange(stepIndex, localSearch)

	useEffect(() => {
		if (!urlSearchQuery || value) return

		onDestinationChange(urlSearchQuery)
	}, [urlSearchQuery, onDestinationChange, value])

	const [tutorials, setTutorials] = useLocalStorage('tutorials', {})
	const introductionRead = tutorials.introduction

	return (
		<div>
			<div
				css={`
					display: flex;
					justify-content: center;
					align-items: center;
					margin-bottom: 0.4rem;

					> button {
						margin: 0;
						padding: 0;
						margin-right: 0.4rem;
						> img {
							width: 2rem;
							height: auto;
							vertical-align: middle;
						}
					}
					margin-top: 0.2rem;
					${sideSheet && `margin: .4rem 0`}
				`}
			>
				<button
					title="À propos de Cartes"
					onClick={() =>
						setTutorials((tutorials) => ({
							...tutorials,
							introduction: !tutorials.introduction,
						}))
					}
				>
					<Image src={Logo} alt="Logo de Cartes.app" width="100" height="100" />
				</button>
				<InputStyle
					css={`
						color: white;
						input {
							max-width: 22rem;
							width: 83vw;
							background: var(--lightestColor);
							color: var(--darkColor);
							border: none;
							margin-bottom: 0;
							outline: 0.15rem solid
								${hasStepBeingSearched(state) ? 'yellow' : 'var(--lightColor)'} !important;
						}
						position: relative;
					`}
				>
					<input
						type="text"
						value={value || ''}
						onBlur={() => setIsMyInputFocused(false)}
						onFocus={() => setIsMyInputFocused(true)}
						ref={inputRef}
						onClick={(e) => {
							setSnap(0, 'PlaceSearch')
							/*
							// Old comment :
							// --------------
							// Combining two calls hits the sweet spot between chrome and
							// firefox on android. I couldn't test on safari iOS yet.
							// On firefox, the click on input triggers the keyboard, which
							// makes the modal sheet rerender and lose its 0 snap. Hence the
							// second snap after timeout.
							// On chrome, the first step works correctly, but without this
							// first setSnap, the modal sheet will go way further than the top
							// of the screen ! Strange behaviors.
							// What's written here is interesting but not conclusive for us yet https://github.com/Temzasse/react-modal-sheet?tab=readme-ov-file#%EF%B8%8F-virtual-keyboard-avoidance
							// New comment :
							// ---------
							// We solved this by a hacky useEffect to keep the modal sheet
							// snap when the browser height changes. See ModalSheet.
							//
							setTimeout(() => {
								setSnap(0, 'PlaceSearch')
								e.target.focus()
							}, 600)
							*/
						}}
						placeholder={
							placeholder || 'Saint-Malo, Le Conquet, Café du Port...'
						}
						onChange={({ target: { value } }) => onDestinationChange(value)}
					/>
					{value && (
						<button
							onClick={() => onDestinationChange(null)}
							css={`
								position: absolute;
								right: 5px;
								top: 50%;
								transform: translateY(-50%);
								height: 30px;
								width: 30px;
								padding: 7px;
								color: var(--darkerColor);
							`}
						>
							{close}
						</button>
					)}
				</InputStyle>
			</div>
			<div>
				{state.length > 1 &&
					stepIndex === 0 && // TODO for VIA geolocal, less prioritary
					(geolocation ? (
						<Link
							href={setSearchParams(
								{
									allez:
										buildAllezPart(
											'Ma position',
											null,
											geolocation.longitude,
											geolocation.latitude
										) + searchParams.allez,
								},
								true
							)}
						>
							Depuis ma position
						</Link>
					) : (
						<button onClick={() => setSearchParams({ geoloc: 'oui' })}>
							<span
								css={`
									background-position: 50%;
									background-repeat: no-repeat;
									display: block;
									display: inline-block;
									width: 1rem;
									height: 1rem;
									margin-right: 0.4rem;
									vertical-align: sub;
									background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='29' height='29' fill='%23333' viewBox='0 0 20 20'%3E%3Cpath d='M10 4C9 4 9 5 9 5v.1A5 5 0 0 0 5.1 9H5s-1 0-1 1 1 1 1 1h.1A5 5 0 0 0 9 14.9v.1s0 1 1 1 1-1 1-1v-.1a5 5 0 0 0 3.9-3.9h.1s1 0 1-1-1-1-1-1h-.1A5 5 0 0 0 11 5.1V5s0-1-1-1m0 2.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 1 1 0-7'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3C/svg%3E");
								`}
							/>
							Me géolocaliser
						</button>
					))}
			</div>
			{step.inputValue === '' &&
				isMyInputFocused &&
				searchHistory.length > 0 && (
					<SearchResultsContainer $sideSheet={sideSheet}>
						<div
							css={`
								display: flex;
								justify-content: center;
								align-items: center;
								img {
									width: 0.9rem;
									height: auto;
									vertical-align: sub;
								}
							`}
						>
							<small>Historique</small>
							<button
								onClick={() => setSearchHistory([])}
								title="Effacer l'historique"
							>
								<Image
									src="/trash.svg"
									width="10"
									height="10"
									alt="Icône poubelle"
								/>
							</button>
						</div>
						<ul
							css={`
								li:not(:last-of-type) {
									border-bottom: 1px solid var(--lightestColor);
								}
								li {
									padding: 0.4rem 0;
									list-style-type: none;
									font-size: 90%;
									line-height: 130%;
								}
								li:hover {
									background: var(--lightestColor);
								}
							`}
						>
							{searchHistory.map((entry) => (
								<li key={entry}>
									<button onClick={() => onDestinationChange(entry)}>
										{entry}
									</button>
								</li>
							))}
						</ul>
					</SearchResultsContainer>
				)}
			{step.inputValue !== '' &&
				(!step.choice || step.choice.inputValue !== step.inputValue) && (
					<div>
						{step.results ? (
							<SearchResultsContainer $sideSheet={sideSheet}>
								{step.results.length > 0 ? (
									<GeoInputOptions
										{...{
											whichInput: 'vers', // legacy
											data: step,
											updateState: (newData) => {
												setSnap(1, 'PlaceSearch')
												// this is questionable; see first comment in this file
												const newState = replaceArrayIndex(
													state,
													stepIndex,
													newData
												)
												setState(newState)
												setSearchHistory([
													value,
													...searchHistory.filter((entry) => entry !== value),
												])

												console.log('ici', newData)
												const {
													osmId,
													featureType,
													longitude,
													latitude,
													name,
												} = newData.choice

												const address = buildAddress(newData.choice, true)
												const isOsmFeature = osmId && featureType
												setSearchParams({
													allez: setAllezPart(
														stepIndex,
														newState,
														buildAllezPart(
															name || address,
															isOsmFeature
																? encodePlace(featureType, osmId)
																: '',
															longitude,
															latitude
														)
													),
													q: undefined,
												})
											},
										}}
									/>
								) : (
									<div
										css={`
											text-align: center;
										`}
									>
										<i>Aucun résultat pour la recherche “{value}”</i>.
									</div>
								)}
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
									<span>Rechercher ici</span>
								</label>
							</SearchResultsContainer>
						) : (
							<div
								css={`
									font-size: 90%;
									text-align: center;
									margin: 20px 0;
								`}
							>
								<Loader>
									<i>Recherche en cours</i>
								</Loader>
							</div>
						)}
					</div>
				)}
		</div>
	)
}

const SearchResultsContainer = styled.div`
	ul {
		border-radius: 0.4rem;
		padding: 0;
		list-style-type: none;
		margin-top: 0.2rem;
		${(p) =>
			!p.$sideSheet &&
			`
									width: auto
								`}
	}
`
