'use client'
import { useEffect, useState } from 'react'
import { Trans } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import Emoji from './Emoji'

type SearchButtonProps = {
	invisibleButton?: boolean
}

export default function SearchButton({ invisibleButton }: SearchButtonProps) {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!(e.ctrlKey && e.key === 'k')) return
			setVisible(true)

			e.preventDefault()
			return false
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [])

	const close = () => setVisible(false)

	return visible ? (
		<Navigate to="/documentation" />
	) : (
		<button
			className="ui__ simple small button"
			css={invisibleButton ? 'display: none !important' : ''}
			onClick={() => setVisible(true)}
		>
			<Emoji e="🔍" /> <Trans>Rechercher</Trans>
		</button>
	)
}
