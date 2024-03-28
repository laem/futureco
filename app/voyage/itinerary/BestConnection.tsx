import { Transport } from './Transit'
import Image from 'next/image'

export default function BestConnection({ bestConnection }) {
	console.log('prune best', bestConnection)
	const transport = bestConnection.best.transports.find((t) => t.trip)
	const stop = bestConnection.best.stops[transport.move.range.from].station.name
	return (
		<div
			css={`
				background: white;
				margin: 0.6rem 0;
				border: 2px solid gold;
				padding: 0 0.4rem;
				display: flex;
				align-items: center;
				> img {
					margin: 1rem;
					width: 1.8rem;
					height: auto;
				}
				p {
					line-height: 1.4rem;
				}
			`}
		>
			<Image
				src="/star-full-gold.svg"
				alt="Icône d'étoile couleur or pour le trajet optimal"
				width="10"
				height="10"
			/>
			<div>
				<small>Il y a un trajet optimal</small>
				<p>
					Le direct
					<span
						css={`
							display: inline-block;
							width: 4rem;
							margin: 0 0.4rem;
						`}
					>
						<Transport transport={transport} />
					</span>
					passe <strong>{bestConnection.interval}</strong> à l'arrêt{' '}
					<em
						css={`
							white-space: nowrap;
						`}
					>
						{stop}
					</em>
					.
				</p>
			</div>
		</div>
	)
}
