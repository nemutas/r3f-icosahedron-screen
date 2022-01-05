export const publicPath = (path: string) => {
	const p = path.startsWith('/') ? path : `/${path}`
	return process.env.PUBLIC_URL + p
}
