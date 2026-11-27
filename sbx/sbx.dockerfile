# syntax=docker/dockerfile:1
# Content of the kit in sbx.yaml. sbx builds this on the host and lays the final stage over the
# claude agent image. A mixin is a layer, not an apt-get on the agent image, so both tools come in
# as self-contained trees. The claude image (docker.io/sbx/claude, Debian 13) has no java or node.
# Written for arm64 (macOS). On an amd64 host, change the value marked "amd64".

# JDK 21, Temurin, pinned the way the repo pins it: major version only (backend/pom.xml:23,
# .github/workflows/common-backend.yml:58-59). Like setup-java there, 21-jdk takes the newest 21.x.
FROM eclipse-temurin:21-jdk AS jdk

# Node: the version CI uses (.github/workflows/common-frontend.yml:25, .nvmrc).
# Unpacked into this stage's /usr/local so `corepack enable` writes its yarn link to the same path
# it has in the sandbox. Debian's /usr/local is empty, so the copy below carries only Node.
# TODO: Add your architecture if it is not arm64 (aarch64). Only this Node download depends on it.
# amd64: node-v22.23.1-linux-x64.tar.gz
FROM debian:trixie-slim AS node
ADD https://nodejs.org/dist/v22.23.1/node-v22.23.1-linux-arm64.tar.gz /tmp/node.tar.gz
RUN tar -xzf /tmp/node.tar.gz -C /usr/local --strip-components=1 --no-same-owner \
 && rm /tmp/node.tar.gz \
 && corepack enable \
 && node --version | grep -qx v22.23.1

FROM scratch
COPY --from=jdk /opt/java/openjdk /opt/java/jdk-21
COPY --from=node /usr/local/ /usr/local/
ENV JAVA_HOME=/opt/java/jdk-21
# A mixin's PATH entries are appended to the agent image's PATH (SPEC-v3 §10). No ${PATH} here:
# in a scratch stage it is empty and would leave a trailing ":" (the current directory) in PATH.
ENV PATH=/opt/java/jdk-21/bin
# Corepack downloads the yarn version frontend/package.json pins on first use, without asking.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
