import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	if (process.env.VOYAGE === 'oui') {
		return {
			name: 'Cartes',
			short_name: 'Cartes',
			lang: 'fr',
			id: 'cartes.app',
			description:
				'Cartes libres et gratuites sur le Web pour trouver un commerce, un lieu, visiter une ville, calculer un trajet à pieds, en vélo, en transport en commun, en train.',
			categories: ['navigation', 'travel'],
			start_url: '/',
			display: 'fullscreen',
			background_color: '#fff',
			theme_color: '#2988e6',
			icons: [
				{
					src: 'https://cartes.app/voyage.svg',
					sizes: '48x48 72x72 96x96 128x128 256x256',
					type: 'image/svg+xml',
					purpose: 'any',
				},
				{
					src: 'https://cartes.app/icon-192.png',
					sizes: '192x192',
					type: 'image/png',
				},
			],
		}
	} else
		return {
			name: 'Futureco',
			short_name: 'Futureco',
			lang: 'fr',
			id: 'futureco',
			description: "Découvrez l'empreinte des gestes de votre quotidien",
			categories: ['environment'],
			start_url: '/',
			display: 'fullscreen',
			background_color: '#fff',
			theme_color: '#2988e6',
			icons: [
				{
					src: 'https://futur.eco/logo.svg',
					sizes: '48x48 72x72 96x96 128x128 256x256',
					type: 'image/svg+xml',
					purpose: 'any',
				},
				{
					src: 'https://futur.eco/logo.png',
					sizes: '192x192',
					type: 'image/png',
				},
			],
		}
}
