import { Reorder, useDragControls } from 'framer-motion'
import { useState } from 'react'

const defaultItems = ['Rennes', 'Saint-Malo']
export default function Steps({}) {
	const [items, setItems] = useState(defaultItems)
	return (
		<Reorder.Group
			axis="y"
			values={items}
			onReorder={setItems}
			css={`
				width: 100%;
				background: var(--lightestColor);
				border-radius: 0.4rem;
				padding: 0 0.3rem;
				list-style-type: none;
				li {
					padding: 0.1rem 0;
					border-bottom: 1px solid var(--lighterColor);
					display: flex;
					align-items: center;
					justify-content: space-between;
				}
				li:last-child {
					border-bottom: none;
				}
			`}
		>
			{items.map((item, index) => (
				<Item key={item} {...{ index, text: item }} />
			))}
		</Reorder.Group>
	)
}

const Item = ({ index, text }) => {
	const controls = useDragControls()
	return (
		<Reorder.Item value={text} dragListener={false} dragControls={controls}>
			<Icon text={index === 0 ? 'A' : 'B'} /> {text}
			<div onPointerDown={(e) => controls.start(e)}>
				<Dots />
			</div>
		</Reorder.Item>
	)
}

const Icon = ({ text }) => (
	<span
		css={`
			display: inline-block;
			margin: 0 0.4rem 0 0;
			background: var(--color);
			color: white;
			width: 1.4rem;
			text-align: center;
			height: 1.4rem;
			line-height: 1.4rem;
			border-radius: 2rem;
		`}
	>
		{text}
	</span>
)

const Dots = () => (
	<span
		css={`
			cursor: pointer;
			display: inline-flex;
			width: 1.4rem;
			height: 1.4rem;
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			span {
				display: block;
				width: 0.3rem;
				border-radius: 0.2rem;
				height: 0.3rem;
				margin: 0.05rem;
				background: var(--color);
			}
		`}
	>
		{[...new Array(9)].map((index) => (
			<span key={index}></span>
		))}
	</span>
)
