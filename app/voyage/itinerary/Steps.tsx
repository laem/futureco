import useSetSearchParams from '@/components/useSetSearchParams'
import { Reorder, useDragControls } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'

const defaultItems = ['depuis', 'vers']
export default function Steps({ recherche, state }) {
	const [items, setItems] = useState(defaultItems)

	const setSearchParams = useSetSearchParams()
	const setSearching = (index) => setSearchParams({ recherche: index })

	return (
		<section
			css={`
				margin: 0.6rem 0 2.6rem 0;
			`}
		>
			<Reorder.Group
				axis="y"
				values={items}
				onReorder={setItems}
				css={`
					width: 100%;
					background: var(--lightestColor);
					border-radius: 0.4rem;
					padding: 0.2rem 0.3rem;
					list-style-type: none;
					li {
						padding: 0.1rem 0.2rem;
						border-bottom: 1px solid var(--lighterColor);
						background: var(--lightestColor);
						display: flex;
						align-items: center;
						justify-content: space-between;
					}
					li:last-child {
						border-bottom: none;
					}
				`}
			>
				{items.map((stepKey, index) => (
					<Item
						key={stepKey}
						{...{
							index,
							stepKey,
							stepValue: state[stepKey],
							setSearching,
							beingSearched: recherche == index,
						}}
					/>
				))}
			</Reorder.Group>
		</section>
	)
}

const Item = ({ index, stepKey, stepValue, setSearching, beingSearched }) => {
	const controls = useDragControls()
	return (
		<Reorder.Item
			value={stepKey}
			dragListener={false}
			dragControls={controls}
			css={`
				${beingSearched &&
				`
				background: yellow !important;
				`}
			`}
		>
			<div
				css={`
					display: flex;
					justify-content: start;
					align-items: center;
				`}
			>
				<Icon text={index === 0 ? 'A' : 'B'} />{' '}
				<span onClick={() => setSearching(index)}>
					{beingSearched
						? `Choisissez une ${index == 0 ? 'origine' : 'destination'}`
						: stepValue.inputValue}
				</span>
				{beingSearched && (
					<span>
						{' '}
						<button onClick={() => setSearching(undefined)}>
							<Image
								src="/close.svg"
								width="10"
								height="10"
								alt="Icône croix"
								css={`
									margin-left: 0.4rem;
									filter: invert(1);
								`}
							/>{' '}
							annuler
						</button>
					</span>
				)}
			</div>
			<div onPointerDown={(e) => controls.start(e)} className="reorder-handle">
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
