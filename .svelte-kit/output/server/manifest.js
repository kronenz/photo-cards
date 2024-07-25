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
		client: {"start":"_app/immutable/entry/start.077ea5e5.js","app":"_app/immutable/entry/app.63ac7a0d.js","imports":["_app/immutable/entry/start.077ea5e5.js","_app/immutable/chunks/scheduler.745dea18.js","_app/immutable/chunks/singletons.2d2a0f4a.js","_app/immutable/chunks/index.a342afc0.js","_app/immutable/entry/app.63ac7a0d.js","_app/immutable/chunks/scheduler.745dea18.js","_app/immutable/chunks/index.9ca1c632.js"],"stylesheets":[],"fonts":[]},
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
