"""Deterministic PTY integration against PI_EVERGREEN_PI_BIN; no model calls."""
import fcntl
import json
import os
from pathlib import Path
import pty
import select
import struct
import subprocess
import sys
import termios
import time

config_path = Path(sys.argv[1]).resolve()
config = json.loads(config_path.read_text())
work = Path(config['work'])


def run(name, mode, truecolor, package, negative=False, configured=False, env_truecolor=None):
    agent = work / name
    agent.mkdir()
    (agent / 'settings.json').write_text(json.dumps({
        'theme': 'light', 'enableInstallTelemetry': False, 'enableAnalytics': False,
        'terminal': {'trueColor': truecolor},
        **({'packages': [package]} if configured else {}),
    }))
    report = agent / 'report.jsonl'
    env = {**os.environ, 'PI_CODING_AGENT_DIR': str(agent), 'PI_OFFLINE': '1',
           'PI_TRUE_COLOR': '1' if (truecolor if env_truecolor is None else env_truecolor) else '0',
           'EVERGREEN_EXPECT_TRUE_COLOR': '1' if truecolor else '0', 'TERM': 'xterm-256color',
           'EVERGREEN_THEME_CONFIG': str(config_path), 'EVERGREEN_THEME_REPORT': str(report)}
    master, slave = pty.openpty()
    fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', 40, 120, 0, 0))
    args = [config['bin'], '--offline', '--no-approve', '--no-context-files',
            '--no-extensions', '--no-skills', '--no-prompt-templates',
            *([] if configured else ['--no-themes', '-e', package]),
            '--no-tools', '-e', config['observer'],
            '--theme', config['invalid'], '--use-theme', 'pi-nice-theme',
            '--tui-mode', mode, '--provider', config['provider'], '--model', config['model'],
            '--thinking', config['reasoning'], '/evergreen-check startup']
    proc = subprocess.Popen(args, stdin=slave, stdout=slave, stderr=slave, cwd=agent, env=env)
    os.close(slave)
    output = bytearray()

    def records():
        return [json.loads(line) for line in report.read_text().splitlines()] if report.exists() else []

    def wait(predicate):
        deadline = time.monotonic() + 25
        while time.monotonic() < deadline:
            if select.select([master], [], [], 0.05)[0]:
                try:
                    output.extend(os.read(master, 65536))
                except OSError:
                    pass
            found = records()
            if predicate(found):
                return found
            if proc.poll() is not None:
                break
        # Terminal output contains only isolated startup/command diagnostics, never credentials.
        raise AssertionError(f'{name}: CLI timeout/exit {proc.poll()}: {output[-4000:]!r}')

    def command(text):
        os.write(master, (text + '\r').encode())

    def check(label):
        command('/evergreen-check ' + label)
        result = wait(lambda rows: any(r.get('label') == label for r in rows))[-1]
        assert result['ok'], result
        return result

    try:
        wait(lambda rows: any(r['kind'] == 'start' for r in rows))
        startup = wait(lambda rows: any(r.get('label') == 'startup' for r in rows))[-1]
        assert startup['ok'] != negative, startup
        if negative:
            assert 'active accent' in startup['error'], startup
        if not negative:
            # A late light terminal palette must not regenerate a fixed custom theme.
            os.write(master, b'\x1b]10;rgb:0000/0000/0000\x07'
                     b'\x1b]11;rgb:ffff/ffff/ffff\x07'
                     b'\x1b]4;1;rgb:0000/ffff/0000\x07')
            check('terminal-change')
            for transition in ['reload', 'new']:
                starts = sum(r['kind'] == 'start' for r in records())
                command('/' + transition)
                wait(lambda rows: sum(r['kind'] == 'start' for r in rows) > starts)
                check(transition)
            # Reports can precede the coalesced frame; wait for actual renderer output.
            expected_ansi = b'\x1b[38;2;204;57;123m' if truecolor else b'\x1b[38;5;'
            wait(lambda _rows: expected_ansi in output)
            assert b'\x1b]11;' not in output.replace(b'\x1b]11;?', b''), 'must not change terminal background'
            assert b'\x1b]111' not in output, 'must not reset terminal background'
        command('/evergreen-exit')
        wait(lambda rows: proc.poll() is not None)
        assert proc.returncode == 0, proc.returncode
    finally:
        if proc.poll() is None:
            proc.kill()
        proc.wait()
        os.close(master)
    print(f'PASS {name}: ' + ('palette mutation detected (negative control)' if negative else
                                 'package discovery, 55 colors, fallbacks, invalid themes, selection recovery, terminal change, reload, new session'))


# Settings must win over conflicting inherited capability overrides in both directions.
run('truecolor', 'regular', True, config['root'], env_truecolor=False)
run('indexed', 'fullscreen', False, config['root'], env_truecolor=True)
# Match pi install's saved local-package declaration, not just explicit -e discovery.
run('configured-package', 'fullscreen', True, config['root'], configured=True)
# Change actual runtime input, not the expected oracle: the observer must reject it.
mutated = work / 'mutated-package'
(mutated / 'themes').mkdir(parents=True)
pkg = {'name': 'evergreen-negative-control', 'pi': {'themes': ['./themes/pi-nice-theme.json']}}
(mutated / 'package.json').write_text(json.dumps(pkg))
theme = json.loads(json.dumps(config['expected']))
theme['colors']['accent'] = '#010203'
(mutated / 'themes/pi-nice-theme.json').write_text(json.dumps(theme))
run('negative-control', 'regular', True, str(mutated), negative=True)
