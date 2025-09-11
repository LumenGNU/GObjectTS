# GJS-Gtk4 Examples Using GObjectTS

A collection of examples demonstrating GTK4 application development in TypeScript using GObjectTS decorators.

## Requirements

Check dependencies

~~~bash
gjs --version && echo 'gjs OK'
gjs -c "imports.gi.versions.Gtk = '4.0'; print('GTK4 OK')"
gjs -c "imports.gi.versions.Adw = '1'; print('Adwaita OK')"
node --version # should be >= 18
npm --version
~~~

Refer to your distribution's documentation to install missing dependencies.

## Quick Start

### 1. Project Setup
~~~bash
# Clone the repository
git clone https://github.com/LumenGNU/GObjectTS.git
cd GObjectTS

# Project preparation
# Build GObjectTS library (this step can be skipped, but it's better to execute)
npm install
npm run build
~~~

### 2. Navigate to examples
~~~bash
cd examples
~~~

### 3. Install dependencies

~~~bash
# Install TypeScript and @girs types
npm install
~~~

### 4. Build examples
~~~bash
# Compile all examples
npm run build

# Or clean + rebuild
npm run clean
npm run build
~~~

### 5. Run examples
~~~bash
# Simple example - Adwaita Hello World
npm run example:Adw.Hello-World

# Другие примеры
npm run example:... # use console autocompletion (double tab) to see available examples
~~~

See the full list of examples below.

### 6 Manual execution

After compilation, examples can be run directly:

~~~bash
# from the examples directory
./Adw.Hello-World/Hello-world.js

# etc.
~~~

## Examples List

> For detailed information about a specific example, see the corresponding directory

TODO


