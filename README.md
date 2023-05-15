<div align="center">
    <img src="https://raw.githubusercontent.com/JOTSR/pita-cli/main/assets/favicon.png" alt="logo" style="width: 150px; height: 150px"/>
    <h1>Pita api</h1>
    <p>Simpliest way to develop secure and powerful webapps for redpitaya.</p>
</div>

[![deno module](https://shield.deno.dev/x/pita_api)](https://deno.land/x/pita_api)
![GitHub](https://img.shields.io/github/license/JOTSR/pita-api?style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/JOTSR/pita-cli/ci.yml?style=flat-square)
![deno doc](https://img.shields.io/static/v1?logo=deno&label=deno&message=doc&color=blue&style=flat-square)

Simpliest way to develop secure and powerful app for redpitaya.

Pita 🫓 api provide frontend proxy to [Redpitaya](https://redpitaya.com/) low
level API. Pita api allows you to manage your Redpitaya board without worring
about backend, and with [Pita cli](https://deno.land/x/pita), build and
implement your webapp with a robust and secure environement. It handle all your
workflow, from tooling installation to testing, benching and publishing.

## Getting started

Example app taken from [pita template](https://github.com/JOTSR/pita-template).

```ts
import config from '@pita/project.json' assert { type: 'json' }
import { Project } from 'https://deno.land/x/pita_api/mod.ts'

const redpitaya = await Project.init(config)

await redpitaya.channel.dac1.writeSlice([0, 0, 0, 256, 256, 256, 0, 0, 0])
console.log('Gate signal on DAC 1')
await redpitaya.pin.digital.led1.write(true)
console.log('Led 1 is ON')
```

## Contributing

Read [CONTRIBUTING](./CONTRIBUTING.md) and start a codespace or clone this
repository.

Folow conventionnal commit, document your code and, use deno or rust style
coventions on the corresponding directories.

Link your PR with the corresponding issue if it exists.
