import { formatValue } from 'publicodes'
export function isIterable<T>(obj: unknown): obj is Iterable<T> {
	return Symbol.iterator in Object(obj)
}
export function capitalise0(name?: string) {
	return name && name[0].toUpperCase() + name.slice(1)
}

export const debounce = <F extends (...args: any[]) => void>(
	waitFor: number,
	fn: F
) => {
	let timeoutId: ReturnType<typeof setTimeout>
	return (...args: any[]) => {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => fn(...args), waitFor)
	}
}

export const fetcher = (url: RequestInfo) => fetch(url).then((r) => r.json())

export function inIframe(): boolean {
	try {
		return window.self !== window.top
	} catch (e) {
		return true
	}
}

export function softCatch<ArgType, ReturnType>(
	fn: (arg: ArgType) => ReturnType
): (arg: ArgType) => ReturnType | null {
	return function (...args) {
		try {
			return fn(...args)
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn(e)
			return null
		}
	}
}

export function mapOrApply<A, B>(fn: (a: A) => B, x: A): B
export function mapOrApply<A, B>(fn: (a: A) => B, x: Array<A>): Array<B>
export function mapOrApply<A, B>(fn: (a: A) => B, x: A | Array<A>) {
	return Array.isArray(x) ? x.map(fn) : fn(x)
}

export function coerceArray<A>(x: A | Array<A>): Array<A> {
	return Array.isArray(x) ? x : [x]
}

export function getSessionStorage() {
	// In some browsers like Brave, even just reading the variable sessionStorage
	// is throwing an error in the iframe, so we can't do things if sessionStorage !== undefined
	// and we need to wrap it in a try { } catch { } logic
	try {
		return window.sessionStorage
	} catch (e) {
		return undefined
	}
}

export const currencyFormat = (language: string) => ({
	isCurrencyPrefixed: !!formatValue(12, { language, displayedUnit: '€' }).match(
		/^€/
	),
	thousandSeparator: formatValue(1000, { language }).charAt(1),
	decimalSeparator: formatValue(0.1, { language }).charAt(1),
})

export function hash(str: string): number {
	let hash = 0
	let chr
	for (let i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i)
		hash = (hash << 5) - hash + chr
		hash |= 0 // Convert to 32bit integer
	}
	return hash
}

export const sortBy = (f) => (list) =>
	list.sort((a, b) => {
		const fa = f(a),
			fb = f(b)
		return fa < fb ? -1 : fa > fb ? 1 : 0
	})

export const last = (array) => {
	const [lastItem] = array.slice(-1)
	return lastItem
}

export function omit(givenKeys, obj) {
	const keys = [...givenKeys]
	if (!keys.length) {
		return obj
	}
	const { [keys.pop()]: omitted, ...rest } = obj

	return omit(keys, rest)
}

export const pipe =
	(...fns) =>
	(x) =>
		fns.reduce((v, f) => f(v), x)

export const defaultTo = (defaultValue, arg) =>
	arg == null ? defaultValue : arg

export const intersection = (arr1, arr2) => arr1.filter((x) => arr2.includes(x))
export const difference = (arr1, arr2) => arr1.filter((x) => !arr2.includes(x))

export const objectMap = (obj, fn) =>
	Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]))
export const objectMapKeys = (obj, fn) =>
	Object.fromEntries(Object.entries(obj).map(([k, v], i) => [fn(k, v, i), v]))

export const objectMapEntries = (obj, fn, filterBoolean) => {
	const entries = Object.entries(obj).map(([k, v], i) => fn(k, v, i))
	const filteredEntries = filterBoolean ? entries.filter(Boolean) : entries
	return Object.fromEntries(filteredEntries)
}

const getRealIndex = (array, index) =>
	index < 0 ? array.length + index : index

export const replaceArrayIndex = (
	array,
	index,
	value,
	strategy = 'replace'
) => {
	const realIndex = getRealIndex(array, index)

	if (realIndex < 0) return [value]

	return array.map((v, i) =>
		i === realIndex ? (strategy === 'merge' ? { ...v, ...value } : value) : v
	)
}

export const getArrayIndex = (array, index) => array[getRealIndex(array, index)]
