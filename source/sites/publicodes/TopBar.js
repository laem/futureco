import { React, emoji } from 'Components'
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import scenarios from './scenarios.yaml'
import { StoreContext } from './StoreContext'
import { withRouter } from 'react-router'

export default withRouter(({ location }) => {
	let {
			state: { scenario: scenarioName }
		} = useContext(StoreContext),
		scenario = scenarios[scenarioName],
		displayIntro = ['/', '/contribuer/', '/à-propos'].includes(
			location.pathname
		)

	return (
		<section
			css={`
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding-top: ${displayIntro ? 3 : 1}rem;
			`}>
			<Link to="/">
				<img
					css={`
						width: ${displayIntro ? '6rem' : '5em'};
						@media (min-width: 800px) {
							width: ${displayIntro ? '8em' : '5em'};
						}
						margin-right: 1em;
					`}
					src={require('./logo.png')}
				/>
			</Link>
			{displayIntro && (
				<p id="intro" css="max-width: 28rem; line-height: 1.4rem">
					La <strong>catastrophe climatique</strong> n'est plus une menace
					lointaine, c'est une <strong>actualité</strong>. Que faire ? Chacun de
					nos gestes a un impact, découvrez-le !{' '}
					<Link to="/à-propos">En savoir plus</Link>.{' '}
				</p>
			)}
			{displayIntro && (
				<div
					css={`
						position: fixed;
						width: 100%;
						left: 0;
						top: 0;
						background: yellow;
						text-align: center;
						font-size: 90%;
						padding: 0.2em 0;
					`}>
					{emoji('')} Version beta : n'hésitez pas à tester ce site, mais sachez
					que les données ne sont pas encore validées
				</div>
			)}
			{!displayIntro && (
				<div
					className="ui__ card"
					css={`
						text-align: center;
						padding: 0.6rem 1rem !important;
					`}>
					Votre choix de futur
					<div
						css={`
							img {
								font-size: 200%;
							}
						`}>
						{emoji(scenario.icône)}
					</div>
					<Link to="/scénarios">changer</Link>
				</div>
			)}
		</section>
	)
})
