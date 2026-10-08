// Headless Chrome must never outlive the script that started it (a leaked SwiftShader
// instance burned 2+ cores for 27 minutes). Kill it on every exit path, and run a detached
// watchdog that kills it even if this process is SIGKILLed (e.g. a tool timeout).
import { spawn } from 'node:child_process';
const children = new Set();
let installed = false;
function killAll() { for (const c of children) { try { c.kill('SIGKILL'); } catch {} } children.clear(); }
export function guard(child) {
  children.add(child);
  child.on('exit', () => children.delete(child));
  spawn('/bin/sh', ['-c', `while kill -0 ${process.pid} 2>/dev/null && kill -0 ${child.pid} 2>/dev/null; do sleep 1; done; kill -9 ${child.pid} 2>/dev/null`], { detached: true, stdio: 'ignore' }).unref();
  if (!installed) {
    installed = true;
    process.on('exit', killAll);
    for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => { killAll(); process.exit(130); });
    process.on('uncaughtException', (e) => { console.error(e); killAll(); process.exit(1); });
    process.on('unhandledRejection', (e) => { console.error(e); killAll(); process.exit(1); });
  }
  return child;
}
