[![Angular Logo](https://www.vectorlogo.zone/logos/angular/angular-icon.svg)](https://angular.io/) 
[![Electron Logo](https://www.vectorlogo.zone/logos/electronjs/electronjs-icon.svg)](https://electronjs.org/)
[![License](http://img.shields.io/badge/Licence-MIT-brightgreen.svg)](LICENSE.md)


# MUSE

# Introduction

Para instalar dependencias asociadas al package.json del proyecto

```npm
npm install 
```

# Desarrollar y Compilar

Con este simple comando en la terminal podemos utilizar la aplicación Angular con Electron en un entorno de desarrollo local con recarga en caliente, esté comando no es recomendable una vez que la aplicación se va a lanzar a producción.

```npm
npm run start 
```

Compilar para MacBook Pro: 

```npm
npm run electron:mac
```

# DOCUMENTACIÓN

Toda la documentación se encuentra en la wiki del repositorio.

[WIKI](https://github.com/nonodev96/muse/wiki)


# Modo navegador
¿Quizás quieras ejecutar la aplicación en el navegador con recarga en caliente? Puedes hacerlo con `npm run ng:serve:web`. Tenga en cuenta que en este caso no puede usar las bibliotecas nativas Electron o NodeJS. Verifique los `providers/electron.service.ts` para ver cómo se realiza la importación condicional de bibliotecas electron/native.

## Commandos

|Command|Description|
|--|--|
|`npm run ng:serve:web`| Execute the app in the browser |
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular aot. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and start electron
|`npm run electron:linux`| Builds your application and creates an app consumable on linux system |
|`npm run electron:windows`| On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems |
|`npm run electron:mac`|  On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |



REFERENCIAS
===========
https://github.com/maximegris/angular-electron 
https://www.brainbell.com/javascript/show-open-dialog.html
https://github.com/electron/electron/blob/master/docs/api/dialog.md

https://github.com/angular/material2/issues/7754
