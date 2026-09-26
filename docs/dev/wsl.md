# WSL2 development notes

Quirks we've hit developing SkedgeLife in WSL2 (Ubuntu) on a Windows laptop. Add to this as new ones come up.

## Keep the repo on the Linux filesystem

Clone into your Linux home (e.g. `~/Projects/SkedgeLife`), not under `/mnt/c/...`. File access across the Windows mount is much slower, and Metro's file watching is unreliable there.

## Your phone can't reach the dev server directly

WSL2 runs behind its own virtual network, so a phone on the same Wi-Fi can't reach WSL's IP address. Plain `npm start` gives a QR code the phone can't open.

**What works:** `npm start -- --tunnel` from the repo root. It routes through an ngrok tunnel. On first run it asks to install `@expo/ngrok`; say yes. The tunnel adds a little reload latency.

**Faster alternative (not yet tried here):** WSL "mirrored" networking, which puts WSL on the same network as Windows. Create `C:\Users\<you>\.wslconfig` with:

```ini
[wsl2]
networkingMode=mirrored
```

Then run `wsl --shutdown` from PowerShell, reopen WSL, and allow inbound TCP on port 8081 in Windows Firewall. Plain `npm start` should then work over Wi-Fi. There's no `.wslconfig` on this machine yet.

## Docker runs inside WSL, not Docker Desktop

Local Supabase uses a Docker engine installed directly in WSL Ubuntu (a systemd service), not Docker Desktop. Docker Desktop is installed on this machine too (`docker context ls` shows a `desktop-linux` context), but nothing uses it.

- Supabase's containers won't appear in Docker Desktop's window. Use `docker ps` in WSL.
- Keep Docker Desktop closed while working on SkedgeLife. With its WSL integration on, it can take over the `docker` command and the ports, and Supabase may start in the wrong engine or fail on ports already in use.
- Only the backend runs in Docker. The Expo dev server (`npm start`) is a normal Node process in WSL.

## Reaching WSL services from Windows

WSL2 forwards `localhost` from Windows to WSL by default, so Windows tools can reach local services directly. For example, DBeaver connects to the local database at `localhost:54322` (user and password `postgres`). If a connection starts timing out after sleep or a network change, run `wsl --shutdown` in PowerShell, reopen WSL, and restart the service.

## Windows `node` and `npm` are on the WSL PATH

WSL appends the Windows PATH, so `/mnt/c/Program Files/nodejs/` (Windows Node and npm) sits behind the Linux Node that nvm installs:

```bash
$ which -a npm
/home/<you>/.nvm/versions/node/v20.20.2/bin/npm
/mnt/c/Program Files/nodejs//npm
```

This is fine while nvm loads first. It isn't fine if nvm hasn't loaded, which can happen in some non-interactive shells: Windows npm would run against Linux files and fail in confusing ways. If a Node command behaves strangely, check `which node npm` first.

## Files copied from Windows arrive as executable

Files that came over from Windows are tracked in git with the executable bit set (mode `100755`), including source files and images. It's harmless, but it produces noisy mode-only diffs when a tool rewrites a file with normal permissions (this happened to `app.json` during the SDK upgrade).

Check with:

```bash
git ls-files -s | awk '$1=="100755"{print $4}'
```

## Windows short (8.3) filenames

Two reference docs came across with Windows-truncated names: `docs/reference/SKEDGE~1.MD` and `docs/reference/WILD-R~1.MD`. The original long names were lost in the copy. When copying files from Windows, copy the folder itself (or use `git`), not the output of tools that fall back to short names.

## `gh` CLI without sudo

The GitHub CLI isn't in Ubuntu's default packages and `sudo` isn't always convenient. Installing the release binary into `~/.local/bin` works:

```bash
mkdir -p ~/.local/bin
# download gh_<version>_linux_amd64.tar.gz from github.com/cli/cli/releases, then:
tar -xzf gh_*_linux_amd64.tar.gz
cp gh_*_linux_amd64/bin/gh ~/.local/bin/
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

`gh auth login --web` can't open a browser from WSL, but it prints a one-time code and a URL. Open the URL in your Windows browser and enter the code.
