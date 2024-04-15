# Waku Lab

## Description

This repository is dedicated to experimental proof of concepts and research related to js-waku libraries.

Webapps in this repo are hosted at https://lab.waku.org/
For ready-to-use examples to build with js-waku. Go to https://examples.waku.org/

### Notes App

- [code](examples/flush-notes)
- [website](https://lab.waku.org/flush-notes)
- Demonstrates: Light Push, Filter, Store, Message encryption/decryption

## Experimental Examples

The following examples are not as actively maintained as the above and may not work with latest js-waku packages.

### Web Chat App

- [code](examples/experimental/web-chat)
- [website](https://lab.waku.org/experimental/web-chat)
- Demonstrates: Group chat, React/TypeScript, Relay, Store.

### Waku Light Client in JavaScript

Send messages between several users (or just one) using light client targetted protocols.

- [code](examples/experimental/light-js)
- [website](https://lab.waku.org/experimental/light-js)
- Demonstrates: Waku Light node: Filter + Light Push, Pure Javascript/HTML using ESM/unpkg bundle.

### Waku Relay in JavaScript

This example uses Waku Relay to send and receive simple text messages.

- [code](examples/experimental/relay-js)
- [website](https://lab.waku.org/experimental/relay-js)
- Demonstrates: Waku Relay, Pure Javascript/HTML using ESM/unpkg bundle.

### Noise JS

- [code](examples/experimental/noise-js)
- [website](https://lab.waku.org/experimental/noise-js)
- Demonstrates: LightPush, Filter, [Noise encryption](https://rfc.vac.dev/spec/35/).

### Noise RTC

- [code](examples/experimental/noise-rtc)
- [website](https://lab.waku.org/experimental/noise-rtc)
- Demonstrates: LightPush, Filter, [Noise encryption](https://rfc.vac.dev/spec/35/), WebRTC.

### Relay Direct RTC

- [code](examples/experimental/relay-direct-rtc)
- [website](https://lab.waku.org/experimental/relay-direct-rtc)
- Demonstrates: Relay over WebRTC.


# Continuous Integration

The `master` branch is being built by Jenkins CI:
https://ci.infra.status.im/job/website/job/lab.waku.org/

Based on the [`ci/Jenkinsfile`](./ci/Jenkinsfile).
