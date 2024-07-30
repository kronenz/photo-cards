import { c as create_ssr_component, s as setContext, v as validate_component, m as missing_component } from "./index3.js";
let base = "";
let assets = base;
const initial = { base, assets };
function reset() {
  base = initial.base;
  assets = initial.assets;
}
function set_assets(path) {
  assets = initial.assets = path;
}
let public_env = {};
function set_private_env(environment) {
}
function set_public_env(environment) {
  public_env = environment;
}
function afterUpdate() {
}
function set_building() {
}
const Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { constructors } = $$props;
  let { components = [] } = $$props;
  let { form } = $$props;
  let { data_0 = null } = $$props;
  let { data_1 = null } = $$props;
  let { data_2 = null } = $$props;
  {
    setContext("__svelte__", stores);
  }
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.constructors === void 0 && $$bindings.constructors && constructors !== void 0)
    $$bindings.constructors(constructors);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  if ($$props.data_0 === void 0 && $$bindings.data_0 && data_0 !== void 0)
    $$bindings.data_0(data_0);
  if ($$props.data_1 === void 0 && $$bindings.data_1 && data_1 !== void 0)
    $$bindings.data_1(data_1);
  if ($$props.data_2 === void 0 && $$bindings.data_2 && data_2 !== void 0)
    $$bindings.data_2(data_2);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    {
      stores.page.set(page);
    }
    $$rendered = `



${constructors[1] ? `${validate_component(constructors[0] || missing_component, "svelte:component").$$render(
      $$result,
      { data: data_0, this: components[0] },
      {
        this: ($$value) => {
          components[0] = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${constructors[2] ? `${validate_component(constructors[1] || missing_component, "svelte:component").$$render(
            $$result,
            { data: data_1, this: components[1] },
            {
              this: ($$value) => {
                components[1] = $$value;
                $$settled = false;
              }
            },
            {
              default: () => {
                return `${validate_component(constructors[2] || missing_component, "svelte:component").$$render(
                  $$result,
                  { data: data_2, form, this: components[2] },
                  {
                    this: ($$value) => {
                      components[2] = $$value;
                      $$settled = false;
                    }
                  },
                  {}
                )}`;
              }
            }
          )}` : `${validate_component(constructors[1] || missing_component, "svelte:component").$$render(
            $$result,
            { data: data_1, form, this: components[1] },
            {
              this: ($$value) => {
                components[1] = $$value;
                $$settled = false;
              }
            },
            {}
          )}`}`;
        }
      }
    )}` : `${validate_component(constructors[0] || missing_component, "svelte:component").$$render(
      $$result,
      { data: data_0, form, this: components[0] },
      {
        this: ($$value) => {
          components[0] = $$value;
          $$settled = false;
        }
      },
      {}
    )}`}

${``}`;
  } while (!$$settled);
  return $$rendered;
});
const options = {
  app_template_contains_nonce: false,
  csp: { "mode": "auto", "directives": { "upgrade-insecure-requests": false, "block-all-mixed-content": false }, "reportOnly": { "upgrade-insecure-requests": false, "block-all-mixed-content": false } },
  csrf_check_origin: true,
  track_server_fetches: false,
  embedded: false,
  env_public_prefix: "PUBLIC_",
  env_private_prefix: "",
  hooks: null,
  // added lazily, via `get_hooks`
  preload_strategy: "modulepreload",
  root: Root,
  service_worker: false,
  templates: {
    app: ({ head, body, assets: assets2, nonce, env }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n\n		<meta charset="utf-8" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		<!-- meta -->\n		<title>야구 Cards CSS Holographic Effect</title>\n		<meta name="description" content="야구 카드 온라인" />\n		\n		<link rel="canonical" href="https://30aa-210-113-225-166.ngrok-free.app" />\n		<link rel="icon" href="' + assets2 + '/favicon.png" />\n		<meta name="thumbnail" content="thumb.png" />\n\n		<!-- <meta property="og:url" content="https://30aa-210-113-225-166.ngrok-free.app" />\n		<meta property="og:type" content="website" />\n		<meta property="og:title" content="야구 Cards CSS Holographic Effect" />\n		<meta property="og:description" content="야구 카드 온라인" />\n		<meta property="og:image" content="https://i.ibb.co/dPpfZ1W/Monosnap-Poke-mon-Cards-CSS-Holographic-Effect-2024-07-25-14-37-42.png" />\n\n		<meta name="twitter:title" content="야구 Cards CSS Holographic Effect">\n		<meta name="twitter:description" content="야구 카드 온라인">\n		<meta name="twitter:image" content="https://i.ibb.co/dPpfZ1W/Monosnap-Poke-mon-Cards-CSS-Holographic-Effect-2024-07-25-14-37-42.png">\n		<meta name="twitter:card" content="summary_large_image">\n		<meta name="twitter:site" content="@simeydotme"> -->\n\n		<!-- fonts -->\n		<link rel="preconnect" href="https://fonts.googleapis.com">\n		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,300;0,700;1,300;1,700&family=Roboto:ital,wght@0,300;0,700;1,300;1,700&display=swap"> \n		\n		<!-- styles -->\n		<link rel="stylesheet" href="../public/css/global.css" />\n		\n		<link rel="stylesheet" href="../public/css/cards/base.css" />\n		<link rel="stylesheet" href="../public/css/cards.css" />\n		<link rel="stylesheet" href="../public/css/cards/basic.css" />\n		<link rel="stylesheet" href="../public/css/cards/reverse-holo.css" />\n		<link rel="stylesheet" href="../public/css/cards/regular-holo.css" />\n		<link rel="stylesheet" href="../public/css/cards/cosmos-holo.css" />\n		<link rel="stylesheet" href="../public/css/cards/amazing-rare.css" />\n		<link rel="stylesheet" href="../public/css/cards/radiant-holo.css" />\n		<link rel="stylesheet" href="../public/css/cards/v-regular.css" />\n		<link rel="stylesheet" href="../public/css/cards/v-full-art.css" />\n		<link rel="stylesheet" href="../public/css/cards/v-max.css" />\n		<link rel="stylesheet" href="../public/css/cards/v-star.css" />\n		<link rel="stylesheet" href="../public/css/cards/trainer-full-art.css" />\n		<link rel="stylesheet" href="../public/css/cards/rainbow-holo.css" />\n		<link rel="stylesheet" href="../public/css/cards/rainbow-alt.css" />\n		<link rel="stylesheet" href="../public/css/cards/secret-rare.css" />\n		<link rel="stylesheet" href="../public/css/cards/trainer-gallery-holo.css" />\n		<link rel="stylesheet" href="../public/css/cards/trainer-gallery-v-regular.css" />\n		<link rel="stylesheet" href="../public/css/cards/trainer-gallery-v-max.css" />\n		<link rel="stylesheet" href="../public/css/cards/trainer-gallery-secret-rare.css" />\n		<link rel="stylesheet" href="../public/css/cards/shiny-rare.css" />\n		<link rel="stylesheet" href="../public/css/cards/shiny-v.css" />\n		<link rel="stylesheet" href="../public/css/cards/shiny-vmax.css" />\n		<link rel="stylesheet" href="../public/css/cards/swsh-pikachu.css" />\n		<!-- href 속성의 값인 "' + assets2 + '/favicon.png"는 SvelteKit에서 제공하는 특별한 플레이스홀더입니다.\n		     이는 빌드 시 실제 favicon.png 파일의 경로로 대체됩니다. 이렇게 함으로써 개발 환경과 프로덕션 환경에서\n		     일관된 방식으로 파비콘을 참조할 수 있습니다. -->\n		<link rel="icon" href="' + assets2 + '/favicon.png" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		<meta name="color-scheme" content="dark light" />\n		' + head + `

		<style>
			body {
				--bg-1: hsl(200, 60%, 85%);
				--bg-2: hsl(206, 20%, 90%);
				--bg-3: hsl(206, 20%, 80%);
				--fg-1: hsl(0, 0%, 13%);
				--fg-2: hsl(0, 0%, 20%);
				--fg-2: hsl(0, 0%, 30%);
				--link: hsl(208, 77%, 47%);
				--link-hover: hsl(208, 77%, 55%);
				--link-active: hsl(208, 77%, 40%);
				--border-radius: 4px;
				--font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
					'Open Sans', 'Helvetica Neue', sans-serif;
				--font-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas,
					'DejaVu Sans Mono', monospace;
				background: var(--bg-1);
				color: var(--fg-1);
				font-family: var(--font);
				line-height: 1.5;
				width: 100%;
				height: calc(100vh - 2rem);
				
			}

			h1,
			h2,
			h3,
			h4,
			h5,
			h6 {
				font-weight: normal;
				font-variant-numeric: tabular-nums;
				line-height: 1.1;
			}

			:is(h1, h2, h3, h4, h5, h6, p) {
				margin: 1rem 0.1rem;
			}

			label {
				margin: 0.5rem 0.1rem;
			}

			:is(h1, h2, h3, h4, h5, h6, p, label):first-child {
				margin-top: 0;
			}

			:is(h1, h2, h3, h4, h5, h6, p, label):last-child {
				margin-bottom: 0;
			}

			a {
				color: var(--link);
			}

			a:hover {
				color: var(--link-hover);
			}

			a:active {
				color: var(--link-active);
			}

			label {
				display: flex;
				gap: 0.5rem;
				align-items: center;
			}

			label input {
				margin: 0;
			}

			button,
			input,
			select {
				font-family: inherit;
				font-size: inherit;
			}

			button {
				background: var(--link);
				color: var(--bg-1);
				padding: 0.5rem 1rem;
				border: none;
				border-radius: var(--border-radius);
			}

			button:hover {
				background: var(--link-hover);
			}

			button:active {
				background: var(--link-active);
			}

			:is(button, button:hover, button:active):disabled {
				background: var(--link);
				filter: grayscale(1);
				opacity: 0.4;
			}

			input,
			textarea,
			select {
				padding: 0.5rem;
				border: 1px solid var(--bg-2);
				border-radius: var(--border-radius);
				box-sizing: border-box;
			}

			input,
			textarea {
				background: var(--bg-1);
				color: inherit;
			}

			select:not([multiple]) {
				background: var(--bg-2);
			}

			textarea {
				font-family: var(--font-mono);
				font-size: 0.9rem;
			}

			form {
				display: flex;
				flex-direction: column;
				gap: 1rem;
				align-items: baseline;
			}

			ul:has(li):has(form) {
				list-style: none;
				padding: 0;
			}

			li form {
				flex-direction: row;
				gap: 0.5rem;
				margin: 0.5rem 0;
			}

			nav {
				position: relative;
				display: flex;
				gap: 1em;
				padding: 1em;
				background: var(--bg-2);
				z-index: 2;
				margin: 0 0 1em 0;
				border-radius: var(--border-radius);
			}

			nav a {
				text-decoration: none;
			}

			nav a[aria-current='true'] {
				border-bottom: 2px solid;
			}

			ul:has(form) {
				list-style: none;
				padding: 0;
			}

			progress {
				margin: 0.5rem 0;
			}

			progress:first-child {
				margin-top: 0;
			}

			progress:last-child {
				margin-bottom: 0;
			}

			.error {
				color: red;
			}

			code {
				background: var(--bg-2);
				font-family: var(--font-mono);
				font-size: 0.9em;
				padding: 0.15rem 0.3rem;
				border-radius: var(--border-radius);
			}

			ul.todos {
				padding: 0;
			}

			ul.todos li:not(:has(> form)),
			ul.todos li form {
				position: relative;
				display: flex;
				align-items: center;
				padding: 0.5em 0.5em 0.5em 1em;
				margin: 0 0 0.5em 0;
				gap: 0.5em;
				border-radius: 5px;
				user-select: none;
				background: var(--bg-1);
				filter: drop-shadow(2px 3px 6px rgba(0, 0, 0, 0.1));
				transition: filter 0.2s, opacity 0.2s;
			}

			ul.todos .done {
				filter: none;
				opacity: 0.4;
			}

			ul.todos button {
				border: none;
				background-color: transparent;
				background-repeat: no-repeat;
				background-position: 50% 50%;
				background-size: 1rem 1rem;
				cursor: pointer;
				width: 3em;
				height: 3em;
				margin: -0.5em -0.5em -0.5em 0;
				aspect-ratio: 1;
				opacity: 0.5;
				transition: opacity 0.2s;
			}

			ul.todos button:hover {
				opacity: 1;
			}

			body.dark {
				--bg-1: hsl(0, 0%, 18%);
				--bg-2: hsl(0, 0%, 30%);
				--bg-3: hsl(0, 0%, 40%);
				--fg-1: hsl(0, 0%, 90%);
				--fg-2: hsl(0, 0%, 70%);
				--fg-3: hsl(0, 0%, 60%);
				--link: hsl(206, 96%, 72%);
				--link-hover: hsl(206, 96%, 78%);
				--link-active: hsl(206, 96%, 64%);
			}
		</style>
	</head>
	<body>
		<div style="display: contents">` + body + "</div>\n\n		<script>\n			const theme = new URL(window.location).searchParams.get('theme');\n\n			document.body.classList.remove('light', 'dark');\n			document.body.classList.add(theme || 'light');\n		<\/script>\n	</body>\n</html>\n",
    error: ({ status, message }) => '<!doctype html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<title>' + message + `</title>

		<style>
			body {
				--bg: white;
				--fg: #222;
				--divider: #ccc;
				background: var(--bg);
				color: var(--fg);
				font-family:
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					'Segoe UI',
					Roboto,
					Oxygen,
					Ubuntu,
					Cantarell,
					'Open Sans',
					'Helvetica Neue',
					sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.error {
				display: flex;
				align-items: center;
				max-width: 32rem;
				margin: 0 1rem;
			}

			.status {
				font-weight: 200;
				font-size: 3rem;
				line-height: 1;
				position: relative;
				top: -0.05rem;
			}

			.message {
				border-left: 1px solid var(--divider);
				padding: 0 0 0 1rem;
				margin: 0 0 0 1rem;
				min-height: 2.5rem;
				display: flex;
				align-items: center;
			}

			.message h1 {
				font-weight: 400;
				font-size: 1em;
				margin: 0;
			}

			@media (prefers-color-scheme: dark) {
				body {
					--bg: #222;
					--fg: #ddd;
					--divider: #666;
				}
			}
		</style>
	</head>
	<body>
		<div class="error">
			<span class="status">` + status + '</span>\n			<div class="message">\n				<h1>' + message + "</h1>\n			</div>\n		</div>\n	</body>\n</html>\n"
  },
  version_hash: "szxjhx"
};
function get_hooks() {
  return import("./hooks.server.js");
}
export {
  assets as a,
  base as b,
  set_public_env as c,
  set_assets as d,
  set_building as e,
  get_hooks as g,
  options as o,
  public_env as p,
  reset as r,
  set_private_env as s
};
