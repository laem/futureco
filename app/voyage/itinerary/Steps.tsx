import useSetSearchParams from '@/components/useSetSearchParams'
import { Reorder, useDragControls } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { setStatePart } from '../SetDestination'

export default function Steps({ state }) {
	const steps = state

	console.log('cornflowerblue steps', steps, state)

	const setSearchParams = useSetSearchParams()

	if (!steps?.length) return null

	return (
		<section
			css={`
				margin: 0.6rem 0 2.6rem 0;
			`}
		>
			<Reorder.Group
				axis="y"
				values={steps}
				onReorder={(newItems) => console.log('indigo', newItems)}
				css={`
					width: 100%;
					background: var(--lightestColor);
					border-radius: 0.4rem;
					padding: 0.2rem 0.3rem;
					list-style-type: none;
					li {
						padding: 0.3rem 0.4rem;
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
				{steps.map((step, index) => (
					<Item
						key={step?.key || index}
						{...{
							index,
							step,
							setSearchParams,
							beingSearched: step === null || (!step.key && step.inputValue),
							state,
						}}
					/>
				))}
			</Reorder.Group>
		</section>
	)
}

const Item = ({ index, step, setSearchParams, beingSearched, state }) => {
	const controls = useDragControls()
	const [undoValue, setUndoValue] = useState(null)
	return (
		<Reorder.Item
			value={step?.key || index}
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
					> span {
						line-height: 1.2rem;
					}
				`}
			>
				<Icon text={index === 0 ? 'A' : 'B'} />{' '}
				<span
					onClick={() => {
						step && setUndoValue(step.key)
						setSearchParams({
							allez: setStatePart(step.key, state, ''),
						})
					}}
				>
					{beingSearched
						? `Choisissez une ${index == 0 ? 'origine' : 'destination'}`
						: step?.name || 'plop'}
				</span>
				{undoValue != null && beingSearched && (
					<span>
						{' '}
						<button
							onClick={() =>
								setSearchParams({
									allez: setStatePart(step.key, state, undoValue),
								})
							}
						>
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
				background: var(--color);
				width: 5px;
				border-radius: 5px;
				height: 5px;
				margin: 1px;
			}
		`}
	>
		{[...new Array(9)].map((index) => (
			<span key={index}></span>
		))}
	</span>
)
