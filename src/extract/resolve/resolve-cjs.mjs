import { relative } from "node:path";
import { createRequire } from "node:module";
import { isFollowable } from "./module-classifiers.mjs";
import { resolve } from "./resolve.mjs";
import { isBuiltin } from "./is-built-in.mjs";
import pathToPosix from "#utl/path-to-posix.mjs";

const require = createRequire(import.meta.url);

function addResolutionAttributes(
  pBaseDirectory,
  pModuleName,
  pFileDirectory,
  pResolveOptions,
) {
  let lReturnValue = {};

  if (isBuiltin(pModuleName, pResolveOptions)) {
    lReturnValue.coreModule = true;
  } else {
    try {
      let lModulePath = "";
      try {
        lModulePath = relative(
          pBaseDirectory,
          resolve(pModuleName, pFileDirectory, pResolveOptions),
        );
      } catch (pError) {
        lModulePath = require.resolve(pModuleName);
      }
      lReturnValue.resolved = pathToPosix(lModulePath);
      lReturnValue.followable = isFollowable(
        lReturnValue.resolved,
        pResolveOptions,
      );
    } catch (pError) {
      lReturnValue.couldNotResolve = true;
    }
  }
  return lReturnValue;
}

/*
 * resolves both CommonJS and ES6
 */
export default function resolveCommonJS(
  pStrippedModuleName,
  pBaseDirectory,
  pFileDirectory,
  pResolveOptions,
) {
  return {
    resolved: pStrippedModuleName,
    coreModule: false,
    followable: false,
    couldNotResolve: false,
    ...addResolutionAttributes(
      pBaseDirectory,
      pStrippedModuleName,
      pFileDirectory,
      pResolveOptions,
    ),
  };
}
