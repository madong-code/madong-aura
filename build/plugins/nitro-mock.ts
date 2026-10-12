import type { PluginOption } from 'vite'

import net from 'node:net'

import { build, createDevServer, createNitro, prepare } from 'nitropack'
import { fileURLToPath } from 'node:url'

/**
 * 检测端口是否可用（替代 monorepo 版的 get-port 依赖）。
 * 端口被占用时返回 false，vite 跳过拉起，避免与手动启动的 mock 冲突。
 */
function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer()
    tester.once('error', () => resolve(false))
    tester.once('listening', () => tester.close(() => resolve(true)))
    tester.listen(port)
  })
}

export interface NitroMockPluginOptions {
  /** Nitro mock 服务目录（含 nitro.config.ts） */
  mockDir?: string
  /** mock 监听端口 */
  port?: number
}

/**
 * Vite dev 插件：启动时在同一进程内拉起 Nitro mock（对齐 madong-single）。
 * - VITE_NITRO_MOCK !== 'false' 时启用
 * - 5320 已被占用（如手动 pnpm mock）则自动跳过
 */
export function viteNitroMockPlugin(options: NitroMockPluginOptions = {}): PluginOption {
  const { port = 5320 } = options
  const mockDir =
    options.mockDir ||
    fileURLToPath(new URL('../../tooling/mock', import.meta.url))

  let nitro: any = null

  const startNitro = async () => {
    if (!(await isPortFree(port))) {
      console.log(
        `\n  [nitro-mock] 端口 ${port} 已被占用，跳过自动拉起（假定 mock 已手动启动）\n`
      )
      return
    }

    nitro = await createNitro({
      dev: true,
      preset: 'nitro-dev',
      rootDir: mockDir
    })

    const server = createDevServer(nitro)
    await server.listen(port, { showURL: false })
    await prepare(nitro)
    await build(nitro)

    console.log(`\n  [nitro-mock] Nitro Mock Server: http://localhost:${port}/adminapi\n`)
  }

  return {
    name: 'vite:nitro-mock',
    enforce: 'pre',
    configureServer(server) {
      startNitro()

      const stop = () => {
        nitro?.close?.()
        nitro = null
      }
      server.httpServer?.on('close', stop)
      process.once('exit', stop)
    }
  }
}
