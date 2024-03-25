import Content from './Content'

export default function SideSheet(props) {
	return (
		<div
			css={`
				background-color: var(--lightestColor2) !important;
				width: 26rem;
				margin-top: 1rem;
				padding: 0.4rem 0.6rem;
				border-radius: 0.6rem;
				max-height: 90vh;
				overflow: scroll;
				--shadow-color: 47deg 23% 58%;
				--shadow-elevation-medium: 0.3px 0.5px 0.7px
						hsl(var(--shadow-color) / 0.36),
					0.8px 1.6px 2px -0.8px hsl(var(--shadow-color) / 0.36),
					2.1px 4.1px 5.2px -1.7px hsl(var(--shadow-color) / 0.36),
					5px 10px 12.6px -2.5px hsl(var(--shadow-color) / 0.36);
				box-shadow: var(--shadow-elevation-medium);
				overflow: auto;
				&::-webkit-scrollbar {
					display: none;
				}
			`}
		>
			<Content {...props} sideSheet={true} />
		</div>
	)
}
