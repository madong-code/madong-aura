import { globSync } from 'glob'
import fs from 'fs'

export function extractDependenciesFromContent(content: string): string[] {
  const deps: string[] = []
  const match = content.match(/dependencies:\s*\[([^\]]+)\]/)
  if (match) {
    const items = match[1].match(/'([^']+)'|"([^"]+)"/g) || []
    items.forEach(item => {
      const dep = item.replace(/['"]/g, '').trim()
      if (dep) deps.push(dep)
    })
  }
  return deps
}

export function collectPluginDependencies(): string[] {
  const deps: string[] = []
  try {
    const files = globSync('./src/apps/*/index.ts')
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      deps.push(...extractDependenciesFromContent(content))
    }
  } catch (e) {
    console.warn('[PluginDeps] Failed to collect plugin dependencies:', e)
  }
  return [...new Set(deps)]
}