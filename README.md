# watsup

![screenshot](_img/screenshot.png)

watsup is a convenient little dashboard and app launcher for [cute.haus](https://github.com/alyraffauf/cute.haus), my hybrid homelab/cloud infrastructure. Very much inspired by [glance](https://github.com/glanceapp/glance), but I grew tired of the limitations of a generic solution. Plus, I wanted to build my own for fun.

In addition to some pleasantries (top 5 stories on Hacker News, weather, search), it shows every website and service I host, with a checkmark reflecting whether they're reachable or not.

## configuration

The dashboard is configured at runtime from TOML. The bundled
[`config/default.toml`](config/default.toml) reproduces the default dashboard,
but the container can use any mounted file by setting `WATSUP_CONFIG_PATH`:

```yaml
services:
  watsup:
    image: watsup
    ports:
      - "3000:3000"
    environment:
      WATSUP_CONFIG_PATH: /run/configs/watsup.toml
    configs:
      - source: watsup-dashboard
        target: /run/configs/watsup.toml

configs:
  watsup-dashboard:
    file: ./watsup.toml
```

The config contains an ordered list of sections. Add as many `services` and
`widgets` sections as needed:

```toml
title = "Home"

[[sections]]
type = "widgets"
columns = 4

[[sections.widgets]]
type = "weather"

[[sections.widgets]]
type = "search"
span = 3

[[sections]]
type = "services"
title = "Public services"
columns = 3
refreshInterval = 20000

[[sections.services]]
name = "Example"
url = "https://example.com"
healthUrl = "https://example.com/health"
goodStatuses = [200, 204]

[[sections]]
type = "services"
title = "Internal services"
columns = 4

[[sections.services]]
name = "Grafana"
url = "https://grafana.example.com"
icon = "https://example.com/grafana.png"
```

`columns` and widget `span` accept values from 1 through 4. Available widget
types are `weather`, `search`, `lobsters`, and `hacker-news`. Service `icon`,
`healthUrl`, `goodStatuses`, and section `refreshInterval` are optional. Without
`goodStatuses`, any response below HTTP 500 is considered online. The config is
read when `/api/config` is requested, so replacing the file and refreshing the
page applies changes without rebuilding the image.

## build stuff

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

This project was created using `bun init` in bun v1.3.7. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
