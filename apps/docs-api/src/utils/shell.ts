import { execFile } from "node:child_process";

function redactArg(arg: string): string {
  const redactedHeader = arg.replace(/(AUTHORIZATION:\s*basic\s+)[A-Za-z0-9+/=]+/gi, "$1[REDACTED]");
  return redactedHeader.replace(/(https?:\/\/)([^/@]+)@/g, "$1[REDACTED]@");
}

export async function execFileText(command: string, args: string[], cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        const safeArgs = args.map(redactArg).join(" ");
        reject(new Error(`${command} ${safeArgs} failed: ${stderr || error.message}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}
