// @ts-check

/**
 * What the manifests are not allowed to disagree about.
 *
 * Every rule here was a divergence that had already happened. `yarn constraints` reports them and
 * `yarn constraints --fix` repairs the unambiguous ones, so the answer to "which version do we use"
 * stops being whichever manifest was edited last.
 */

/** @type {import('@yarnpkg/types').Yarn.Config} */
module.exports = {
  constraints({ Yarn }) {
    // ── One version per dependency ───────────────────────────────────────────
    //
    // The cost of two is not theoretical here: `@tanstack/react-router` was pinned to 1.170.35 in
    // one playground and `^1.170.36` in the other two consumers, which put two routers on disk with
    // their whole transitive cascade doubled. A router is a *value* registered by a provider, so the
    // second copy is empty and every hook reading it throws on null — type-checked, built, and dead
    // on the page.
    //
    // `typescript` and `typescript-7` are deliberately two packages and are not affected by this
    // rule: they are different idents. Nothing below may merge them.
    for (const dependency of Yarn.dependencies()) {
      // A peer range is a statement about what a consumer must provide, not about what this
      // repository installs. `^19.3.0` in devDependencies beside `^19.0.0` in peerDependencies is
      // the intended shape, and unifying the two would ask consumers for more than the code needs.
      if (dependency.type === `peerDependencies`) {
        continue;
      }

      for (const other of Yarn.dependencies({ ident: dependency.ident })) {
        if (other.type === `peerDependencies`) {
          continue;
        }
        dependency.update(other.range);
      }
    }

    // ── One Yarn, named once ─────────────────────────────────────────────────
    //
    // Yarn reads `packageManager` from the project root and nowhere else, so a copy in a nested
    // manifest is decoration that can drift out of step with the release actually vendored in
    // `.yarn/releases`.
    for (const workspace of Yarn.workspaces()) {
      if (workspace.cwd !== `.`) {
        workspace.unset(`packageManager`);
      }
    }

    // ── The hoisting boundary, and the one place it must not be set ──────────
    //
    // `installConfig.hoistingLimits: "workspaces"` keeps a package's dependencies under that package
    // instead of at the root. It belongs on every workspace that owns a dependency tree — and must
    // never be set on a workspace nested inside another one.
    //
    // A nested workspace already lives inside its parent's boundary and shares its single copy of
    // everything; today `packages/*/playground/node_modules/` holds nothing but Vite's caches. Set
    // the limit there and the playground gets a Vite of its own. Two copies of the *same* Vite are
    // not interchangeable to TypeScript: `Plugin` reaches `EnvironmentPluginContainer`, which has a
    // private `_pluginContextMap`, and private members are nominal. The two `Plugin` types stop
    // being assignable and the config that imports a shared plugin stops type-checking.
    //
    // `.yarnrc.yml` records the same lesson about the project-wide `nmHoistingLimits` key, which was
    // tried and reverted. This is the per-package form, and the nesting test is what keeps it safe.
    // The rule is asymmetric on purpose. **Forbidden** where it breaks something, **required** where
    // it protects something, and silent everywhere else — because forcing it uniformly breaks a
    // third thing: gnomon's only dependencies are tools run as binaries, and taking them down into
    // its own tree removes `oxfmt` from the root `node_modules/.bin`, which is what an editor's
    // language server resolves. A limit that protects no type and costs a working formatter is not
    // uniformity, it is damage.
    const OWNS_A_TYPED_TREE = [
      `packages/umbra`,
      `packages/antumbra`,
      `packages/corona`,
      `packages/limb`,
      `apps/home`,
    ];

    const roots = Yarn.workspaces()
      .map((workspace) => {
        return workspace.cwd;
      })
      .filter((cwd) => {
        return cwd !== `.`;
      });

    for (const workspace of Yarn.workspaces()) {
      const cwd = workspace.cwd;

      // The project root owns no dependency tree of its own to keep down here.
      if (cwd === `.`) {
        workspace.unset(`installConfig.hoistingLimits`);
        continue;
      }

      const nested = roots.some((other) => {
        return other !== cwd && cwd.startsWith(`${other}/`);
      });

      if (nested) {
        workspace.unset(`installConfig.hoistingLimits`);
      } else if (OWNS_A_TYPED_TREE.includes(cwd)) {
        workspace.set(`installConfig.hoistingLimits`, `workspaces`);
      }
    }

    // ── Facts every manifest states the same way ─────────────────────────────
    //
    // `engines.node` is a floor the *code* declares, so it belongs on every workspace: a playground
    // runs under Node the same way a library does.
    //
    // `license`, `author` and `repository` describe a **published artefact**, so they belong only on
    // the workspaces that could be published. Setting them on a private playground states something
    // about a package nobody will ever fetch, and a manifest full of fields nothing reads is how a
    // reader stops trusting the ones that matter.
    for (const workspace of Yarn.workspaces()) {
      if (workspace.cwd === `.`) {
        continue;
      }

      workspace.set(`engines.node`, `>=24`);

      if (workspace.manifest.private === true) {
        continue;
      }

      workspace.set(`license`, `MIT`);
      workspace.set(`author`, `Francis Desjardins <francis.desjardins@gmail.com>`);
      workspace.set(`repository.type`, `git`);
      workspace.set(`repository.url`, `git+https://github.com/francisdesjardins/syzygy.git`);
      workspace.set(`repository.directory`, workspace.cwd);
    }

    // ── Nothing may be invisible to `foreach` ────────────────────────────────
    //
    // `yarn workspaces foreach --all run check` exits **0** when no workspace answers to the script,
    // so a missing one is not a failure — it is a silent absence. gnomon carried 869 lines of the
    // gates themselves and was linted, formatted and type-checked by nothing at all, for exactly
    // this reason.
    //
    // An explicit no-op counts, and is required to say why it is one.
    for (const workspace of Yarn.workspaces()) {
      for (const script of [`check`, `test`]) {
        if (typeof workspace.manifest.scripts?.[script] !== `string`) {
          workspace.error(
            `Missing a \`${script}\` script. An explicit no-op counts — \`echo "<name>: no-op — <reason>"\` — but the reason has to be written down, because \`foreach\` cannot tell a deliberate absence from an oversight.`
          );
        }
      }
    }

    // ── One name, one command ────────────────────────────────────────────────
    //
    // Twenty-five script names are declared by two to five workspaces each, and Yarn has no way to
    // inherit one — so the body is written out every time. That duplication is the tool's and is
    // left alone: a manifest that hides what its commands actually run is worse. **What is not
    // left alone is the drift**, which is the part that costs something and the part nobody sees:
    // `oxlint --type-aware` in four manifests and `oxlint` in the fifth is a package linted to a
    // different standard, and it reads as identical in every diff that does not put the two lines
    // side by side. The lint configs had drifted exactly that way before they were merged.
    //
    // So: a name declared more than once must mean the same command everywhere, unless it is named
    // below. The list is short on purpose — it is the set of scripts that are genuinely each
    // workspace's own, and adding to it is how a deliberate divergence gets recorded.
    const PER_WORKSPACE = new Map([
      [`check`, `each workspace's own gate, and the no-ops say what they are instead of running`],
      [`test`, `the same: two suites, one suite, or a no-op naming where the tests really run`],
      [`verify:all`, `a library verifies its package and its demo; an app builds`],
      [`type-check`, `a library checks two programs, the playground and the fixtures; an app one`],
      [`dev`, `a library delegates to its playground; a playground and an app run vite`],
      [`build`, `a library emits a bundle and declarations; a playground and an app run vite`],
      [`check:contrast`, `the site measures three skins, a playground measures its one`],
      [`test:component`, `the projects differ — antumbra has touch and focus legs umbra has not`],
      [`test:component:coverage`, `the same projects, instrumented`],
      [`playground:build`, `names its own playground workspace`],
      [`playground:build:file`, `names its own playground workspace`],
      [`playground:preview`, `names its own playground workspace`],
    ]);

    const bodies = new Map();
    for (const workspace of Yarn.workspaces()) {
      for (const [script, body] of Object.entries(workspace.manifest.scripts ?? {})) {
        if (PER_WORKSPACE.has(script)) {
          continue;
        }
        if (!bodies.has(script)) {
          bodies.set(script, []);
        }
        bodies.get(script).push({ workspace, body });
      }
    }

    for (const [script, declared] of bodies) {
      if (declared.length < 2) {
        continue;
      }
      // The first workspace in dependency order is the reference, so the message names one body to
      // move towards rather than reporting two halves of a disagreement.
      const [reference] = declared;
      const where =
        reference.workspace.cwd === `.` ? `the repository root` : reference.workspace.cwd;
      for (const { workspace, body } of declared) {
        if (body !== reference.body) {
          workspace.error(
            `\`${script}\` is \`${body}\` here and \`${reference.body}\` in ${where}. A name declared in more than one workspace has to mean the same command in all of them — a flag that exists in four manifests and not the fifth is a package held to a different standard, and it reads as identical in every diff. If the difference is deliberate, add \`${script}\` to PER_WORKSPACE in yarn.config.cjs with the reason.`
          );
        }
      }
    }
  },
};
