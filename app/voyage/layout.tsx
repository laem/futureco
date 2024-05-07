import { Metadata } from 'next'
import css from '@/components/css/convertToJs'

const title = `Voyagez, autrement.`
const description1 =
	"Comment voyager sans voiture ? Comment gérer les derniers kilomètres après l'arrivée à la gare ? Comment se déplacer pendant le weekend ? Où louer une voiture ou un vélo ? On vous guide, pour que le voyage sans voiture personnelle soit un plaisir."

export const objectives = ['voyage . trajet voiture . coût trajet par personne']

export async function generateMetadata(
	{ params, searchParams }: Props,
	parent?: ResolvingMetadata
): Promise<Metadata> {
	const image = `/voyagevoyage.png`
	return {
		title,
		description: description1,
		metadataBase: new URL('https://cartes.app'),
		openGraph: {
			images: [image],
			type: 'article',
			publishedTime: '2023-11-01T00:00:00.000Z',
		},
	}
}
export default function ({ children }) {
	return (
		<div
			style={css`
				background: #dfecbe;
				min-height: 100vh;
			`}
		>
			{children}
		</div>
	)
}