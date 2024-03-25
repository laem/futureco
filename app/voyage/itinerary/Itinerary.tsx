import BikeRouteRésumé from '../BikeRouteRésumé'
import { ContentSection } from '../ContentUI'
import { ModalCloseButton } from '../UI'
import Steps from './Steps'
import Transit from './Transit'

export default function Itinerary({
	itinerary,
	bikeRouteProfile,
	setBikeRouteProfile,
	searchParams,
	close,
	state,
}) {
	if (!itinerary.itineraryMode) return null

	return (
		<ContentSection>
			<ModalCloseButton title="Fermer l'encart itinéraire" onClick={close} />
			<Steps state={state} />
			{!itinerary.routes ? (
				<p
					css={`
						margin: 1rem 0;
						text-align: center;
					`}
				>
					Cliquez sur la carte pour construire votre itinéraire.
				</p>
			) : (
				<div>
					{(itinerary.routes.cycling || itinerary.routes.walking) && (
						<BikeRouteRésumé
							{...{
								cycling: itinerary.routes.cycling,
								walking: itinerary.routes.walking,
								data: itinerary.routes,
								bikeRouteProfile,
								setBikeRouteProfile,
							}}
						/>
					)}
					<Transit
						data={{
							...itinerary.routes.transit,
							date: itinerary.date,
							setDate: itinerary.setDate,
						}}
						searchParams={searchParams}
					/>
				</div>
			)}
		</ContentSection>
	)
}
