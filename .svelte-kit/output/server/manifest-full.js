export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {"start":"_app/immutable/entry/start.1b784ca0.js","app":"_app/immutable/entry/app.a81a00c7.js","imports":["_app/immutable/entry/start.1b784ca0.js","_app/immutable/chunks/index.9c6289ae.js","_app/immutable/chunks/singletons.865f28da.js","_app/immutable/chunks/index.8d3ee9ed.js","_app/immutable/entry/app.a81a00c7.js","_app/immutable/chunks/index.9c6289ae.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/card",
				pattern: /^\/card\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
