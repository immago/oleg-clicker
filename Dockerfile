# Set Kilo code url
# http://host.docker.internal:12345/v1
#
# "ornith-1.5-35b-a3b": {
#           "name": "ornith-1.5-35b-a3b",
        #   "limit": {
        #     "context": 65536,
        #     "output": 16384
        #   },
#           "reasoning": true,
#           "modalities": {
#             "input": [
#               "text",
#               "image"
#             ]
#           }
#         }
#       }

FROM mcr.microsoft.com/devcontainers/cpp:2-ubuntu24.04

ARG LLVM_VERSION=20
ARG NODE_VERSION=22
ARG USERNAME=vscode

# Use bash with pipefail for all RUN commands
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# ── LLVM prerequisites ───────────────────────────────────────────────────────
# llvm.sh requires add-apt-repository (software-properties-common) and gnupg.
# Install these first before running the LLVM installer script.
RUN apt-get update && apt-get install -y --no-install-recommends \
        software-properties-common \
        gnupg \
    && rm -rf /var/lib/apt/lists/*

# ── LLVM / Clang (full toolchain) ────────────────────────────────────────────
# Use curl only (no wget) to satisfy DL4001
RUN curl -fsSL https://apt.llvm.org/llvm.sh -o /tmp/llvm.sh \
    && chmod +x /tmp/llvm.sh \
    && bash /tmp/llvm.sh "${LLVM_VERSION}" all \
    && rm /tmp/llvm.sh \
    && for tool in clang clang++ clangd clang-format clang-tidy clang-query \
                   lldb lld lld-link ld.lld \
                   llvm-ar llvm-as llvm-cov llvm-dis llvm-dwarfdump \
                   llvm-link llvm-nm llvm-objcopy llvm-objdump \
                   llvm-profdata llvm-ranlib llvm-readelf llvm-size \
                   llvm-strings llvm-strip llvm-symbolizer; do \
         bin="/usr/bin/${tool}-${LLVM_VERSION}"; \
         [ -f "$bin" ] && update-alternatives --install "/usr/bin/${tool}" "${tool}" "${bin}" 100 || true; \
       done \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# ── ccache + zsh ─────────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
        ccache \
        zsh \
    && rm -rf /var/lib/apt/lists/* \
    && echo "max_size = 0" > /etc/ccache.conf \
    && ln -sf /usr/bin/ccache /usr/local/bin/clang \
    && ln -sf /usr/bin/ccache /usr/local/bin/clang++ \
    && ln -sf /usr/bin/ccache /usr/local/bin/cc \
    && ln -sf /usr/bin/ccache /usr/local/bin/c++ \
    && chsh -s /usr/bin/zsh "${USERNAME}"

# ── Node.js ───────────────────────────────────────────────────────────────────
RUN curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# ── LSP servers (TypeScript / JavaScript / Python) ───────────────────────────
# Versions intentionally unpinned — this is a dev template that tracks latest.
# hadolint ignore=DL3016
RUN npm install -g \
    typescript \
    typescript-language-server \
    pyright \
    vscode-langservers-extracted \
    @typescript-eslint/parser \
    @typescript-eslint/eslint-plugin \
    eslint

# ── User-level setup ──────────────────────────────────────────────────────────
USER ${USERNAME}
WORKDIR /home/${USERNAME}

# devcontainer runtime expects root as the final USER; remoteUser in
# devcontainer.json controls the actual connected user (vscode).
# hadolint ignore=DL3002
USER root
