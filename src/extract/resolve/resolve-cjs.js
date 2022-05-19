const path = require("path");
const { builtinModules } = require("module");
const pathToPosix = require("../utl/path-to-posix");
const { isFollowable } = require("./module-classifiers");
const resolve = require("./resolve");

function addResolutionAttributes(
  pBaseDirectory,
  pModuleName,
  pFileDirectory,
  pResolveOptions
) {
  let lReturnValue = {};

  if (builtinModules.includes(pModuleName)) {
    lReturnValue.coreModule = true;
  } else {
    try {
      let lModulePath = "";
      try {
        lModulePath = path.relative(
          pBaseDirectory,
          resolve(pModuleName, pFileDirectory, pResolveOptions)
        );
      } catch (pError) {
        lModulePath = require.resolve(pModuleName);
      }
      lReturnValue.resolved = pathToPosix(lModulePath);
      lReturnValue.followable = isFollowable(
        lReturnValue.resolved,
        pResolveOptions
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
module.exports = function resolveCommonJS(
  pStrippedModuleName,
  pBaseDirectory,
  pFileDirectory,
  pResolveOptions
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
      pResolveOptions
    ),
  };
};
