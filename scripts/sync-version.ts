/**
 * 同步版本号脚本
 * 将 package.json 的版本号同步到 tauri.conf.json 和 Cargo.toml
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

interface PackageJson {
  version: string
  [key: string]: unknown
}

interface TauriConfig {
  version: string
  [key: string]: unknown
}

// 读取 package.json
const packageJson: PackageJson = JSON.parse(
  readFileSync(join(rootDir, 'package.json'), 'utf-8')
)
const version: string = packageJson.version

console.log(`📦 当前版本: ${version}`)

// 同步到 tauri.conf.json
try {
  const tauriConfPath = join(rootDir, 'src-tauri', 'tauri.conf.json')
  const tauriConf: TauriConfig = JSON.parse(readFileSync(tauriConfPath, 'utf-8'))
  
  if (tauriConf.version !== version) {
    tauriConf.version = version
    writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n')
    console.log(`✅ 已更新 tauri.conf.json: ${version}`)
  } else {
    console.log(`✓ tauri.conf.json 版本已是最新`)
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error(`❌ 更新 tauri.conf.json 失败:`, errorMessage)
}

// 同步到 Cargo.toml
try {
  const cargoTomlPath = join(rootDir, 'src-tauri', 'Cargo.toml')
  const cargoToml = readFileSync(cargoTomlPath, 'utf-8')
  
  // 使用正则表达式替换 version
  const versionRegex = /^version = ".*"$/m
  const newCargoToml = cargoToml.replace(versionRegex, `version = "${version}"`)
  
  if (newCargoToml !== cargoToml) {
    writeFileSync(cargoTomlPath, newCargoToml)
    console.log(`✅ 已更新 Cargo.toml: ${version}`)
  } else {
    console.log(`✓ Cargo.toml 版本已是最新`)
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error(`❌ 更新 Cargo.toml 失败:`, errorMessage)
}

console.log(`\n🎉 版本号同步完成！`)

