'use client'

import useMeasureDistance from '@/app/voyage/useMeasureDistance'
import Link from 'next/link'
import styled from 'styled-components'
import css from '../css/convertToJs'
import useSetSearchParams from '../useSetSearchParams'
import { omit } from '../utils/utils'
import ItineraryButton, { ResetIcon } from './itinerary/ItineraryButton'

export const MapButtonsWrapper = styled.div`
	position: fixed;
	top: 12rem;
	right: 0.6rem;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: end;
`
export const MapButton = styled.div`
	margin-bottom: 0.4rem;
	width: 1.9rem;
	height: 1.9rem;
	text-align: center;
	border-radius: 4px;
	box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
	padding: 0.1rem;
	background: #ffffff85;
	img {
		width: 1.5rem;
		height: auto;
		vertical-align: bottom;
	}
	border: 0px solid lightgrey;
	cursor: pointer;
	${(p) =>
		p.$active &&
		`

	border: 3px solid var(--color);
	width: 4rem;
height: 4rem;

	`}
	position: relative;
	> button:first-child {
		width: 100%;
		height: 100%;
		padding: 0;
		margin: 0;
	}
	a {
		text-decoration: none;
		color: inherit;
	}
`

export default function MapButtons({
	styleChooser,
	setStyleChooser,
	style,
	setDistanceMode,
	distanceMode,
	map,
	itinerary,
	searchParams,
}) {
	const [distance, resetDistance] = useMeasureDistance(map, distanceMode)
	const setSearchParams = useSetSearchParams()
	return (
		<MapButtonsWrapper>
			<MapButton>
				<Link
					href={setSearchParams(
						{
							...omit(['transports'], searchParams),
							...(searchParams.transports ? {} : { transports: 'oui' }),
						},
						true,
						true
					)}
				>
					<img
						src={'/transports.svg'}
						css={`
							filter: none !important;
						`}
					/>
				</Link>
			</MapButton>
			<MapButton>
				<button
					onClick={() => setStyleChooser(!styleChooser)}
					title={'Choisir un autre style de fond de carte'}
				>
					<MapIcon />
				</button>
			</MapButton>
			<MapButton $active={distanceMode}>
				<button onClick={() => setDistanceMode(!distanceMode)}>
					<div>
						<DistanceIcon />
					</div>
					{distanceMode ? <small>{distance}</small> : null}
				</button>
				{distanceMode && (
					<button
						onClick={() => resetDistance()}
						css={`
							position: absolute;
							bottom: -0.5rem;
							right: -1.7rem;
						`}
					>
						<ResetIcon />
					</button>
				)}
			</MapButton>
			<ItineraryButton {...itinerary} />
			<MapButton>
				<Link
					href={setSearchParams(
						{
							...omit(['favoris'], searchParams),
							...(searchParams.favoris ? {} : { favoris: 'oui' }),
						},
						true,
						true
					)}
				>
					<img
						src={'/star.svg'}
						css={`
							filter: none !important;
						`}
					/>
				</Link>
			</MapButton>
		</MapButtonsWrapper>
	)
}
export const MapIcon = () => (
	<img
		style={css`
			width: 1.4rem;
			height: 1.4rem;
			margin: 0 !important;
		`}
		src={'/map.svg'}
		width="100"
		height="100"
		alt="Icône fond de carte"
	/>
)
export const DistanceIcon = () => (
	<img
		style={css`
			width: 1.4rem;
			height: 1.4rem;
			margin: 0 !important;
		`}
		src={'/distance.svg'}
		width="100"
		height="100"
		alt="Icône distance"
	/>
)
