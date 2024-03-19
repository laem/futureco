import { useCallback, useEffect, useRef, useState } from 'react'
import Sheet, { SheetRef } from 'react-modal-sheet'
import styled from 'styled-components'
import Content from './Content'
import ModalSheetReminder from './ModalSheetReminder'

const snapPoints = [-50, 0.5, 150, 100, 0],
	initialSnap = 3

export default function ModalSheet(props) {
	const [trackedSnap, setTrackedSnap] = useState(initialSnap)
	const [isOpen, setOpen] = useState(false)
	console.log('prune', isOpen)
	const ref = useRef<SheetRef>()
	const setSnap = useCallback(
		(i: number) => {
			console.log('snapp to ' + i)

			console.log('modal sheet ref current', ref.current)
			ref.current?.snapTo(i)
		},
		[ref]
	)
	useEffect(() => {
		// https://github.com/Temzasse/react-modal-sheet/issues/146
		setTimeout(() => setOpen(true), 1)
	}, [setOpen])

	useEffect(() => {
		if (!props.osmFeature && !props.styleChooser) return

		setOpen(true)
		const timeout = () => {
			setSnap(1)
		}
		setTimeout(timeout, 400)
		return () => {
			clearTimeout(timeout)
		}
	}, [setSnap, props.osmFeature, props.styleChooser])

	return (
		<>
			{!isOpen && <ModalSheetReminder setOpen={setOpen} />}
			<CustomSheet
				ref={ref}
				isOpen={isOpen}
				onClose={() => {
					setOpen(false)
				}}
				snapPoints={snapPoints}
				initialSnap={initialSnap}
				mountPoint={document.querySelector('main')}
				onSnap={(snapIndex) => {
					console.log('> Current snap point index:', snapIndex)
					setTrackedSnap(snapIndex)
				}}
			>
				<Sheet.Container
					css={`
						background-color: var(--lightestColor2) !important;
					`}
				>
					<Sheet.Header
						css={`
							span {
								background-color: var(--lighterColor) !important;
							}
						`}
					/>
					<Sheet.Content>
						<Sheet.Scroller draggableAt="both">
							<SheetContentWrapper>
								<Content
									{...props}
									sideSheet={false}
									snap={trackedSnap}
									setSnap={setSnap}
									openSheet={setOpen}
								/>
							</SheetContentWrapper>
						</Sheet.Scroller>
					</Sheet.Content>
				</Sheet.Container>
				<Sheet.Backdrop />
			</CustomSheet>
		</>
	)
}
const SheetContentWrapper = styled.div`
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 0rem 0.6rem;
`
const CustomSheet = styled(Sheet)`
	.react-modal-sheet-backdrop {
		background-color: unset !important;
	}
	.react-modal-sheet-container {
		/* custom styles */
	}
	.react-modal-sheet-header {
		/* custom styles */
		height: 2.6rem !important;
	}
	.react-modal-sheet-drag-indicator {
		/* custom styles */
	}
	.react-modal-sheet-content {
		/* custom styles */
	}
	color: var(--darkestColor);
`
