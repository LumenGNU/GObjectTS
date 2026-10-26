# Using GObjectTS in your project (no npm publishing)

The library ships precompiled: `GObjectTS/*.js` + `*.d.ts` are committed. Inside it there are only relative imports and `gi://`, so the consumer needs no build step for it — the `GObjectTS/` directory just has to be reachable from your sources.

## 1. Get the library

~~~bash
git clone git@github.com:LumenGNU/GObjectTS.git ~/Projects/GObjectTS
~~~

After changing `src/` — `npm install && npm run build` in the library, and commit the regenerated `GObjectTS/`.

## 2. Symlink it into the project

~~~bash
cd ~/Projects/my-app            # directory with your .ts files
ln -s ~/Projects/GObjectTS/GObjectTS GObjectTS
echo /GObjectTS >> .gitignore   # the link is machine-specific
~~~

Import it relatively, with the `.js` extension:

~~~ts
import { Class } from './GObjectTS/Class.js';       // from the project root
import { Widget } from '../GObjectTS/Widget.js';    // from a subdirectory
~~~

Do **not** use `paths` aliases: `tsc` does not rewrite specifiers and `gjs -m` ignores `paths`.

## 3. package.json

Types only. Copy `devDependencies` and `overrides` from [examples/package.json](examples/package.json) (all `@girs/*` pinned to the same version) and add scripts:

~~~json
{
  "type": "module",
  "private": true,
  "scripts": { "build": "tsc" }
}
~~~

~~~bash
npm install
~~~

## 4. tsconfig.json

~~~json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "target": "ES2022",
    "lib": ["ES2022"],
    "strict": true,
    "skipLibCheck": true,
    "noEmitOnError": true,
    "rootDir": ".",
    "outDir": ".",
    "types": [
      "@girs/gjs", "@girs/gjs/dom",
      "@girs/glib-2.0", "@girs/gobject-2.0", "@girs/gio-2.0",
      "@girs/gtk-4.0", "@girs/gdk-4.0", "@girs/pango-1.0"
    ]
  },
  "include": ["*.ts"],
  "exclude": ["node_modules"]
}
~~~

Add `@girs/adw-1` if you use Adwaita. `include` lists only your sources so `tsc` does not pick up the linked library. The explicit `exclude` is required: with `outDir: "."` the default `exclude` is `["."]` and `tsc` finds no inputs.

## 5. Build and run

~~~bash
npx tsc
chmod +x app.js        # tsc keeps the `#!/usr/bin/env -S gjs -m` line
./app.js               # or: gjs -m app.js
~~~

## Rules the decorators impose

- Constructor parameters must all be optional (`constructor(props?: Partial<...>)`), otherwise `@Class`/`@Widget` reject the class.
- `@Class` / `@Widget` go on top of the decorator chain.
- Don't mix decorators and `GObject.registerClass()` in one class.
- Use `declare` for decorated fields (`@Property.*`, `@Template.Child`).
- `on_<signal>` methods are connected automatically by GJS.
- Working code: [examples/](examples/).
