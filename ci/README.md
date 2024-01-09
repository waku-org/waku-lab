# Description

Configuration of CI builds executed under a Jenkins instance at https://ci.infra.status.im/.

# Website

The `Jenkinsfile` file builds and pushes the site with this job:

* https://ci.infra.status.im/job/website/job/lab.waku.org/

And deploys it via `gh-pages` branch and [GitHub Pages](https://pages.github.com/) to:
https://lab.waku.org/
