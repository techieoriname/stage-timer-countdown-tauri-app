# Countdown Timer by Oriname

A versatile countdown timer application designed for churches, conferences, and events. Features include customizable countdowns, full-screen display for extended screens, and an intuitive user interface.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Building for Production](#building-for-production)

## Features

- Customizable countdown timer
- Full-screen display for extended screens
- Flashing "TIME UP!!!" message when the timer ends

## Installation

To get started with the Countdown Timer app, clone the repository and install the dependencies.

```bash
git clone https://github.com/yourusername/countdown-timer-app.git
cd countdown-timer-app
yarn install
```

## Usage

To start the development server:

```bash
yarn tauri dev
```

This will run the app in development mode. Open http://localhost:1420 to view it in the browser.

## Building for Production

To create a production build of the app for both Windows and macOS:

```bash
yarn tauri build
```
This command will create the production build of the app in the `src-tauri/target/release/bundle` directory.
