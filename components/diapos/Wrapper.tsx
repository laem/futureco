'use client'

import styled from 'styled-components'

export const DiapoWrapper = styled.div`
	color: var(--darkerColor);
	font-size: 150%;
	ul,
	ol {
		li {
			margin: 1rem;
		}
	}
	> section {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100vh;
		justify-content: center;
		border-bottom: 1px solid var(--lightestColor);
	}

	h2,
	h3,
	h4 {
		font-size: 400%;
		display: inline-block;
		margin: 4rem 0;
		line-height: 3rem;
	}
	h2 {
		font-size: 300%;
	}
	h3 {
		font-size: 220%;
	}
	h4 {
		font-size: 180%;
	}
	h5 {
		font-size: 140%;
		margin: 2rem 0;
	}
	p {
		margin: 0.8rem 0;
	}
	img {
		display: block;
		max-width: 90vw;
		max-height: 60vh;
		margin: 1rem auto;
		border-radius: 0.6rem;
	}

	aside {
		width: 100%;
		position: absolute;
		bottom: 4vh;
		left: 0;
		color: #bbb;
		text-align: center;
		font-size: 80%;
		display: block;
	}
	em {
		/* https://max.hn/thoughts/how-to-create-a-highlighter-marker-effect-in-css */
		font-style: normal;
		margin: 0 -0.1rem;
		padding: 0.1em 0.4em;
		border-radius: 0.8em 0.3em;
		background: transparent;
		background-image: linear-gradient(
			to right,
			rgba(87, 191, 245, 0.1),
			rgba(87, 191, 245, 0.6) 4%,
			rgba(87, 191, 245, 0.25)
		);
		-webkit-box-decoration-break: clone;
		box-decoration-break: clone;
		text-wrap: nowrap;
	}
	blockquote {
		max-width: 80%;
	}
`

export const ImageGrid = ({
	images,
	orientation = 'landscape',
	wrap = 'nowrap',
}) => {
	return (
		<ul
			css={`
				max-height: 90%;
				display: flex;
				flex-wrap: ${wrap};
				justify-content: center;
				padding: 0 5%;
				list-style-type: none;
				gap: 6%;
				align-items: center;
				flex-grow: 1;
				flex-basis: 0;
				li {
					img {
						${orientation === 'landscape'
							? `
						max-height: 35vh;
						`
							: `max-width: 20vw;`}
						display: block;
						object-fit: cover;
					}
				}
			`}
		>
			{images.map((image) => (
				<li key={image.img}>
					<a href={image.url}>
						<img src={image.img} />
					</a>
				</li>
			))}
		</ul>
	)
}
