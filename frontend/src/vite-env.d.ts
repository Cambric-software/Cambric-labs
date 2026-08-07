/// <reference types="vite/client" />

// Local-first mode: No external API keys required
// CAMBRIC LABS runs entirely in the browser

declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.css' {
  const content: string
  export default content
}
