import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolveDshBin() {
  try {
    const pkgJson = require.resolve('@deepseek-ai/dsh/package.json')
    const root = path.dirname(pkgJson)
    const bin = path.join(root, 'lib', 'bin.js')
    if (fs.existsSync(bin)) return bin
  } catch {
    // fall through
  }

  const candidates = [
    path.join(__dirname, '..', 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js'),
    path.join(process.resourcesPath || '', 'app', 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js'),
  ]
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate
  }
  throw new Error('Cannot find @deepseek-ai/dsh. Run npm install first.')
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      server.close((err) => {
        if (err) reject(err)
        else resolve(port)
      })
    })
    server.on('error', reject)
  })
}

async function waitForHttp(url, timeoutMs = 60000) {
  const start = Date.now()
  let lastError = ''
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) })
      if (res.ok || res.status === 404 || res.status === 302) return
      lastError = `HTTP ${res.status}`
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error(`Timed out waiting for DeepSeek Harness at ${url}. ${lastError}`)
}

/**
 * @param {{ userDataDir: string, onLog?: (line: string) => void }} options
 */
export async function startDshService(options) {
  const port = await getFreePort()
  const host = '127.0.0.1'
  const url = `http://${host}:${port}`
  const dshBin = resolveDshBin()
  const homeDir = path.join(options.userDataDir, 'dsh-home')
  fs.mkdirSync(homeDir, { recursive: true })

  const env = {
    ...process.env,
    DSH_HOME: homeDir,
    HOME: process.env.HOME || options.userDataDir,
    ELECTRON_RUN_AS_NODE: '1',
  }

  const args = [dshBin, 'web', '--host', host, '--port', String(port)]
  const child = spawn(process.execPath, args, {
    env,
    cwd: options.userDataDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })

  let logs = ''
  const append = (chunk) => {
    const text = chunk.toString()
    logs += text
    if (logs.length > 20000) logs = logs.slice(-16000)
    options.onLog?.(text.trimEnd())
  }
  child.stdout?.on('data', append)
  child.stderr?.on('data', append)

  const exitPromise = new Promise((resolve) => {
    child.on('exit', (code, signal) => resolve({ code, signal }))
  })

  try {
    await Promise.race([
      waitForHttp(url),
      exitPromise.then(({ code, signal }) => {
        throw new Error(
          `dsh exited early (code=${code}, signal=${signal}).\n${logs.slice(-4000)}`,
        )
      }),
    ])
  } catch (error) {
    if (!child.killed) child.kill()
    throw error
  }

  return {
    url,
    port,
    pid: child.pid,
    stop: async () => {
      if (child.killed) return
      child.kill()
      await Promise.race([
        exitPromise,
        new Promise((r) => setTimeout(r, 3000)),
      ])
      if (!child.killed) {
        try {
          child.kill('SIGKILL')
        } catch {
          // ignore
        }
      }
    },
  }
}

/**
 * @param {{ stop?: () => Promise<void> } | null} service
 */
export async function stopDshService(service) {
  if (!service?.stop) return
  await service.stop()
}
