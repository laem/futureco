import CircularIcon from '@/components/CircularIcon'
import css from '@/components/css/convertToJs'
import { useState } from 'react'
import LightsWarning from './LightsWarning'
import ProfileChooser from './ProfileChooser'

export default function BikeRouteRésumé({
	walking,
	cycling,
	bikeRouteProfile,
	setBikeRouteProfile,
}) {
	const [mode, setMode] = useState('cycling') // TODO set automatically a guessed mode from distance and possibly then user preferences

	if (cycling === 'loading' || walking === 'loading')
		return <div>La roue tourne est en train de tourner</div>
	return (
		<div
			css={`
				position: relative;
				display: flex;
				align-items: center;
				background: var(--lightestColor);
				padding: 0.6rem;
				color: var(--darkestColor);
				line-height: 1.4rem;
				border: ${mode === 'cycling'
					? '4px solid var(--lightColor)'
					: '4px dotted #8f53c1'};
				margin-top: 1.4rem;
				border-radius: 0.5rem;
				@media (min-width: 1200px) {
				}
			`}
		>
			{' '}
			<div
				css={`
					> div {
						position: absolute !important;
						top: 0;
						left: calc(50% - 1rem);
						transform: translateX(-50%) translateY(-70%);
						margin-right: 0.4rem;
						width: 2rem;
						height: auto;
					}
					> div:nth-child(2) {
						left: calc(50% + 1rem);
					}
				`}
			>
				<CircularIcon
					src={'/bike.svg'}
					alt="Icône d'un vélo"
					background={mode !== 'cycling' ? 'lightgrey' : 'var(--lightColor)'}
					onClick={() => setMode('cycling')}
				/>
				<CircularIcon
					src={'/walking.svg'}
					alt="Icône d'une personne qui marche"
					background={mode === 'walking' ? '#8f53c1' : 'lightgrey'}
					onClick={() => setMode('walking')}
				/>
			</div>
			<ModeContent
				{...{
					bikeRouteProfile,
					setBikeRouteProfile,
					mode,
					data: mode === 'cycling' ? cycling : walking,
				}}
			/>
		</div>
	)
}

const ModeContent = ({ mode, data, setBikeRouteProfile, bikeRouteProfile }) => {
	const features = data?.features
	if (!features?.length) return null

	const feature = features[0]
	if (!feature || !feature.properties) return

	const seconds = feature.properties['total-time'],
		distance = feature.properties['track-length'],
		km = Math.round(distance / 1000),
		date = new Date(1000 * seconds).toISOString().substr(11, 8).split(':'),
		heures = +date[0],
		minutes = date[1]

	const déniveléCumulé = feature.properties['filtered ascend']
	const dénivelé = feature.properties['plain-ascend']
	return (
		<div>
			<p>
				À {mode === 'walking' ? 'pieds' : 'vélo'}, le trajet de{' '}
				<strong>{km}&nbsp;km</strong> vous prendra{' '}
				<strong>
					{heures ? heures + ` h et ` : ''}
					{minutes}&nbsp;min
				</strong>{' '}
				pour{' '}
				<strong
					title={`La pente sera de ${(
						(déniveléCumulé / distance) *
						100
					).toFixed(1)}%`}
					style={css(
						`background: ${deniveléColor(
							déniveléCumulé,
							distance
						)}; padding: 0 .2rem; border-radius: 0.3rem;`
					)}
				>
					{déniveléCumulé}&nbsp;m
				</strong>{' '}
				de dénivelé (<small>{dénivelé}&nbsp;m en absolu</small>).
			</p>
			{mode === 'cycling' && (
				<ProfileChooser
					{...{
						bikeRouteProfile,
						setBikeRouteProfile,
					}}
				/>
			)}
			{mode === 'cycling' && feature.geometry.coordinates[0] && (
				<LightsWarning
					longitude={feature.geometry.coordinates[0][0]}
					latitude={feature.geometry.coordinates[0][1]}
				/>
			)}
		</div>
	)
}

const deniveléColors = [
	'Crimson',
	'Salmon',
	'#f7b63f',
	'Moccasin',
	'LightGreen',
]
// TODO this function should be made more complex.
// E.g. tell the user if the ride is mostly flat but has a very hard drop at one
// point
// for sport, see https://fr.wikipedia.org/wiki/Coefficient_de_difficult%C3%A9
const deniveléColor = (height, distance) => {
	const percentage = (height / distance) * 100
	const index =
		percentage > 5
			? 0
			: percentage > 3
			? 1
			: percentage > 2
			? 2
			: percentage > 1
			? 3
			: 4

	const difficulty = Math.round(index)
	return deniveléColors[difficulty]
}
