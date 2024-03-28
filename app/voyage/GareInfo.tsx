import { useState } from 'react'
import { initialDate } from './itinerary/DateSelector'

export default function GareInfo({ clickedGare }) {
	const [date, setDate] = useState(initialDate())
	console.log(date)
	return (
		<div
			css={`
				display: flex;
				flex-direction: column;
				align-items: center;
				height: 70vh;

				iframe {
					width: 100%;
					border: 6px solid var(--darkerColor);
					height: 100%;
				}
				h2 {
					color: white;
					margin-bottom: 0rem;
					font-size: 120%;
					background: var(--darkerColor);
					width: 100%;
					text-align: center;
					padding: 0.2rem 0;
					max-width: 20rem;
					border-top-left-radius: 0.4rem;
					border-top-right-radius: 0.4rem;
				}
				@media (min-width: 1200px) {
					width: 35rem;
					max-width: 100%;
				}
				> input {
					margin-top: 1rem;
				}
			`}
		>
			<input
				type="datetime-local"
				id="trainDate"
				name="trainDate"
				value={date}
				min={initialDate()}
				onChange={(e) => setDate(e.target.value)}
			/>
			<h2>Gare de {clickedGare.nom}</h2>

			<iframe
				src={`https://tableau-sncf.vercel.app/station/stop_area:SNCF:${clickedGare.uic.slice(
					2
				)}?date=${date}`}
			/>
			<p>Identifiant UIC : {clickedGare.uic}</p>
		</div>
	)
}
