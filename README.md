# Waku Lab

## Description

This repository is dedicated to experimental proof of concepts and research related to js-waku libraries.

Webapps in this repo are hosted at https://lab.waku.org/
For ready-to-use examples to build with js-waku. Go to https://examples.waku.org/

### Web Chat App

- [code](examples/web-chat)
- [website](https://lab.waku.org/web-chat)
- Demonstrates: Group chat, React/TypeScript, Relay, Store.

### Waku Light Client in JavaScript

Send messages between several users (or just one) using light client targetted protocols.

- [code](examples/light-js)
- [website](https://lab.waku.org/light-js)
- Demonstrates: Waku Light node: Filter + Light Push, Pure Javascript/HTML using ESM/unpkg bundle.

### Minimal Angular (v13) Waku Relay

A barebone messaging app to illustrate the seamless integration of `js-waku` into AngularJS.

- [code](examples/relay-angular-chat)
- [website](https://lab.waku.org/relay-angular-chat)
- Demonstrates: Group messaging, Angular, Waku Relay, Protobuf using `protobufjs`, No async/await syntax.

### Waku Relay in JavaScript

This example uses Waku Relay to send and receive simple text messages.

- [code](examples/relay-js)
- [website](https://lab.waku.org/relay-js)
- Demonstrates: Waku Relay, Pure Javascript/HTML using ESM/unpkg bundle.

### Waku Relay in ReactJS

A barebone chat app to illustrate the seamless integration of `js-waku` into ReactJS.

- [code](examples/relay-reactjs-chat)
- [website](https://lab.waku.org/relay-reactjs-chat)
- Demonstrates: Group chat, React/JavaScript, Waku Relay, Protobuf using `protobufjs`.

### Noise JS

- [code](examples/noise-js)
- [website](https://lab.waku.org/noise-js)
- Demonstrates: LightPush, Filter, [Noise encryption](https://rfc.vac.dev/spec/35/).

### Noise RTC

- [code](examples/noise-rtc)
- [website](https://lab.waku.org/noise-rtc)
- Demonstrates: LightPush, Filter, [Noise encryption](https://rfc.vac.dev/spec/35/), WebRTC.

### Relay Direct RTC

- [code](examples/relay-direct-rtc)
- [website](https://lab.waku.org/relay-direct-rtc)
- Demonstrates: Relay over WebRTC.


# Continuous Integration

The `master` branch is being built by Jenkins CI:
https://ci.infra.status.im/job/website/job/lab.waku.org/

Based on the [`ci/Jenkinsfile`](./ci/Jenkinsfile).
